import React from 'react';
import {
  FlatList,
  Image,
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

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { minHeight: 84, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1 },
  title: { color: COLORS.dark, fontSize: 23, fontWeight: '800' },
  subtitle: { marginTop: 3, color: COLORS.muted, fontSize: 12 },
  cartButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: COLORS.white },
  listContent: { paddingHorizontal: 18, paddingTop: 7, paddingBottom: 26, gap: 14 },
  farmerCard: { padding: 14, borderRadius: 13, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  farmerHeader: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 11 },
  farmerPhoto: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#E5ECE6' },
  farmerInfo: { flex: 1, gap: 4 },
  farmerName: { color: COLORS.dark, fontSize: 16, fontWeight: '750' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { flexShrink: 1, color: COLORS.muted, fontSize: 11 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: COLORS.dark, fontSize: 12, fontWeight: '650' },
  moreButton: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  orderMeta: { minHeight: 39, marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: COLORS.line },
  orderDate: { color: COLORS.muted, fontSize: 12 },
  itemsHeading: { marginBottom: 6, color: COLORS.dark, fontSize: 13, fontWeight: '750' },
  productRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9 },
  productImage: { width: 43, height: 43, borderRadius: 7, backgroundColor: '#E5ECE6' },
  productInfo: { flex: 1 },
  productName: { color: COLORS.dark, fontSize: 13, fontWeight: '650' },
  productQuantity: { marginTop: 3, color: COLORS.muted, fontSize: 12 },
  productPrice: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },
  reorderButton: { minHeight: 52, marginTop: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 9, backgroundColor: COLORS.green },
  reorderText: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '750' },
});