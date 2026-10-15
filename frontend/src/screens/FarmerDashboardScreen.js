import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { getMyProduceList } from '../services/api';

export default function FarmerDashboardScreen({ navigation }) {
  const [myProduce, setMyProduce] = useState([]);

  const fetchMyProduce = useCallback(async () => {
    try {
      return await getMyProduceList();
    } catch (e) {
      console.log('Dashboard fetch error:', e.message);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMyProduce().then((produce) => {
      if (produce) setMyProduce(produce);
    });
  }, [fetchMyProduce]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#1B3820" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Farm Dashboard</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Greeting Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>Ayubowan, Sunil! 🌾</Text>
            <Text style={styles.greetingSub}>Here is the live performance of your farm business:</Text>
          </View>

          {/* 3 Mandatory Metric Summary Cards (Assignment PDF Requirement!) */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricEmoji}>📦</Text>
              <Text style={styles.metricNumber}>{myProduce.length}</Text>
              <Text style={styles.metricLabel}>Active Listings</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricEmoji}>⏳</Text>
              <Text style={styles.metricNumber}>2</Text>
              <Text style={styles.metricLabel}>Pending Orders</Text>
            </View>

            <View style={styles.metricBox}>
              <Text style={styles.metricEmoji}>✅</Text>
              <Text style={styles.metricNumber}>14</Text>
              <Text style={styles.metricLabel}>Completed Sales</Text>
            </View>
          </View>

          {/* Monthly Earnings Card */}
          <View style={styles.earningsCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.earningsTitle}>Total Earnings This Month</Text>
              <MaterialCommunityIcons name="trending-up" size={22} color="#2e7d32" />
            </View>
            <Text style={styles.earningsAmount}>Rs. 48,500</Text>
            <Text style={styles.earningsSub}>↗ 18% higher than selling through middlemen</Text>
          </View>

          {/* Active Inventory List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Active Farm Inventory</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
              <Text style={styles.addCropText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {myProduce.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No active produce listed yet.</Text>
            </View>
          ) : (
            myProduce.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.inventoryItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SellerProductDetail', { item })}
              >
                <Image source={{ uri: item.photoUrl }} style={styles.invThumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.invTitle}>{item.cropName}</Text>
                  <Text style={styles.invSub}>{item.quantityKg} kg available • Rs. {item.sellingPricePerKg} /kg</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            ))
          )}

          {/* Fast CTA */}
          <TouchableOpacity
            style={styles.postNewBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Text style={styles.postNewText}>+ POST A NEW PRODUCE</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNavBar activeTab="Profile" navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDECEB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 44 : 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1B3820', textAlign: 'center', letterSpacing: -0.3 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 14 },
  greetingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  greetingTitle: { fontSize: 20, fontWeight: '800', color: '#1B3820' },
  greetingSub: { fontSize: 13, color: '#65746A', marginTop: 4 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(16px)',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  metricEmoji: { fontSize: 22, marginBottom: 4 },
  metricNumber: { fontSize: 22, fontWeight: '900', color: '#2E7D32' },
  metricLabel: { fontSize: 10, fontWeight: '700', color: '#65746A', marginTop: 2, textAlign: 'center' },
  earningsCard: {
    backgroundColor: 'rgba(232, 245, 233, 0.82)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(165, 214, 167, 0.65)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  earningsTitle: { fontSize: 13, fontWeight: '700', color: '#1B5E20' },
  earningsAmount: { fontSize: 28, fontWeight: '900', color: '#1B5E20', marginVertical: 6 },
  earningsSub: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1B3820' },
  addCropText: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  emptyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(16px)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  emptyText: { color: '#7E8E83', fontSize: 13.5 },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(16px)',
    borderRadius: 22,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  invThumb: { width: 50, height: 50, borderRadius: 12 },
  invTitle: { fontSize: 15, fontWeight: '750', color: '#1B3820' },
  invSub: { fontSize: 12, color: '#65746A', marginTop: 2 },
  postNewBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
    marginTop: 6,
    marginBottom: 10,
  },
  postNewText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});