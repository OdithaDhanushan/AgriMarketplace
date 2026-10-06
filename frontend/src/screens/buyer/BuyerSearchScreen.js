import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTS = [
  { id: 'carrot-01', name: 'Fresh Carrots', category: 'Vegetables', price: 280, unit: 'kg', location: 'Nuwara Eliya', distance: 180, rating: 4.8, organic: true, bulk: true, farmer: 'Sunil Perera', image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=900' },
  { id: 'tomato-02', name: 'Vine Tomatoes', category: 'Vegetables', price: 320, unit: 'kg', location: 'Dambulla', distance: 142, rating: 4.7, organic: true, bulk: false, farmer: 'Nimali Perera', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=900' },
  { id: 'papaya-03', name: 'Sweet Papaya', category: 'Fruits', price: 240, unit: 'kg', location: 'Kurunegala', distance: 95, rating: 4.9, organic: false, bulk: true, farmer: 'Saman Jayawardena', image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=900' },
  { id: 'beans-04', name: 'Green Beans', category: 'Vegetables', price: 360, unit: 'kg', location: 'Bandarawela', distance: 203, rating: 4.6, organic: true, bulk: true, farmer: 'Chandrika Silva', image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=900' },
];

const FILTERS = ['All Products', 'Vegetables', 'Fruits', 'Organic', 'Bulk', 'Price Range', 'Rating', 'Distance'];

function BuyerSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Products');
  const [viewMode, setViewMode] = useState('List');
  const [location, setLocation] = useState('Colombo 07');

  const selectLocation = () => Alert.alert('Delivery location', 'Choose a delivery area', [
    { text: 'Colombo 07', onPress: () => setLocation('Colombo 07') },
    { text: 'Colombo 03', onPress: () => setLocation('Colombo 03') },
    { text: 'Cancel', style: 'cancel' },
  ]);

  const products = useMemo(() => PRODUCTS.filter((product) => {
    const searchMatch = `${product.name} ${product.category} ${product.location} ${product.farmer}`.toLowerCase().includes(query.trim().toLowerCase());
    const filterMatch = activeFilter === 'All Products'
      || product.category === activeFilter
      || (activeFilter === 'Organic' && product.organic)
      || (activeFilter === 'Bulk' && product.bulk)
      || (activeFilter === 'Price Range' && product.price <= 320)
      || (activeFilter === 'Rating' && product.rating >= 4.8)
      || (activeFilter === 'Distance' && product.distance <= 150);
    return searchMatch && filterMatch;
  }), [activeFilter, query]);

  const showDetail = (product) => navigation.navigate('ProductDetail', { product });
  const addProduct = (product) => navigation.navigate('Checkout', { product, quantity: 1 });

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View ${item.name}`} activeOpacity={0.9} onPress={() => showDetail(item)} style={styles.productMain}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <View style={styles.productTitleRow}>
            <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
            {item.organic && <View style={styles.organicMark}><Ionicons name="leaf" size={12} color={COLORS.green} /></View>}
          </View>
          <Text style={styles.productCategory}>{item.category} · {item.farmer}</Text>
          <Text style={styles.productPrice}>Rs. {item.price} <Text style={styles.priceUnit}>/ {item.unit}</Text></Text>
          <View style={styles.productMeta}>
            <Ionicons name="location-outline" size={14} color={COLORS.muted} />
            <Text numberOfLines={1} style={styles.metaText}>{item.location} · {item.distance} km</Text>
            <Ionicons name="star" size={13} color="#E5A500" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Add ${item.name} to checkout`} onPress={() => addProduct(item)} style={styles.addButton}>
        <Ionicons name="add" size={18} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMap = () => (
    <View style={styles.mapCanvas}>
      <View style={styles.mapRoadHorizontal} />
      <View style={styles.mapRoadVertical} />
      <View style={styles.mapRoadDiagonal} />
      <View style={styles.mapHeader}><Ionicons name="navigate-circle" size={18} color={COLORS.green} /><Text style={styles.mapHeaderText}>Nearby farms and fresh picks</Text></View>
      {products.map((product, index) => (
        <TouchableOpacity
          key={product.id}
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${product.distance} kilometers away`}
          onPress={() => showDetail(product)}
          style={[styles.mapPin, styles[`mapPin${index % 4}`]]}
        >
          <Ionicons name="leaf" size={15} color={COLORS.white} />
          <Text style={styles.mapPinText}>{product.distance} km</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.youAreHere}><View style={styles.youDot} /><Text style={styles.youLabel}>Colombo 07</Text></View>
      <Text style={styles.mapCaption}>Tap a farm marker to view its produce</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.locationBlock}>
          <Text style={styles.eyebrow}>DELIVERING TO</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change delivery location" onPress={selectLocation} style={styles.locationSelector}>
            <Ionicons name="location" size={17} color={COLORS.green} />
            <Text style={styles.locationText}>{location}</Text>
            <Ionicons name="chevron-down" size={15} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Saved farmers" onPress={() => navigation.navigate('MyFarmers')} style={styles.iconButton}>
          <Ionicons name="heart-outline" size={22} color={COLORS.dark} />
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => navigation.navigate('CartCheckout')} style={styles.iconButton}>
          <Ionicons name="bag-outline" size={22} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.muted} />
        <TextInput accessibilityLabel="Search products" value={query} onChangeText={setQuery} placeholder="Search produce, farms, or farmers" placeholderTextColor="#8A938C" returnKeyType="search" style={styles.searchInput} />
        {!!query && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clearButton}><Ionicons name="close-circle" size={19} color={COLORS.muted} /></TouchableOpacity>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((filter) => {
          const selected = activeFilter === filter;
          return (
            <TouchableOpacity key={filter} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setActiveFilter(filter)} style={[styles.filterChip, selected && styles.filterChipActive]}>
              {['Price Range', 'Rating', 'Distance'].includes(filter) && <Ionicons name={filter === 'Price Range' ? 'options-outline' : filter === 'Rating' ? 'star-outline' : 'navigate-outline'} size={14} color={selected ? COLORS.white : COLORS.dark} />}
              <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.resultsHeading}>
        <View><Text style={styles.sectionTitle}>Fresh from nearby farms</Text><Text style={styles.resultsCount}>{products.length} products available</Text></View>
        <View style={styles.viewToggle}>
          {['List', 'Map'].map((mode) => {
            const active = viewMode === mode;
            return <TouchableOpacity key={mode} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`${mode} view`} onPress={() => setViewMode(mode)} style={[styles.viewOption, active && styles.viewOptionActive]}><Ionicons name={mode === 'List' ? 'list' : 'map-outline'} size={17} color={active ? COLORS.white : COLORS.muted} /></TouchableOpacity>;
          })}
        </View>
      </View>

      {viewMode === 'List' ? (
        <FlatList data={products} keyExtractor={(item) => item.id} renderItem={renderProduct} contentContainerStyle={styles.productList} showsVerticalScrollIndicator={false} ListEmptyComponent={<Text style={styles.emptyText}>No products match these filters.</Text>} />
      ) : renderMap()}
      <View style={styles.bottomNav}>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: true }} style={styles.navItem}><Ionicons name="search" size={20} color={COLORS.green} /><Text style={styles.navTextActive}>Explore</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('MyFarmers')} style={styles.navItem}><Ionicons name="heart-outline" size={20} color={COLORS.muted} /><Text style={styles.navText}>Farmers</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('CartCheckout')} style={styles.navItem}><Ionicons name="bag-outline" size={20} color={COLORS.muted} /><Text style={styles.navText}>Cart</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  topBar: { minHeight: 73, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 7 },
  locationBlock: { flex: 1 },
  eyebrow: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  locationSelector: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: COLORS.dark, fontSize: 15, fontWeight: '700' },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: COLORS.white },
  searchBar: { minHeight: 52, marginHorizontal: 17, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  searchInput: { flex: 1, height: 48, marginLeft: 9, color: COLORS.dark, fontSize: 14 },
  clearButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  filters: { paddingHorizontal: 17, paddingVertical: 14, gap: 8 },
  filterChip: { minHeight: 42, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 22, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  filterChipActive: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  filterText: { color: COLORS.dark, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  resultsHeading: { minHeight: 58, paddingHorizontal: 18, paddingBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  resultsCount: { marginTop: 3, color: COLORS.muted, fontSize: 12 },
  viewToggle: { padding: 3, flexDirection: 'row', borderRadius: 9, backgroundColor: '#E8ECE9' },
  viewOption: { width: 42, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  viewOptionActive: { backgroundColor: COLORS.green },
  productList: { paddingHorizontal: 17, paddingBottom: 15, gap: 11 },
  productCard: { overflow: 'hidden', padding: 10, borderRadius: 11, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  productMain: { minHeight: 106, flexDirection: 'row', gap: 11 },
  productImage: { width: 103, height: 106, borderRadius: 8, backgroundColor: '#E5ECE6' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  productName: { flex: 1, color: COLORS.dark, fontSize: 15, fontWeight: '700' },
  organicMark: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#EAF5EB' },
  productCategory: { marginTop: 3, color: COLORS.muted, fontSize: 11 },
  productPrice: { marginTop: 8, color: COLORS.green, fontSize: 17, fontWeight: '800' },
  priceUnit: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  productMeta: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { flex: 1, color: COLORS.muted, fontSize: 10 },
  ratingText: { color: COLORS.dark, fontSize: 11, fontWeight: '600' },
  addButton: { minHeight: 48, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 8, backgroundColor: COLORS.green },
  addButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  emptyText: { padding: 28, color: COLORS.muted, textAlign: 'center', fontSize: 14 },
  mapCanvas: { flex: 1, overflow: 'hidden', marginHorizontal: 17, marginBottom: 12, borderRadius: 14, backgroundColor: '#EAF0E6' },
  mapRoadHorizontal: { position: 'absolute', top: '48%', left: -30, width: '120%', height: 32, transform: [{ rotate: '-9deg' }], backgroundColor: '#FFFFFF', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#D7E0D6' },
  mapRoadVertical: { position: 'absolute', top: -35, left: '54%', width: 30, height: '110%', transform: [{ rotate: '17deg' }], backgroundColor: '#FFFFFF', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#D7E0D6' },
  mapRoadDiagonal: { position: 'absolute', top: '18%', left: -30, width: '115%', height: 19, transform: [{ rotate: '31deg' }], backgroundColor: '#FFFFFF', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#D7E0D6' },
  mapHeader: { position: 'absolute', top: 14, left: 14, right: 14, minHeight: 46, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 9, backgroundColor: COLORS.white },
  mapHeaderText: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  mapPin: { position: 'absolute', minHeight: 37, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, backgroundColor: COLORS.green, elevation: 3 },
  mapPin0: { top: '36%', left: '10%' },
  mapPin1: { top: '55%', right: '10%' },
  mapPin2: { top: '72%', left: '18%' },
  mapPin3: { top: '28%', right: '13%' },
  mapPinText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  youAreHere: { position: 'absolute', left: '43%', top: '58%', paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, backgroundColor: COLORS.white },
  youDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#3D7FF0' },
  youLabel: { color: COLORS.dark, fontSize: 10, fontWeight: '700' },
  mapCaption: { position: 'absolute', bottom: 13, alignSelf: 'center', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 7, overflow: 'hidden', backgroundColor: COLORS.white, color: COLORS.muted, fontSize: 11 },
  bottomNav: { minHeight: 62, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  navItem: { minWidth: 65, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 },
  navText: { color: COLORS.muted, fontSize: 10 },
  navTextActive: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
});

export default BuyerSearchScreen;