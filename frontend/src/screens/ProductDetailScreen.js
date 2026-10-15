import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const chartWidth = 300;
const chartHeight = 110;

// REGIONAL ECONOMIC MULTIPLIERS FOR SRI LANKAN MARKETS
const REGIONAL_MARKETS = {
  'Kurunegala Market': { rate: 1.0, location: 'Kurunegala' },
  'Colombo Market': { rate: 1.25, location: 'Colombo' },
  'Dambulla Market': { rate: 0.82, location: 'Dambulla' },
  'Kandy Market': { rate: 1.10, location: 'Kandy' },
  'Matale Market': { rate: 0.95, location: 'Matale' },
  'Gampaha Market': { rate: 1.18, location: 'Gampaha' },
};

const CROP_BASELINES = {
  Carrots: { yesterday: 210, today: 220, shelfLife: '7 days' },
  Cabbage: { yesterday: 220, today: 230, shelfLife: '10 days' },
  Tomatoes: { yesterday: 170, today: 180, shelfLife: '5 days' },
  Potatoes: { yesterday: 135, today: 140, shelfLife: '21 days' },
  Leeks: { yesterday: 190, today: 190, shelfLife: '3 days' },
};

export default function ProductDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const item = route?.params?.item || {
    _id: 'default',
    cropName: 'Carrots',
    sellingPricePerKg: 220,
    yesterdayPrice: 210,
    quantityKg: 30,
    location: 'Kurunegala',
    freshness: 'Today',
    harvestDate: 'Today',
    photoUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500',
    description: 'Fresh and organic produce from local farmers.',
  };

  const [productItem, setProductItem] = useState(item);

  // Sync latest produce data from backend if valid ObjectId
  useEffect(() => {
    if (item?._id && item._id.length === 24) {
      api.get(`/produce/${item._id}`)
        .then((res) => {
          if (res.data) {
            setProductItem(res.data);
            if (res.data.sellingPricePerKg !== undefined) {
              setSellingPrice(res.data.sellingPricePerKg);
              setEditPriceInput(String(res.data.sellingPricePerKg));
            }
            if (res.data.quantityKg !== undefined) {
              setQuantity(res.data.quantityKg);
              setEditQtyInput(String(res.data.quantityKg));
            }
          }
        })
        .catch((err) => {
          console.log('Product fetch error:', err.message);
        });
    }
  }, [item?._id]);

  const currentUserId = user?.id || user?._id;
  const rawFarmerId = productItem?.farmerId || item?.farmerId;
  const itemFarmerId = (rawFarmerId && typeof rawFarmerId === 'object')
    ? (rawFarmerId._id || rawFarmerId.id)
    : rawFarmerId;

  // STRICT OWNER VERIFICATION: Only the specific farmer who added this product can edit/delete
  const isOwner = Boolean(
    currentUserId &&
    itemFarmerId &&
    String(currentUserId) === String(itemFarmerId)
  );

  const [selectedMarket, setSelectedMarket] = useState(
    item.location ? `${item.location} Market` : 'Kurunegala Market'
  );
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const marketInfo = REGIONAL_MARKETS[selectedMarket] || REGIONAL_MARKETS['Kurunegala Market'];
  const multiplier = marketInfo.rate;
  const currentLocation = marketInfo.location;

  const cropBaseline = CROP_BASELINES[item.cropName] || CROP_BASELINES['Carrots'];
  const officialTodayMarketPrice = Math.round(cropBaseline.today * multiplier);
  const fixedYesterdayPrice = Math.round(cropBaseline.yesterday * multiplier);

  // Initialize with the item's actual listed price & quantity if available
  const initialPrice = item.sellingPricePerKg !== undefined
    ? Number(item.sellingPricePerKg)
    : officialTodayMarketPrice;
  const initialQty = item.quantityKg !== undefined
    ? Number(item.quantityKg)
    : 30;

  const [sellingPrice, setSellingPrice] = useState(initialPrice);
  const [quantity, setQuantity] = useState(initialQty);

  const [editPriceInput, setEditPriceInput] = useState(String(initialPrice));
  const [editQtyInput, setEditQtyInput] = useState(String(initialQty));

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSelectMarket = (m) => {
    setSelectedMarket(m);
    const newRate = REGIONAL_MARKETS[m]?.rate || 1.0;
    const newPrice = Math.round(cropBaseline.today * newRate);
    setSellingPrice(newPrice);
    setEditPriceInput(String(newPrice));
    setMarketModalVisible(false);
  };

  const handleOpenEditModal = () => {
    if (!isOwner) {
      showMessage('Permission Denied', 'You can only edit products you added yourself.');
      return;
    }
    setEditPriceInput(String(sellingPrice));
    setEditQtyInput(String(quantity));
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!isOwner) {
      showMessage('Permission Denied', 'You can only edit products you added yourself.');
      return;
    }

    const newPriceNum = Number(editPriceInput);
    const newQtyNum = Number(editQtyInput);

    if (isNaN(newPriceNum) || isNaN(newQtyNum) || newPriceNum <= 0 || newQtyNum <= 0) {
      showMessage('Invalid values', 'Please enter valid positive numbers for price and quantity.');
      return;
    }

    setSaving(true);
    try {
      if (item._id && item._id.length === 24) {
        await api.put(`/produce/${item._id}`, {
          sellingPricePerKg: newPriceNum,
          quantityKg: newQtyNum,
        });
      }

      setSellingPrice(newPriceNum);
      setQuantity(newQtyNum);
      if (item) {
        item.sellingPricePerKg = newPriceNum;
        item.quantityKg = newQtyNum;
      }
      setProductItem((prev) => ({
        ...prev,
        sellingPricePerKg: newPriceNum,
        quantityKg: newQtyNum,
      }));
      setEditModalVisible(false);
      showMessage(
        'Listing Updated!',
        `Your selling price is now Rs. ${newPriceNum} /kg\nAvailable Quantity: ${newQtyNum} kg`
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Unable to update listing.';
      showMessage('Unable to update listing', errMsg);
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    try {
      if (item._id && item._id.length === 24) {
        await api.delete(`/produce/${item._id}`);
      }
    } catch (error) {
      showMessage('Unable to delete listing', error.response?.data?.message || error.message);
      return;
    }

    showMessage('Deleted', `${item.cropName} listing removed successfully.`);
    navigation.navigate('MarketPrices', { refresh: Date.now() });
  };

  const handleDelete = () => {
    if (!isOwner) {
      showMessage('Permission Denied', 'You can only delete products you added yourself.');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete ${item.cropName} from the marketplace?`);
      if (confirmed) executeDelete();
    } else {
      Alert.alert('Delete Listing', `Are you sure you want to remove ${item.cropName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: executeDelete },
      ]);
    }
  };

  // --- ECONOMIC COMPARISON CALCULATIONS ---
  const priceDiffWithYesterday = sellingPrice - fixedYesterdayPrice;
  const isHigherThanYesterday = priceDiffWithYesterday > 0;
  const isLowerThanYesterday = priceDiffWithYesterday < 0;
  const isSameAsYesterday = priceDiffWithYesterday === 0;

  const marketDifference = sellingPrice - officialTodayMarketPrice;

  // 7-Day Trend
  const weeklyHistory = [
    { day: 'MON', price: Math.round(cropBaseline.today * multiplier * 0.88), change: '- Rs. 10' },
    { day: 'TUE', price: Math.round(cropBaseline.today * multiplier * 0.92), change: '+ Rs. 8' },
    { day: 'WED', price: Math.round(cropBaseline.today * multiplier * 0.95), change: '+ Rs. 5' },
    { day: 'THU', price: Math.round(cropBaseline.today * multiplier * 0.98), change: '+ Rs. 5' },
    { day: 'FRI', price: Math.round(cropBaseline.today * multiplier * 1.06), change: '+ Rs. 15' },
    { day: 'SAT', price: Math.round(cropBaseline.today * multiplier * 0.94), change: '- Rs. 20' },
    { day: 'SUN', price: officialTodayMarketPrice, change: '+ Rs. 10' },
  ];

  const [activeDay, setActiveDay] = useState(weeklyHistory[6]);

  const prices = weeklyHistory.map((d) => d.price);
  const minPrice = Math.min(...prices) - 15;
  const maxPrice = Math.max(...prices) + 15;
  const availableWidth = chartWidth - 55;

  const points = weeklyHistory.map((d, index) => {
    const x = 12 + (index * availableWidth) / (weeklyHistory.length - 1);
    const y = chartHeight - 20 - ((d.price - minPrice) / (maxPrice - minPrice)) * (chartHeight - 40);
    return { x, y, ...d };
  });

  const pathData = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const fillPathData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - 15} L ${points[0].x} ${chartHeight - 15} Z`;

  // Freshness calculation
  const isHarvestedToday = item.freshness === 'Today' || !item.freshness;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Market Prices</Text>
          <View style={{ width: 38 }} />
        </SafeAreaView>

        {/* Location Dropdown Pill */}
        <TouchableOpacity
          style={styles.locationPill}
          activeOpacity={0.8}
          onPress={() => setMarketModalVisible(true)}
        >
          <Ionicons name="location-outline" size={14} color="#2e7d32" />
          <Text style={styles.locationText}>{selectedMarket}</Text>
          <Ionicons name="chevron-down" size={14} color="#2e7d32" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Crop Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.photoUrl }} style={styles.mainImage} />
        </View>

        {/* Details Section */}
        <View style={styles.content}>
          <View style={styles.rowAlign}>
            <MaterialCommunityIcons name="sprout" size={22} color="#2e7d32" />
            <Text style={styles.cropTitle}>{item.cropName}</Text>
          </View>
          <Text style={styles.cropSub}>Fresh and organic {item.cropName.toLowerCase()} from local farmers</Text>

          {/* 🌟 PROMINENT FRESHNESS & SHELF LIFE BADGE */}
          <View style={[styles.freshnessBadgeContainer, !isHarvestedToday && styles.freshnessBadgeAmber]}>
            <View style={styles.rowAlign}>
              <Ionicons
                name={isHarvestedToday ? 'sparkles' : 'time'}
                size={18}
                color={isHarvestedToday ? '#1b5e20' : '#b7791f'}
              />
              <Text style={[styles.freshnessBadgeTitle, !isHarvestedToday && { color: '#b7791f' }]}>
                {isHarvestedToday ? '🌱 Harvested Today (Peak Freshness)' : '🌿 Harvested Yesterday'}
              </Text>
            </View>
            <Text style={styles.shelfLifeText}>
              Estimated Shelf Life: ~{cropBaseline.shelfLife} remaining
            </Text>
          </View>

          {/* Big Selling Price */}
          <View style={[styles.rowAlign, { marginTop: 10 }]}>
            <Text style={styles.priceHighlight}>Rs. {sellingPrice} <Text style={styles.perKg}>/kg</Text></Text>
            <View style={styles.todayPriceBadge}>
              <Text style={styles.todayPriceText}>Your Price</Text>
            </View>
          </View>

          {/* 3 Metric Badges */}
          <View style={styles.metricRow}>
            {/* 1. YESTERDAY BADGE */}
            <View
              style={[
                styles.metricCard,
                isLowerThanYesterday && { backgroundColor: '#ffebee' },
                isHigherThanYesterday && { backgroundColor: '#eaf4eb' },
                isSameAsYesterday && { backgroundColor: '#f5f5f5' },
              ]}
            >
              <Ionicons
                name={isHigherThanYesterday ? 'arrow-up' : isLowerThanYesterday ? 'arrow-down' : 'remove'}
                size={16}
                color={isHigherThanYesterday ? '#2e7d32' : isLowerThanYesterday ? '#c62828' : '#666'}
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.metricLabel}>Yesterday Market</Text>
                <Text
                  style={[
                    styles.metricValue,
                    isLowerThanYesterday && { color: '#c62828' },
                    isHigherThanYesterday && { color: '#2e7d32' },
                    isSameAsYesterday && { color: '#666' },
                  ]}
                >
                  Rs. {fixedYesterdayPrice} /kg
                </Text>
                <Text style={styles.diffSubText}>
                  {isSameAsYesterday
                    ? '(Same)'
                    : isHigherThanYesterday
                    ? `(+Rs. ${priceDiffWithYesterday})`
                    : `(-Rs. ${Math.abs(priceDiffWithYesterday)})`}
                </Text>
              </View>
            </View>

            {/* 2. MARKET LOCATION */}
            <View style={styles.metricCard}>
              <Ionicons name="location" size={16} color="#2e7d32" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.metricLabel}>Market</Text>
                <Text style={styles.metricValue}>{currentLocation}</Text>
              </View>
            </View>

            {/* 3. AVAILABLE QUANTITY */}
            <View style={styles.metricCard}>
              <MaterialCommunityIcons name="package-variant-closed" size={16} color="#2e7d32" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.metricLabel}>Available qty</Text>
                <Text style={styles.metricValue}>{quantity} kg</Text>
              </View>
            </View>
          </View>

          {/* MARKET DEAL COMPARISON BANNER */}
          <View style={styles.marketComparisonBanner}>
            {marketDifference === 0 ? (
              <View style={styles.rowAlign}>
                <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
                <Text style={[styles.marketCompText, { color: '#2e7d32' }]}>
                  Matches today’s {currentLocation} market price (Rs. {officialTodayMarketPrice}/kg)
                </Text>
              </View>
            ) : marketDifference < 0 ? (
              <View style={styles.rowAlign}>
                <Ionicons name="pricetag" size={18} color="#2e7d32" />
                <Text style={[styles.marketCompText, { color: '#2e7d32' }]}>
                  Great Deal! Rs. {Math.abs(marketDifference)} /kg below {currentLocation} market price!
                </Text>
              </View>
            ) : (
              <View style={styles.rowAlign}>
                <Ionicons name="ribbon" size={18} color="#e6a100" />
                <Text style={[styles.marketCompText, { color: '#b7791f' }]}>
                  Premium Quality: Rs. {marketDifference} /kg above {currentLocation} market rate
                </Text>
              </View>
            )}
          </View>

          {/* OFFICIAL 7-DAY CHART */}
          <Text style={styles.chartHeaderTitle}>
            Official {currentLocation} Market Trend (7 Days)
          </Text>

          <View style={styles.tooltipBanner}>
            <View style={styles.rowAlign}>
              <Ionicons name="stats-chart" size={16} color="#2e7d32" />
              <Text style={styles.tooltipDayText}>{activeDay.day} market benchmark:</Text>
            </View>
            <Text style={styles.tooltipPriceText}>
              Rs. {activeDay.price} /kg <Text style={styles.tooltipChange}>({activeDay.change})</Text>
            </Text>
          </View>

          <View style={styles.chartWrapper}>
            <View style={styles.yAxisLabels}>
              <Text style={styles.axisText}>{Math.round(maxPrice)}</Text>
              <Text style={styles.axisText}>{Math.round((maxPrice + minPrice) / 2)}</Text>
              <Text style={styles.axisText}>{Math.round(minPrice)}</Text>
            </View>

            <View style={styles.svgClipContainer}>
              <Svg width={availableWidth + 24} height={chartHeight}>
                <Defs>
                  <SvgGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#4caf50" stopOpacity="0.3" />
                    <Stop offset="100%" stopColor="#4caf50" stopOpacity="0.0" />
                  </SvgGradient>
                </Defs>

                <Line x1="0" y1="20" x2={availableWidth + 20} y2="20" stroke="#e0e0e0" strokeDasharray="4 4" strokeWidth="1" />
                <Line x1="0" y1="55" x2={availableWidth + 20} y2="55" stroke="#e0e0e0" strokeDasharray="4 4" strokeWidth="1" />
                <Line x1="0" y1="90" x2={availableWidth + 20} y2="90" stroke="#e0e0e0" strokeDasharray="4 4" strokeWidth="1" />

                <Path d={fillPathData} fill="url(#detailGradient)" />
                <Path d={pathData} stroke="#2e7d32" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {points.map((p, i) => (
                  <Circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={activeDay.day === p.day ? 6.5 : 4}
                    fill={activeDay.day === p.day ? '#2e7d32' : '#ffffff'}
                    stroke="#2e7d32"
                    strokeWidth={activeDay.day === p.day ? 2.5 : 1.8}
                    onPress={() => setActiveDay(p)}
                  />
                ))}
              </Svg>
            </View>
          </View>

          {/* X-Axis Days */}
          <View style={styles.xAxisRow}>
            {weeklyHistory.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayButton, activeDay.day === d.day && styles.dayButtonActive]}
                onPress={() => setActiveDay(d)}
              >
                <Text style={[styles.dayButtonText, activeDay.day === d.day && styles.dayButtonTextActive]}>
                  {d.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>
            Fresh {item.cropName.toLowerCase()} sourced for {currentLocation} Market. Handpicked and packed in standard crates.
          </Text>

          {/* CRUD ACTION BUTTONS - Only shown if logged-in farmer added this produce */}
          {isOwner ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={handleOpenEditModal}>
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Edit Stock / Price</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.85} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ownerNoticeBox}>
              <View style={styles.ownerNoticeIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#2e7d32" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ownerNoticeTitle}>
                  Seller: {productItem?.farmer || item?.farmer || 'Local Farmer'}
                </Text>
                <Text style={styles.ownerNoticeSub}>
                  Only the farmer who listed this produce can edit stock or delete it.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Select Market Bottom Sheet */}
      {marketModalVisible && (
        <View style={styles.inScreenModalOverlay}>
          <TouchableOpacity
            style={styles.backdropDismiss}
            activeOpacity={1}
            onPress={() => setMarketModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Select Market</Text>
              <TouchableOpacity onPress={() => setMarketModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {Object.keys(REGIONAL_MARKETS).map((m, i) => (
              <TouchableOpacity
                key={i}
                style={styles.marketOption}
                onPress={() => handleSelectMarket(m)}
              >
                <Ionicons
                  name={selectedMarket === m ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedMarket === m ? '#2e7d32' : '#888'}
                />
                <Text style={styles.marketOptionText}>{m}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.doneBtn} onPress={() => setMarketModalVisible(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      {editModalVisible && (
        <View style={styles.editModalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropTouch}
            activeOpacity={1}
            onPress={() => !saving && setEditModalVisible(false)}
          />

          <View style={styles.editModalContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Update Produce Stock</Text>
              <TouchableOpacity
                onPress={() => !saving && setEditModalVisible(false)}
                disabled={saving}
                style={{ padding: 4 }}
              >
                <Ionicons name="close-circle" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>New Selling Price (Rs/kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editPriceInput}
              onChangeText={setEditPriceInput}
              placeholder="e.g. 180"
              editable={!saving}
            />

            <Text style={styles.inputLabel}>New Available Quantity (kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editQtyInput}
              onChangeText={setEditQtyInput}
              placeholder="e.g. 15"
              editable={!saving}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => !saving && setEditModalVisible(false)}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDECEB', position: 'relative' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 44 : 14,
    height: Platform.OS === 'web' ? 84 : 54,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1B2E1E', textAlign: 'center' },
  locationPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  locationText: { fontSize: 13, color: '#2E7D32', marginLeft: 6, fontWeight: '700' },
  imageContainer: { paddingHorizontal: 18, marginTop: 14 },
  mainImage: { width: '100%', height: 180, borderRadius: 22 },
  content: { paddingHorizontal: 18, marginTop: 14, paddingBottom: 40 },
  cropTitle: { fontSize: 22, fontWeight: '800', color: '#1B2E1E', marginLeft: 6 },
  cropSub: { fontSize: 13, color: '#5A6E5D', marginTop: 4 },

  // Freshness & Shelf Life Badge Container
  freshnessBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  freshnessBadgeAmber: {
    backgroundColor: 'rgba(255, 248, 225, 0.85)',
    borderColor: 'rgba(255, 224, 130, 0.9)',
  },
  freshnessBadgeTitle: { fontSize: 14, fontWeight: '700', color: '#1B5E20', marginLeft: 6 },
  shelfLifeText: { fontSize: 12, color: '#5A6E5D', marginTop: 4, marginLeft: 24 },

  priceHighlight: { fontSize: 26, fontWeight: '900', color: '#1B2E1E' },
  perKg: { fontSize: 14, color: '#5A6E5D', fontWeight: 'normal' },
  todayPriceBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.25)',
  },
  todayPriceText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  metricLabel: { fontSize: 10, color: '#5A6E5D' },
  metricValue: { fontSize: 11, fontWeight: '700', color: '#1B2E1E' },
  diffSubText: { fontSize: 9, fontWeight: 'bold', marginTop: 1 },
  marketComparisonBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  marketCompText: { fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1, color: '#1B2E1E' },
  chartHeaderTitle: { fontSize: 13, fontWeight: '700', color: '#1B2E1E', marginTop: 18, marginBottom: 4 },
  tooltipBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipDayText: { fontSize: 12, fontWeight: '700', color: '#2E7D32', marginLeft: 4 },
  tooltipPriceText: { fontSize: 13, fontWeight: '700', color: '#1B2E1E' },
  tooltipChange: { fontSize: 11, color: '#5A6E5D', fontWeight: 'normal' },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    padding: 14,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  yAxisLabels: { justifyContent: 'space-between', height: chartHeight - 20, paddingRight: 4, width: 28 },
  axisText: { fontSize: 10, color: '#5A6E5D', fontWeight: '600' },
  svgClipContainer: { flex: 1, overflow: 'hidden' },
  xAxisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 16 },
  dayButton: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 10 },
  dayButtonActive: { backgroundColor: '#2E7D32' },
  dayButtonText: { fontSize: 10, fontWeight: '600', color: '#5A6E5D' },
  dayButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  descTitle: { fontSize: 16, fontWeight: '700', color: '#1B2E1E', marginTop: 18 },
  descText: { fontSize: 13, color: '#5A6E5D', lineHeight: 20, marginTop: 6 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C62828',
    paddingVertical: 14,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#C62828',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },

  // IN-SCREEN SELECT MARKET MODAL STYLES
  inScreenModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    zIndex: 999999,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(24px)' } : {}),
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1B2E1E', marginBottom: 12 },
  marketOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  marketOptionText: { fontSize: 16, color: '#1B2E1E', marginLeft: 12, fontWeight: '600' },
  doneBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // EDIT MODAL STYLES
  editModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999999,
  },
  modalBackdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  editModalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 26,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(24px)' } : {}),
  },
  backdropDismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  inputLabel: { fontSize: 13, color: '#5A6E5D', marginTop: 12, marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    color: '#1B2E1E',
  },
  saveBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: '#5A6E5D', fontSize: 14, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownerNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 18,
    padding: 14,
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  ownerNoticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4D27',
  },
  ownerNoticeSub: {
    fontSize: 12,
    color: '#5A6E5D',
    marginTop: 2,
  },
});