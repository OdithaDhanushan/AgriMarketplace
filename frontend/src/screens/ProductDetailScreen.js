import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import api from '../services/api';

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

  const [selectedMarket, setSelectedMarket] = useState(
    item.location ? `${item.location} Market` : 'Kurunegala Market'
  );
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const marketInfo = REGIONAL_MARKETS[selectedMarket] || REGIONAL_MARKETS['Kurunegala Market'];
  const multiplier = marketInfo.rate;
  const currentLocation = marketInfo.location;

  const cropBaseline = CROP_BASELINES[item.cropName] || CROP_BASELINES['Carrots'];
  const officialTodayMarketPrice = Math.round(cropBaseline.today * multiplier);
  const fixedYesterdayPrice = Math.round(cropBaseline.yesterday * multiplier);

  const [sellingPrice, setSellingPrice] = useState(officialTodayMarketPrice);
  const [quantity, setQuantity] = useState(item.quantityKg || 30);

  const [editPriceInput, setEditPriceInput] = useState(String(sellingPrice));
  const [editQtyInput, setEditQtyInput] = useState(String(quantity));

  const handleSelectMarket = (m) => {
    setSelectedMarket(m);
    const newRate = REGIONAL_MARKETS[m]?.rate || 1.0;
    const newPrice = Math.round(cropBaseline.today * newRate);
    setSellingPrice(newPrice);
    setEditPriceInput(String(newPrice));
    setMarketModalVisible(false);
  };

  const handleOpenEditModal = () => {
    setEditPriceInput(String(sellingPrice));
    setEditQtyInput(String(quantity));
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    const newPriceNum = Number(editPriceInput);
    const newQtyNum = Number(editQtyInput);

    if (isNaN(newPriceNum) || isNaN(newQtyNum) || newPriceNum <= 0 || newQtyNum <= 0) {
      Alert.alert('Invalid values', 'Please enter valid positive numbers for price and quantity.');
      return;
    }

    try {
      if (item._id && item._id.length === 24) {
        await api.put(`/produce/${item._id}`, {
          sellingPricePerKg: newPriceNum,
          quantityKg: newQtyNum,
        });
      }
    } catch (error) {
      Alert.alert('Unable to update listing', error.response?.data?.message || error.message);
      return;
    }

    setSellingPrice(newPriceNum);
    setQuantity(newQtyNum);
    setEditModalVisible(false);
    Alert.alert(
      '✅ Listing Updated!',
      `Your selling price is now Rs. ${newPriceNum} /kg\nAvailable Quantity: ${newQtyNum} kg`,
      [{ text: 'OK' }]
    );
  };

  const executeDelete = async () => {
    try {
      if (item._id && item._id.length === 24) {
        await api.delete(`/produce/${item._id}`);
      }
    } catch (error) {
      Alert.alert('Unable to delete listing', error.response?.data?.message || error.message);
      return;
    }

    if (Platform.OS === 'web') {
      window.alert(`${item.cropName} listing removed successfully.`);
    } else {
      Alert.alert('Deleted', `${item.cropName} removed successfully.`);
    }

    navigation.navigate('MarketPrices', { refresh: Date.now() });
  };

  const handleDelete = () => {
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
                  Matches today's {currentLocation} market price (Rs. {officialTodayMarketPrice}/kg)
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
              <Text style={styles.tooltipDayText}>{activeDay.day}'s Market Benchmark:</Text>
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

          {/* CRUD ACTION BUTTONS */}
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
            style={styles.backdropDismiss}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />

          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Update Produce Stock</Text>

            <Text style={styles.inputLabel}>New Selling Price (Rs/kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editPriceInput}
              onChangeText={setEditPriceInput}
            />

            <Text style={styles.inputLabel}>New Available Quantity (kg):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editQtyInput}
              onChangeText={setEditQtyInput}
            />

            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7', position: 'relative' },
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  locationPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4eb',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#cdecd3',
  },
  locationText: { fontSize: 13, color: '#2e7d32', marginLeft: 6, fontWeight: 'bold' },
  imageContainer: { paddingHorizontal: 18, marginTop: 14 },
  mainImage: { width: '100%', height: 180, borderRadius: 18 },
  content: { paddingHorizontal: 18, marginTop: 14 },
  cropTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', marginLeft: 6 },
  cropSub: { fontSize: 13, color: '#666', marginTop: 4 },

  // Freshness & Shelf Life Badge Container
  freshnessBadgeContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#c8e6c9',
  },
  freshnessBadgeAmber: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffe082',
  },
  freshnessBadgeTitle: { fontSize: 14, fontWeight: 'bold', color: '#1b5e20', marginLeft: 6 },
  shelfLifeText: { fontSize: 12, color: '#555', marginTop: 4, marginLeft: 24 },

  priceHighlight: { fontSize: 26, fontWeight: '900', color: '#222' },
  perKg: { fontSize: 14, color: '#666', fontWeight: 'normal' },
  todayPriceBadge: { backgroundColor: '#eaf4eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 },
  todayPriceText: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  metricCard: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 8, marginHorizontal: 3 },
  metricLabel: { fontSize: 10, color: '#666' },
  metricValue: { fontSize: 11, fontWeight: 'bold', color: '#222' },
  diffSubText: { fontSize: 9, fontWeight: 'bold', marginTop: 1 },
  marketComparisonBanner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  marketCompText: { fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 },
  chartHeaderTitle: { fontSize: 13, fontWeight: 'bold', color: '#555', marginTop: 18, marginBottom: 4 },
  tooltipBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  tooltipDayText: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginLeft: 4 },
  tooltipPriceText: { fontSize: 13, fontWeight: 'bold', color: '#222' },
  tooltipChange: { fontSize: 11, color: '#666', fontWeight: 'normal' },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  yAxisLabels: { justifyContent: 'space-between', height: chartHeight - 20, paddingRight: 4, width: 28 },
  axisText: { fontSize: 10, color: '#777', fontWeight: '600' },
  svgClipContainer: { flex: 1, overflow: 'hidden' },
  xAxisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 16 },
  dayButton: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6 },
  dayButtonActive: { backgroundColor: '#2e7d32' },
  dayButtonText: { fontSize: 10, fontWeight: '600', color: '#666' },
  dayButtonTextActive: { color: '#fff', fontWeight: 'bold' },
  descTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 18 },
  descText: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 6 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2e7d32', paddingVertical: 14, borderRadius: 24, marginRight: 8 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#c62828', paddingVertical: 14, borderRadius: 24, marginLeft: 8 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 10 },
  marketOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f3f3' },
  marketOptionText: { fontSize: 16, color: '#333', marginLeft: 12 },
  doneBtn: {
    backgroundColor: '#237330',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // EDIT MODAL STYLES
  editModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
    zIndex: 999999,
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  backdropDismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  inputLabel: { fontSize: 13, color: '#555', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, color: '#222' },
  saveBtn: { backgroundColor: '#2e7d32', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: '#777', fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});