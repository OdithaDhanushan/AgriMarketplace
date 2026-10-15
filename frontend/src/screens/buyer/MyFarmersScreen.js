import React from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_FARMERS = [
  {
    id: 'farmer-1',
    name: 'Nimali Perera',
    location: 'Dambulla, Central Province',
    lastOrdered: '18 Sep 2026',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=250',
    lastOrder: [
      { id: 'tomatoes', name: 'Vine Tomatoes', quantity: 2, unit: 'kg', unitPrice: 280, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500' },
      { id: 'cucumber', name: 'Garden Cucumber', quantity: 1, unit: 'kg', unitPrice: 160, image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500' },
    ],
  },
  {
    id: 'farmer-2',
    name: 'Kumara Bandara',
    location: 'Polonnaruwa, North Central',
    lastOrdered: '12 Sep 2026',
    rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250',
    lastOrder: [
      { id: 'red-rice', name: 'Red Nadu Rice', quantity: 5, unit: 'kg', unitPrice: 240, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' },
    ],
  },
  {
    id: 'farmer-3',
    name: 'Anula Fernando',
    location: 'Matale, Central Province',
    lastOrdered: '03 Sep 2026',
    rating: 5.0,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250',
    lastOrder: [
      { id: 'cinnamon', name: 'Ceylon Cinnamon', quantity: 2, unit: '250 g', unitPrice: 720, image: 'https://images.unsplash.com/photo-1603905179139-d6e3a4b4e7a9?w=500' },
    ],
  },
];

export default function MyFarmersScreen({ navigation }) {
  const reorder = (farmer) => {
    navigation.navigate('CartCheckout', {
      cartItems: farmer.lastOrder.map((item) => ({ ...item, farmer: farmer.name })),
    });
  };

  const renderFarmer = ({ item }) => (
    <View style={styles.farmerCard}>
      <View style={styles.farmerHeader}>
        <Image source={{ uri: item.photo }} style={styles.farmerPhoto} />
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{item.name}</Text>
          <View style={styles.locationRow}><Ionicons name="location-outline" size={14} color={COLORS.muted} /><Text style={styles.locationText}>{item.location}</Text></View>
          <View style={styles.ratingRow}><Ionicons name="star" size={14} color="#E5A500" /><Text style={styles.ratingText}>{item.rating.toFixed(1)} farmer rating</Text></View>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View ${item.name}`} style={styles.moreButton} onPress={() => navigation.navigate('BuyerHome')}>
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.orderMeta}>
        <Ionicons name="calendar-outline" size={15} color={COLORS.green} />
        <Text style={styles.orderDate}>Last ordered {item.lastOrdered}</Text>
      </View>
      <Text style={styles.itemsHeading}>Your usual picks</Text>
      {item.lastOrder.map((product) => (
        <View key={product.id} style={styles.productRow}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productQuantity}>{product.quantity} {product.unit}</Text>
          </View>
          <Text style={styles.productPrice}>Rs. {(product.unitPrice * product.quantity).toLocaleString()}</Text>
        </View>
      ))}

      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Reorder from ${item.name}`} onPress={() => reorder(item)} style={styles.reorderButton}>
        <Ionicons name="refresh" size={19} color={COLORS.white} />
        <Text style={styles.reorderText}>One-Tap Reorder</Text>
        <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.headingCopy}><Text style={styles.title}>My farmers</Text><Text style={styles.subtitle}>Good food starts with good people.</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => navigation.navigate('CartCheckout')} style={styles.cartButton}><Ionicons name="bag-outline" size={22} color={COLORS.dark} /></TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_FARMERS}
        keyExtractor={(item) => item.id}
        renderItem={renderFarmer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#EDECEB',
  dark: '#1B3820',
  muted: '#65746A',
  line: 'rgba(255, 255, 255, 0.95)',
  white: 'rgba(255, 255, 255, 0.82)',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDECEB' },
  header: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 44 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.line,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  headingCopy: { flex: 1 },
  title: { color: COLORS.dark, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { marginTop: 2, color: COLORS.muted, fontSize: 11.5 },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 85, gap: 14 },
  farmerCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  farmerHeader: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11 },
  farmerPhoto: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5ECE6' },
  farmerInfo: { flex: 1, gap: 3 },
  farmerName: { color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { flexShrink: 1, color: COLORS.muted, fontSize: 11 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },
  moreButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  orderMeta: {
    minHeight: 36,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  orderDate: { color: COLORS.muted, fontSize: 11.5, fontWeight: '500' },
  itemsHeading: { marginBottom: 6, color: COLORS.dark, fontSize: 13, fontWeight: '750' },
  productRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10 },
  productImage: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E5ECE6' },
  productInfo: { flex: 1 },
  productName: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  productQuantity: { marginTop: 2, color: COLORS.muted, fontSize: 11.5 },
  productPrice: { color: COLORS.green, fontSize: 13, fontWeight: '800' },
  reorderButton: {
    minHeight: 48,
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    backgroundColor: COLORS.green,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  reorderText: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '750', letterSpacing: 0.2 },
});