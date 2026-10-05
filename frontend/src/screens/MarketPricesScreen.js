import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';

// Precise Chart Dimensions strictly contained inside the 412px Phone Chassis
const chartWidth = 300;
const chartHeight = 110;

// REGIONAL ECONOMIC CENTER DATA MAP (Sri Lankan Markets)
const REGIONAL_MARKET_DATA = {
  'Kurunegala Market': {
    location: 'Kurunegala',
    featured: {
      cropName: 'Tomatoes',
      todayPrice: 180,
      yesterdayPrice: 170,
      changeText: '+ Rs. 10',
      changeSub: 'From yesterday',
      trend: 'up',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
    },
    weeklyTrend: [
      { day: 'MON', price: 150, change: '- Rs. 10' },
      { day: 'TUE', price: 165, change: '+ Rs. 15' },
      { day: 'WED', price: 170, change: '+ Rs. 5' },
      { day: 'THU', price: 180, change: '+ Rs. 10' },
      { day: 'FRI', price: 195, change: '+ Rs. 15' },
      { day: 'SAT', price: 165, change: '- Rs. 30' },
      { day: 'SUN', price: 180, change: '+ Rs. 15' },
    ],
    otherProduce: [
      { name: 'Carrots', price: 220, tag: '↗ Rs. 15', tagType: 'green', photo: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' },
      // 🍉 Watermelon photo matching your Figma design!
      { name: 'Watermelon', price: 190, tag: '→ 0', tagType: 'gray', photo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Potatoes', price: 140, tag: '↗ Rs. 5', tagType: 'green', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' },
      { name: 'Cabbage', price: 260, tag: '↘ Rs. 10', tagType: 'red', photo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' },
    ],
  },

  'Colombo Market': {
    location: 'Colombo',
    featured: {
      cropName: 'Tomatoes',
      todayPrice: 240,
      yesterdayPrice: 220,
      changeText: '+ Rs. 20',
      changeSub: 'From yesterday',
      trend: 'up',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
    },
    weeklyTrend: [
      { day: 'MON', price: 210, change: '- Rs. 10' },
      { day: 'TUE', price: 220, change: '+ Rs. 10' },
      { day: 'WED', price: 225, change: '+ Rs. 5' },
      { day: 'THU', price: 230, change: '+ Rs. 5' },
      { day: 'FRI', price: 255, change: '+ Rs. 25' },
      { day: 'SAT', price: 230, change: '- Rs. 25' },
      { day: 'SUN', price: 240, change: '+ Rs. 10' },
    ],
    otherProduce: [
      { name: 'Carrots', price: 290, tag: '↗ Rs. 25', tagType: 'green', photo: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' },
      { name: 'Watermelon', price: 190, tag: '→ 0', tagType: 'gray', photo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Potatoes', price: 185, tag: '↗ Rs. 15', tagType: 'green', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' },
      { name: 'Cabbage', price: 320, tag: '↘ Rs. 15', tagType: 'red', photo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' },
    ],
  },

  'Dambulla Market': {
    location: 'Dambulla',
    featured: {
      cropName: 'Tomatoes',
      todayPrice: 140,
      yesterdayPrice: 130,
      changeText: '+ Rs. 10',
      changeSub: 'Wholesale Hub',
      trend: 'up',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
    },
    weeklyTrend: [
      { day: 'MON', price: 120, change: '- Rs. 5' },
      { day: 'TUE', price: 125, change: '+ Rs. 5' },
      { day: 'WED', price: 130, change: '+ Rs. 5' },
      { day: 'THU', price: 135, change: '+ Rs. 5' },
      { day: 'FRI', price: 150, change: '+ Rs. 15' },
      { day: 'SAT', price: 130, change: '- Rs. 20' },
      { day: 'SUN', price: 140, change: '+ Rs. 10' },
    ],
    otherProduce: [
      { name: 'Carrots', price: 175, tag: '↗ Rs. 10', tagType: 'green', photo: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' },
      { name: 'Watermelon', price: 190, tag: '→ 0', tagType: 'gray', photo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Potatoes', price: 110, tag: '↗ Rs. 5', tagType: 'green', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' },
      { name: 'Cabbage', price: 200, tag: '↘ Rs. 10', tagType: 'red', photo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' },
    ],
  },

  'Kandy Market': {
    location: 'Kandy',
    featured: {
      cropName: 'Tomatoes',
      todayPrice: 200,
      yesterdayPrice: 195,
      changeText: '+ Rs. 5',
      changeSub: 'From yesterday',
      trend: 'up',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
    },
    weeklyTrend: [
      { day: 'MON', price: 180, change: '- Rs. 5' },
      { day: 'TUE', price: 185, change: '+ Rs. 5' },
      { day: 'WED', price: 190, change: '+ Rs. 5' },
      { day: 'THU', price: 195, change: '+ Rs. 5' },
      { day: 'FRI', price: 210, change: '+ Rs. 15' },
      { day: 'SAT', price: 190, change: '- Rs. 20' },
      { day: 'SUN', price: 200, change: '+ Rs. 10' },
    ],
    otherProduce: [
      { name: 'Carrots', price: 240, tag: '↗ Rs. 15', tagType: 'green', photo: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' },
      { name: 'Watermelon', price: 190, tag: '→ 0', tagType: 'gray', photo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Potatoes', price: 160, tag: '↗ Rs. 5', tagType: 'green', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' },
      { name: 'Cabbage', price: 280, tag: '↘ Rs. 10', tagType: 'red', photo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' },
    ],
  },

  'Matale Market': {
    location: 'Matale',
    featured: {
      cropName: 'Tomatoes',
      todayPrice: 170,
      yesterdayPrice: 165,
      changeText: '+ Rs. 5',
      changeSub: 'From yesterday',
      trend: 'up',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
    },
    weeklyTrend: [
      { day: 'MON', price: 150, change: '- Rs. 5' },
      { day: 'TUE', price: 155, change: '+ Rs. 5' },
      { day: 'WED', price: 160, change: '+ Rs. 5' },
      { day: 'THU', price: 165, change: '+ Rs. 5' },
      { day: 'FRI', price: 180, change: '+ Rs. 15' },
      { day: 'SAT', price: 160, change: '- Rs. 20' },
      { day: 'SUN', price: 170, change: '+ Rs. 10' },
    ],
    otherProduce: [
      { name: 'Carrots', price: 210, tag: '↗ Rs. 10', tagType: 'green', photo: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' },
      { name: 'Watermelon', price: 190, tag: '→ 0', tagType: 'gray', photo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Potatoes', price: 135, tag: '↗ Rs. 5', tagType: 'green', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' },
      { name: 'Cabbage', price: 250, tag: '↘ Rs. 10', tagType: 'red', photo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' },
    ],
  },

  'Gampaha Market': {
    location: 'Gampaha',
    featured: {
      cropName: 'Tomatoes',
      todayPrice: 220,
      yesterdayPrice: 210,
      changeText: '+ Rs. 10',
      changeSub: 'From yesterday',
      trend: 'up',
      photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
    },
    weeklyTrend: [
      { day: 'MON', price: 190, change: '- Rs. 10' },
      { day: 'TUE', price: 200, change: '+ Rs. 10' },
      { day: 'WED', price: 205, change: '+ Rs. 5' },
      { day: 'THU', price: 215, change: '+ Rs. 10' },
      { day: 'FRI', price: 230, change: '+ Rs. 15' },
      { day: 'SAT', price: 210, change: '- Rs. 20' },
      { day: 'SUN', price: 220, change: '+ Rs. 10' },
    ],
    otherProduce: [
      { name: 'Carrots', price: 270, tag: '↗ Rs. 20', tagType: 'green', photo: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' },
      { name: 'Watermelon', price: 190, tag: '→ 0', tagType: 'gray', photo: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' },
      { name: 'Potatoes', price: 175, tag: '↗ Rs. 10', tagType: 'green', photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' },
      { name: 'Cabbage', price: 300, tag: '↘ Rs. 10', tagType: 'red', photo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' },
    ],
  },
};

export default function MarketPricesScreen({ navigation }) {
  const [selectedMarket, setSelectedMarket] = useState('Kurunegala Market');
  const [marketModalVisible, setMarketModalVisible] = useState(false);

  const currentData = REGIONAL_MARKET_DATA[selectedMarket] || REGIONAL_MARKET_DATA['Kurunegala Market'];
  const [activeDay, setActiveDay] = useState(currentData.weeklyTrend[6]);

  const handleSelectMarket = (marketName) => {
    setSelectedMarket(marketName);
    const newMarket = REGIONAL_MARKET_DATA[marketName];
    if (newMarket) {
      setActiveDay(newMarket.weeklyTrend[6]);
    }
    setMarketModalVisible(false);
  };

  // Safe inner coordinate calculation strictly within card borders
  const prices = currentData.weeklyTrend.map((d) => d.price);
  const minPrice = Math.min(...prices) - 15;
  const maxPrice = Math.max(...prices) + 15;
  const availableWidth = chartWidth - 55;

  const points = currentData.weeklyTrend.map((item, index) => {
    const x = 12 + (index * availableWidth) / (currentData.weeklyTrend.length - 1);
    const y = chartHeight - 20 - ((item.price - minPrice) / (maxPrice - minPrice)) * (chartHeight - 40);
    return { x, y, ...item };
  });

  const pathData = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const fillPathData = `${pathData} L ${points[points.length - 1].x} ${chartHeight - 15} L ${points[0].x} ${chartHeight - 15} Z`;

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Header with Inset Back Button */}
        {/* 1. Header with Vegetable Farm Photo (Roundness: 0) */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1000' }}
          style={styles.headerBackground}
          imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <SafeAreaView style={styles.headerOverlay}>
            <View style={styles.topRow}>
              {/* Back Button */}
              <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.mainTitle}>Market Prices</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Market Dropdown Pill */}
            <TouchableOpacity
              style={styles.marketDropdown}
              activeOpacity={0.8}
              onPress={() => setMarketModalVisible(true)}
            >
              <Ionicons name="location-outline" size={15} color="#fff" />
              <Text style={styles.marketDropdownText}>{selectedMarket}</Text>
              <Ionicons name="chevron-down" size={15} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.body}>
          {/* 2. Today's Market Section */}
          <View style={styles.todayHeader}>
            <Ionicons name="calendar-outline" size={22} color="#333" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.todayTitle}>Today's market ({currentData.location})</Text>
              <Text style={styles.todayDate}>{getTodayFormattedDate()}</Text>
            </View>
          </View>

          {/* 3. Featured Card with STRICTLY CONTAINED Chart */}
          <View style={styles.featuredCard}>
            <TouchableOpacity
              style={styles.featuredTop}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  item: {
                    _id: `tomatoes_${currentData.location.toLowerCase()}`,
                    cropName: currentData.featured.cropName,
                    sellingPricePerKg: currentData.featured.todayPrice,
                    yesterdayPrice: currentData.featured.yesterdayPrice,
                    quantityKg: 20,
                    location: currentData.location,
                    photoUrl: currentData.featured.photoUrl,
                    description: `Fresh tomatoes priced at ${selectedMarket} standards.`,
                  },
                })
              }
            >
              <Image source={{ uri: currentData.featured.photoUrl }} style={styles.featuredImage} />
              <View style={styles.featuredDetails}>
                <View style={styles.rowAlign}>
                  <MaterialCommunityIcons name="sprout" size={18} color="#2e7d32" />
                  <Text style={styles.featuredCropName}>{currentData.featured.cropName}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#777" style={{ marginLeft: 'auto' }} />
                </View>

                <View style={[styles.rowAlign, { marginTop: 4 }]}>
                  <Ionicons name="trending-up" size={16} color="#2e7d32" />
                  <Text style={styles.priceChange}>{currentData.featured.changeText}</Text>
                  <Text style={styles.priceChangeSub}>{currentData.featured.changeSub}</Text>
                </View>

                <Text style={styles.featuredPrice}>
                  Rs. {currentData.featured.todayPrice} <Text style={styles.perKg}>/kg</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* Interactive Selected Day Details Tooltip Banner */}
            <View style={styles.tooltipBanner}>
              <View style={styles.rowAlign}>
                <Ionicons name="information-circle-outline" size={16} color="#2e7d32" />
                <Text style={styles.tooltipDayText}>{activeDay.day}'s Price ({currentData.location}):</Text>
              </View>
              <Text style={styles.tooltipPriceText}>
                Rs. {activeDay.price} /kg <Text style={styles.tooltipChange}>({activeDay.change})</Text>
              </Text>
            </View>

            {/* REAL DYNAMIC SVG CHART (Zero Overflow) */}
            <View style={styles.chartWrapper}>
              <View style={styles.yAxisLabels}>
                <Text style={styles.axisText}>{Math.round(maxPrice)}</Text>
                <Text style={styles.axisText}>{Math.round((maxPrice + minPrice) / 2)}</Text>
                <Text style={styles.axisText}>{Math.round(minPrice)}</Text>
              </View>

              <View style={styles.svgClipContainer}>
                <Svg width={availableWidth + 24} height={chartHeight}>
                  <Defs>
                    <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#4caf50" stopOpacity="0.3" />
                      <Stop offset="100%" stopColor="#4caf50" stopOpacity="0.0" />
                    </SvgGradient>
                  </Defs>

                  <Line x1="0" y1="20" x2={availableWidth + 20} y2="20" stroke="#e0e0e0" strokeDasharray="4 4" strokeWidth="1" />
                  <Line x1="0" y1="55" x2={availableWidth + 20} y2="55" stroke="#e0e0e0" strokeDasharray="4 4" strokeWidth="1" />
                  <Line x1="0" y1="90" x2={availableWidth + 20} y2="90" stroke="#e0e0e0" strokeDasharray="4 4" strokeWidth="1" />

                  <Path d={fillPathData} fill="url(#chartGradient)" />
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

            {/* Day Selector Buttons */}
            <View style={styles.xAxisRow}>
              {currentData.weeklyTrend.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayButton, activeDay.day === item.day && styles.dayButtonActive]}
                  onPress={() => setActiveDay(item)}
                >
                  <Text style={[styles.dayButtonText, activeDay.day === item.day && styles.dayButtonTextActive]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 4. Other Produce Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.rowAlign}>
              <MaterialCommunityIcons name="sprout-outline" size={20} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Other Produce in {currentData.location}</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('OtherProducts')}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={14} color="#2e7d32" />
            </TouchableOpacity>
          </View>

          {/* 5. 2x2 Grid */}
          <View style={styles.grid}>
            {currentData.otherProduce.map((prod, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    item: {
                      _id: `${prod.name.toLowerCase()}_${currentData.location.toLowerCase()}`,
                      cropName: prod.name,
                      sellingPricePerKg: prod.price,
                      yesterdayPrice: prod.price - 10,
                      quantityKg: 30,
                      location: currentData.location,
                      photoUrl: prod.photo,
                      description: `Fresh ${prod.name.toLowerCase()} sourced for ${selectedMarket}.`,
                    },
                  })
                }
              >
                <Image source={{ uri: prod.photo }} style={styles.gridThumb} />
                <Text style={styles.gridCropTitle}>{prod.name}</Text>
                <Text style={styles.gridPrice}>
                  Rs. {prod.price} <Text style={styles.gridPerKg}>/kg</Text>
                </Text>
                <View
                  style={[
                    styles.tag,
                    prod.tagType === 'green' && styles.tagGreen,
                    prod.tagType === 'gray' && styles.tagGray,
                    prod.tagType === 'red' && styles.tagRed,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      prod.tagType === 'green' && styles.tagTextGreen,
                      prod.tagType === 'gray' && styles.tagTextGray,
                      prod.tagType === 'red' && styles.tagTextRed,
                    ]}
                  >
                    {prod.tag}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 6. + Add Product Button */}
          <TouchableOpacity
            style={styles.addProductBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Text style={styles.addProductBtnText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 7. Bottom Navigation */}
      <BottomNavBar activeTab="Explore" navigation={navigation} />

      {/* 8. In-Screen Select Market Bottom Sheet (Trapped inside iPhone frame) */}
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

            {Object.keys(REGIONAL_MARKET_DATA).map((m, i) => (
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
    </View>
  );
}

// Get today's real live date (e.g. "Sun 5 Oct 2026")
const getTodayFormattedDate = () => {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7', position: 'relative' },
  scrollContent: { paddingBottom: 16 },
  headerBackground: { width: '100%', height: 215 },
  headerOverlay: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: Platform.OS === 'web' ? 44 : 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  headerOverlay: {
    flex: 1,
    paddingHorizontal: 20, // 👈 Set to 20
    paddingTop: Platform.OS === 'web' ? 44 : 14,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20, // 👈 Set to 20
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
    textAlign: 'center',
  },
  marketDropdown: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  marketDropdownText: { color: '#fff', fontSize: 13, fontWeight: '600', marginHorizontal: 6 },
  body: { paddingHorizontal: 16, marginTop: -20 },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  todayTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  todayDate: { fontSize: 12, color: '#777' },
  featuredCard: {
    backgroundColor: '#eaf4eb',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d2ebd5',
    overflow: 'hidden',
  },
  featuredTop: { flexDirection: 'row' },
  featuredImage: { width: 95, height: 75, borderRadius: 12 },
  featuredDetails: { flex: 1, marginLeft: 14 },
  featuredCropName: { fontSize: 17, fontWeight: 'bold', color: '#222', marginLeft: 6 },
  priceChange: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginLeft: 4 },
  priceChangeSub: { fontSize: 11, color: '#777', marginLeft: 4 },
  featuredPrice: { fontSize: 20, fontWeight: '900', color: '#222', marginTop: 4 },
  perKg: { fontSize: 13, fontWeight: 'normal', color: '#666' },
  tooltipBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  tooltipDayText: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginLeft: 4 },
  tooltipPriceText: { fontSize: 13, fontWeight: 'bold', color: '#222' },
  tooltipChange: { fontSize: 11, color: '#666', fontWeight: 'normal' },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginLeft: 6 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf4eb', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  seeAllText: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginRight: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, elevation: 1 },
  gridThumb: { width: '100%', height: 75, borderRadius: 10, marginBottom: 8 },
  gridCropTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  gridPrice: { fontSize: 15, fontWeight: 'bold', color: '#222', marginTop: 2 },
  gridPerKg: { fontSize: 11, color: '#777', fontWeight: 'normal' },
  tag: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, marginTop: 6 },
  tagGreen: { backgroundColor: '#e8f5e9' },
  tagGray: { backgroundColor: '#f1f1f1' },
  tagRed: { backgroundColor: '#ffebee' },
  tagText: { fontSize: 11, fontWeight: '600' },
  tagTextGreen: { color: '#2e7d32' },
  tagTextGray: { color: '#666' },
  tagTextRed: { color: '#c62828' },
  addProductBtn: {
    backgroundColor: '#237330',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
    elevation: 3,
  },
  addProductBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // IN-SCREEN MODAL (TRAPPED INSIDE PHONE CHASSIS)
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
  backdropDismiss: {
    flex: 1,
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
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});