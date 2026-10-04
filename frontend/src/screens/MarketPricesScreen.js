import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function MarketPricesScreen({ navigation }) {
  const [selectedMarket, setSelectedMarket] = useState('Kurunegala market');
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [liveProduce, setLiveProduce] = useState([]);

  const markets = [
    'Kurunegala Market',
    'Dambulla Market',
    'Colombo Market',
    'Kandy Market',
    'Matale Market',
    'Gampaha Market',
  ];

  // Fetch real produce from MongoDB Atlas
  useEffect(() => {
    fetchProduce();
  }, []);

  const fetchProduce = async () => {
    try {
      const res = await api.get('/produce');
      setLiveProduce(res.data);
    } catch (err) {
      console.log('Error fetching produce:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 1. Header with Paddy Field Banner (Screen #58) */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' }}
          style={styles.headerBackground}
          imageStyle={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <SafeAreaView style={styles.headerOverlay}>
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="chevron-back" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.mainTitle}>Market Prices</Text>
              <View style={{ width: 38 }} />
            </View>

            {/* Market Dropdown Pill */}
            <TouchableOpacity
              style={styles.marketDropdown}
              onPress={() => setMarketModalVisible(true)}
            >
              <Ionicons name="location-outline" size={16} color="#fff" />
              <Text style={styles.marketDropdownText}>{selectedMarket}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.body}>
          {/* 2. Today's Market Section */}
          <View style={styles.todayHeader}>
            <Ionicons name="calendar-outline" size={22} color="#333" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.todayTitle}>Today's market</Text>
              <Text style={styles.todayDate}>Thu 17 Sep 2026</Text>
            </View>
          </View>

          {/* 3. Clickable Featured Tomatoes Card (Navigates to Screen #77) */}
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.85}
            onPress={() => navigation && navigation.navigate('ProductDetail')}
          >
            <View style={styles.featuredTop}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200' }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredDetails}>
                <View style={styles.rowAlign}>
                  <MaterialCommunityIcons name="sprout" size={18} color="#2e7d32" />
                  <Text style={styles.featuredCropName}>Tomatoes</Text>
                  <Ionicons name="chevron-forward" size={18} color="#777" style={{ marginLeft: 'auto' }} />
                </View>

                <View style={[styles.rowAlign, { marginTop: 4 }]}>
                  <Ionicons name="trending-up" size={16} color="#2e7d32" />
                  <Text style={styles.priceChange}>Rs. 10</Text>
                  <Text style={styles.priceChangeSub}>From yesterday</Text>
                </View>

                <Text style={styles.featuredPrice}>
                  Rs. 180 <Text style={styles.perKg}>/kg</Text>
                </Text>
              </View>
            </View>

            {/* 7-Day Trend Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chartYAxis}>
                <Text style={styles.axisText}>220</Text>
                <Text style={styles.axisText}>180</Text>
                <Text style={styles.axisText}>140</Text>
              </View>
              <View style={styles.chartPlot}>
                <View style={styles.chartLineMock} />
                <View style={[styles.chartPoint, { left: '10%', top: 38 }]} />
                <View style={[styles.chartPoint, { left: '26%', top: 32 }]} />
                <View style={[styles.chartPoint, { left: '42%', top: 30 }]} />
                <View style={[styles.chartPoint, { left: '58%', top: 20 }]} />
                <View style={[styles.chartPoint, { left: '74%', top: 40 }]} />
                <View style={[styles.chartPoint, { left: '90%', top: 32 }]} />
              </View>
            </View>

            <View style={styles.chartXAxis}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                <Text key={idx} style={styles.dayText}>{day}</Text>
              ))}
            </View>
          </TouchableOpacity>

          {/* 4. Other Produce Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.rowAlign}>
              <MaterialCommunityIcons name="sprout-outline" size={20} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Other Produce</Text>
            </View>
                <TouchableOpacity 
                    style={styles.seeAllBtn} 
                    onPress={() => navigation.navigate('OtherProducts')}
                >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="chevron-forward" size={14} color="#2e7d32" />
                </TouchableOpacity>
          </View>

          {/* 5. 2x2 Produce Grid (Screen #58) */}
          <View style={styles.grid}>
            {/* 1. Carrots */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  item: {
                    _id: 'carrots_demo',
                    cropName: 'Carrots',
                    sellingPricePerKg: 220,
                    yesterdayPrice: 205,
                    quantityKg: 40,
                    location: 'Nuwara Eliya',
                    photoUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
                    description: 'Fresh hill-country sweet carrots harvested this morning.',
                  },
                })
              }
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150' }} style={styles.gridThumb} />
              <Text style={styles.gridCropTitle}>Carrots</Text>
              <Text style={styles.gridPrice}>Rs. 220 <Text style={styles.gridPerKg}>/kg</Text></Text>
              <View style={styles.tagGreen}>
                <Text style={styles.tagTextGreen}>↗ Rs. 15</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Leeks */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  item: {
                    _id: 'leeks_demo',
                    cropName: 'Leeks',
                    sellingPricePerKg: 190,
                    yesterdayPrice: 190,
                    quantityKg: 20,
                    location: 'Nuwara Eliya',
                    photoUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
                    description: 'Tender fresh green leeks directly from local organic farms.',
                  },
                })
              }
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150' }} style={styles.gridThumb} />
              <Text style={styles.gridCropTitle}>Leeks</Text>
              <Text style={styles.gridPrice}>Rs. 190 <Text style={styles.gridPerKg}>/kg</Text></Text>
              <View style={styles.tagGray}>
                <Text style={styles.tagTextGray}>→ 0</Text>
              </View>
            </TouchableOpacity>

            {/* 3. Potatoes */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  item: {
                    _id: 'potatoes_demo',
                    cropName: 'Potatoes',
                    sellingPricePerKg: 140,
                    yesterdayPrice: 135,
                    quantityKg: 60,
                    location: 'Welimada',
                    photoUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
                    description: 'Grade-A local potatoes with clean skin and firm texture.',
                  },
                })
              }
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150' }} style={styles.gridThumb} />
              <Text style={styles.gridCropTitle}>Potatoes</Text>
              <Text style={styles.gridPrice}>Rs. 140 <Text style={styles.gridPerKg}>/kg</Text></Text>
              <View style={styles.tagGreen}>
                <Text style={styles.tagTextGreen}>↗ Rs. 5</Text>
              </View>
            </TouchableOpacity>

            {/* 4. Cabbage */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  item: {
                    _id: 'cabbage_demo',
                    cropName: 'Cabbage',
                    sellingPricePerKg: 260,
                    yesterdayPrice: 270,
                    quantityKg: 35,
                    location: 'Kandy',
                    photoUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400',
                    description: 'Fresh round green cabbage heads with high crispness index.',
                  },
                })
              }
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=150' }} style={styles.gridThumb} />
              <Text style={styles.gridCropTitle}>Cabbage</Text>
              <Text style={styles.gridPrice}>Rs. 260 <Text style={styles.gridPerKg}>/kg</Text></Text>
              <View style={styles.tagRed}>
                <Text style={styles.tagTextRed}>↘ Rs. 10</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 6. + Add Product Button (Navigates to AddProductScreen) */}
          <TouchableOpacity
            style={styles.addProductBtn}
            activeOpacity={0.8}
            onPress={() => navigation && navigation.navigate('AddProduct')}
          >
            <Text style={styles.addProductBtnText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 7. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="search" size={20} color="#2e7d32" />
          <Text style={styles.navTextActive}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cart-outline" size={20} color="#888" />
          <Text style={styles.navText}>My Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="receipt-outline" size={20} color="#888" />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={20} color="#888" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 8. Select Market Modal (Screen #79) */}
      <Modal visible={marketModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Select Market</Text>
              <TouchableOpacity onPress={() => setMarketModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {markets.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={styles.marketOption}
                onPress={() => setSelectedMarket(m)}
              >
                <Ionicons
                  name={selectedMarket === m ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedMarket === m ? '#2e7d32' : '#888'}
                />
                <Text style={styles.marketOptionText}>{m}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setMarketModalVisible(false)}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7' },
  headerBackground: { width: '100%', height: 210 },
  headerOverlay: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  marketDropdown: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 18,
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
  },
  featuredTop: { flexDirection: 'row' },
  featuredImage: { width: 95, height: 75, borderRadius: 12 },
  featuredDetails: { flex: 1, marginLeft: 14 },
  featuredCropName: { fontSize: 17, fontWeight: 'bold', color: '#222', marginLeft: 6 },
  priceChange: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginLeft: 4 },
  priceChangeSub: { fontSize: 11, color: '#777', marginLeft: 4 },
  featuredPrice: { fontSize: 20, fontWeight: '900', color: '#222', marginTop: 4 },
  perKg: { fontSize: 13, fontWeight: 'normal', color: '#666' },
  chartContainer: { flexDirection: 'row', height: 75, marginTop: 14 },
  chartYAxis: { justifyContent: 'space-between', paddingRight: 6 },
  axisText: { fontSize: 10, color: '#888' },
  chartPlot: { flex: 1, position: 'relative', borderBottomWidth: 1, borderColor: '#c1dfc6' },
  chartLineMock: { position: 'absolute', top: 32, left: 10, right: 10, height: 2, backgroundColor: '#2e7d32' },
  chartPoint: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#2e7d32' },
  chartXAxis: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 },
  dayText: { fontSize: 10, fontWeight: '600', color: '#666' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginLeft: 6 },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4eb',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  seeAllText: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginRight: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, elevation: 1 },
  gridThumb: { width: '100%', height: 75, borderRadius: 10, marginBottom: 8 },
  gridCropTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  gridPrice: { fontSize: 15, fontWeight: 'bold', color: '#222', marginTop: 2 },
  gridPerKg: { fontSize: 11, color: '#777', fontWeight: 'normal' },
  tagGreen: {
    backgroundColor: '#e8f5e9',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  tagTextGreen: { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  tagGray: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  tagTextGray: { fontSize: 11, color: '#666', fontWeight: '600' },
  tagRed: {
    backgroundColor: '#ffebee',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  tagTextRed: { fontSize: 11, color: '#c62828', fontWeight: '600' },
  addProductBtn: {
    backgroundColor: '#237330',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  addProductBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: { alignItems: 'center' },
  navItemActive: { backgroundColor: '#e8f5e9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  navText: { fontSize: 10, color: '#888', marginTop: 3 },
  navTextActive: { fontSize: 10, color: '#2e7d32', fontWeight: 'bold', marginTop: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  marketOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  marketOptionText: { fontSize: 16, color: '#333', marginLeft: 12 },
  doneBtn: {
    backgroundColor: '#237330',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});