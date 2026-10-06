import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

export default function OtherProductsScreen({ navigation }) {
  // All 12 Products from your Figma Screen #69
  const allProducts = [
    {
      _id: 'ginger_1',
      cropName: 'Ginger',
      category: 'Spices',
      sellingPricePerKg: 250,
      yesterdayPrice: 240,
      quantityKg: 15,
      location: 'Kurunegala',
      tagType: 'green',
      tagText: '↗ Rs. 10',
      // Real fresh ginger roots photo
      photoUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=300',
      description: 'Fresh organic ginger roots sourced directly from local farming communities in Kurunegala.',
    },
    {
      _id: 'corn_2',
      cropName: 'Corn',
      category: 'Grains',
      sellingPricePerKg: 190,
      yesterdayPrice: 190,
      quantityKg: 30,
      location: 'Dambulla',
      tagType: 'gray',
      tagText: '→ 0',
      photoUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300',
      description: 'Sweet yellow corn freshly harvested. Ideal for boiling, roasting, and commercial use.',
    },
    {
      _id: 'onion_3',
      cropName: 'Onion',
      category: 'Vegetables',
      sellingPricePerKg: 240,
      yesterdayPrice: 230,
      quantityKg: 50,
      location: 'Dambulla',
      tagType: 'green',
      tagText: '↗ Rs. 10',
      photoUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
      description: 'High-quality local red onions with rich flavor and long shelf life.',
    },
    {
      _id: 'radish_4',
      cropName: 'Radish',
      category: 'Vegetables',
      sellingPricePerKg: 150,
      yesterdayPrice: 150,
      quantityKg: 20,
      location: 'Kurunegala',
      tagType: 'gray',
      tagText: '→ 0',
      photoUrl: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=300',
      description: 'Crisp and fresh white radishes with organic soil certification.',
    },
    {
      _id: 'bellpepper_5',
      cropName: 'Bell Pepper',
      category: 'Vegetables',
      sellingPricePerKg: 160,
      yesterdayPrice: 140,
      quantityKg: 18,
      location: 'Kandy',
      tagType: 'green',
      tagText: '↗ Rs. 20',
      photoUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300',
      description: 'Vibrant yellow and green capsicum bell peppers, crunchy and farm-fresh.',
    },
    {
      _id: 'cucumber_6',
      cropName: 'Cucumber',
      category: 'Vegetables',
      sellingPricePerKg: 180,
      yesterdayPrice: 200,
      quantityKg: 25,
      location: 'Kurunegala',
      tagType: 'red',
      tagText: '↘ Rs. 20',
      photoUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300',
      description: 'Hydrating green garden cucumbers, harvested this morning.',
    },
    {
      _id: 'carrots_7',
      cropName: 'Carrots',
      category: 'Vegetables',
      sellingPricePerKg: 220,
      yesterdayPrice: 205,
      quantityKg: 40,
      location: 'Nuwara Eliya',
      tagType: 'green',
      tagText: '↗ Rs. 15',
      photoUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
      description: 'Sweet hill-country carrots, washed and packed in standard crates.',
    },
    {
      _id: 'leeks_8',
      cropName: 'Leeks',
      category: 'Vegetables',
      sellingPricePerKg: 190,
      yesterdayPrice: 190,
      quantityKg: 20,
      location: 'Nuwara Eliya',
      tagType: 'gray',
      tagText: '→ 0',
      // Watermelon photo matching your Figma design!
      photoUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300',
      description: 'Tender fresh green leeks suitable for restaurants and retailers.',
    },
    {
      _id: 'potatoes_9',
      cropName: 'Potatoes',
      category: 'Vegetables',
      sellingPricePerKg: 140,
      yesterdayPrice: 135,
      quantityKg: 60,
      location: 'Welimada',
      tagType: 'green',
      tagText: '↗ Rs. 5',
      photoUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
      description: 'Grade-A local potatoes, clean skin and solid texture.',
    },
    {
      _id: 'cabbage_10',
      cropName: 'Cabbage',
      category: 'Vegetables',
      sellingPricePerKg: 260,
      yesterdayPrice: 270,
      quantityKg: 35,
      location: 'Kandy',
      tagType: 'red',
      tagText: '↘ Rs. 10',
      photoUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300',
      description: 'Dense round green cabbage heads with high freshness index.',
    },
    {
      _id: 'pumpkin_11',
      cropName: 'Pumpkin',
      category: 'Vegetables',
      sellingPricePerKg: 200,
      yesterdayPrice: 195,
      quantityKg: 80,
      location: 'Kurunegala',
      tagType: 'green',
      tagText: '↗ Rs. 5',
      photoUrl: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=300',
      description: 'Whole organic yellow-fleshed pumpkins directly from village farms.',
    },
    {
      _id: 'beans_12',
      cropName: 'Beans',
      category: 'Vegetables',
      sellingPricePerKg: 235,
      yesterdayPrice: 240,
      quantityKg: 25,
      location: 'Balangoda',
      tagType: 'red',
      tagText: '↘ Rs. 5',
      photoUrl: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=300',
      description: 'Fresh green bush beans, tender and hand-picked at dawn.',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#bfe3b4', '#e8f5e9', '#f6f8f7']} style={styles.gradientHeader} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with marginLeft: 20 on Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Other Products</Text>
          <View style={{ width: 58 }} />
        </View>

        {/* Date Subtitle */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={18} color="#444" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.dateLabel}>Today's market</Text>
            <Text style={styles.dateValue}>{getTodayFormattedDate()}</Text>
          </View>
        </View>

        {/* 2-Column Product Grid */}
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {allProducts.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProductDetail', { item })}
              >
                <Image source={{ uri: item.photoUrl }} style={styles.thumb} />
                <Text style={styles.cropTitle}>{item.cropName}</Text>
                <Text style={styles.cropPrice}>
                  Rs. {item.sellingPricePerKg} <Text style={styles.perKg}>/kg</Text>
                </Text>

                {/* Badge Tag */}
                <View
                  style={[
                    styles.tag,
                    item.tagType === 'green' && styles.tagGreen,
                    item.tagType === 'gray' && styles.tagGray,
                    item.tagType === 'red' && styles.tagRed,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      item.tagType === 'green' && styles.tagTextGreen,
                      item.tagType === 'gray' && styles.tagTextGray,
                      item.tagType === 'red' && styles.tagTextRed,
                    ]}
                  >
                    {item.tagText}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Unified Bottom Nav */}
      <BottomNavBar activeTab="Explore" navigation={navigation} />
    </View>
  );
}

const getTodayFormattedDate = () => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7' },
  gradientHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // 👈 Set to 20
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
    marginLeft: 0, // 👈 Set to 20
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f5223', textAlign: 'center' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: 6,
    marginBottom: 8,
  },
  dateLabel: { fontSize: 13, fontWeight: 'bold', color: '#222' },
  dateValue: { fontSize: 11, color: '#666' },
  gridContainer: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  thumb: { width: '100%', height: 95, borderRadius: 12, marginBottom: 8 },
  cropTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cropPrice: { fontSize: 15, fontWeight: '900', color: '#222', marginTop: 2 },
  perKg: { fontSize: 11, fontWeight: 'normal', color: '#777' },
  tag: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, marginTop: 6 },
  tagGreen: { backgroundColor: '#e8f5e9' },
  tagGray: { backgroundColor: '#f1f1f1' },
  tagRed: { backgroundColor: '#ffebee' },
  tagText: { fontSize: 11, fontWeight: 'bold' },
  tagTextGreen: { color: '#2e7d32' },
  tagTextGray: { color: '#666' },
  tagTextRed: { color: '#c62828' },
});