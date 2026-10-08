import React, { useMemo, useState } from 'react';
import {
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

const CATEGORIES = ['All Products', 'Vegetables', 'Fruits', 'Organic', 'Bulk'];

const FILTER_OPTIONS = ['Reduce 20km', 'Price Range', 'Rating'];

const MOCK_PRODUCE = [
  {
    id: 'produce-1',
    name: 'Fresh Carrots',
    category: 'Vegetables',
    price: 280,
    marketPrice: 330,
    unit: 'kg',
    harvested: '5 hours ago',
    farmer: 'Sunitha Farm',
    rating: 4.9,
    location: 'Dambulla',
    distance: 10.2,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=900',
  },
  {
    id: 'produce-2',
    name: 'Organic Leeks',
    category: 'Vegetables',
    price: 340,
    marketPrice: 390,
    unit: 'kg',
    harvested: '4.5 km away',
    farmer: 'Hill Country Organics',
    rating: 4.8,
    location: 'Nuwara Eliya',
    distance: 4.5,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1518977676405-d12e10cce364?w=900',
  },
  {
    id: 'produce-3',
    name: 'Nuwara Eliya Potatoes',
    category: 'Vegetables',
    price: 210,
    marketPrice: 260,
    unit: 'kg',
    harvested: '9.9 km away',
    farmer: 'Samark Farm Estates',
    rating: 4.7,
    location: 'Nuwara Eliya',
    distance: 9.9,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1518977676405-d12e10cce364?w=900',
  },
  {
    id: 'produce-4',
    name: 'Fresh Nuwara Eliya Carrots',
    category: 'Organic',
    price: 320,
    marketPrice: 380,
    unit: 'kg',
    harvested: '1 day ago',
    farmer: 'Earth Flavors',
    rating: 4.9,
    location: 'Nuwara Eliya',
    distance: 6.1,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=900',
  },
  {
    id: 'produce-5',
    name: 'Organic Leeks',
    category: 'Organic',
    price: 355,
    marketPrice: 400,
    unit: 'kg',
    harvested: '2 hours ago',
    farmer: 'Nimal Bandara',
    rating: 4.8,
    location: 'Kandy',
    distance: 3.2,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900',
  },
];

const formatPrice = (amount) => `Rs. ${amount.toLocaleString()}`;

export default function BuyerHomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [activeFilter, setActiveFilter] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const visibleProduce = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = MOCK_PRODUCE.filter((item) => {
      const matchesCategory = selectedCategory === 'All Products' || item.category === selectedCategory;
      const matchesQuery = !normalizedQuery || `${item.name} ${item.category} ${item.farmer}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
    if (sortByDistance) {
      filtered = [...filtered].sort((a, b) => a.distance - b.distance);
    }
    return filtered;
  }, [query, selectedCategory, sortByDistance]);

  const renderProduce = ({ item }) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name} from ${item.farmer}`}
      activeOpacity={0.88}
      style={styles.productCard}
      onPress={() => navigation.navigate('ProduceDetail', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productContent}>
        <View style={styles.productTopRow}>
          <View style={styles.farmerBadge}>
            <Ionicons name="leaf" size={11} color={COLORS.green} />
            <Text style={styles.farmerBadgeText}>{item.distance} km · {item.farmer}</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
        <View style={styles.productBottomRow}>
          <Text style={styles.price}>{formatPrice(item.price)} <Text style={styles.priceUnit}>/{item.unit}</Text></Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>qt: {item.stock}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>AgriDirect</Text>
          <Text style={styles.appSubtitle}>AGRI RESTAURANT SUB PORTAL</Text>
        </View>
        <TouchableOpacity style={styles.locationDropdown}>
          <Ionicons name="location" size={14} color={COLORS.white} />
          <Text style={styles.locationText}>Colombo 01</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.muted} />
        <TextInput
          accessibilityLabel="Search produce"
          placeholder="Search carrots, leeks, tomatoes..."
          placeholderTextColor="#8A938C"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 ? (
          <TouchableOpacity accessibilityRole="button" onPress={() => setQuery('')} style={styles.searchIcon}>
            <Ionicons name="close-circle" size={19} color={COLORS.muted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="mic" size={20} color={COLORS.green} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
        {CATEGORIES.map((category) => {
          const selected = category === selectedCategory;
          return (
            <TouchableOpacity
              key={category}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, selected && styles.categoryChipSelected]}
            >
              <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{category}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(activeFilter === filter ? null : filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>{filter}</Text>
              <Ionicons name="chevron-down" size={12} color={activeFilter === filter ? COLORS.white : COLORS.muted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Rating</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.muted} />
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity onPress={() => setSortByDistance((v) => !v)} style={styles.sortHarvestBtn}>
          <Text style={styles.sortHarvestText}>Sort: {sortByDistance ? 'Distance' : 'Nearest'}</Text>
        </TouchableOpacity>
      </View>

      {/* Section Heading */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Nearby Fresh Produce</Text>
        <TouchableOpacity onPress={() => setSortByDistance((v) => !v)}>
          <Text style={styles.sortDistanceText}>Sort Distance</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>  Browsing All products near Colombo 01</Text>

      <FlatList
        data={visibleProduce}
        keyExtractor={(item) => item.id}
        renderItem={renderProduce}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={<Text style={styles.emptyText}>No produce matches that search.</Text>}
      />

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { name: 'Explore', icon: 'search', active: true },
          { name: 'My Cart', icon: 'bag-outline', active: false },
          { name: 'Orders', icon: 'receipt-outline', active: false },
          { name: 'Profile', icon: 'person-outline', active: false },
        ].map((tab) => (
          <TouchableOpacity key={tab.name} style={styles.tabItem}>
            <Ionicons name={tab.icon} size={22} color={tab.active ? COLORS.green : COLORS.muted} />
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#F5F7F5',
  dark: '#1A1A1A',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
  headerGreen: '#1B5E20',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.green,
  },
  headerLeft: {},
  appTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  appSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: '600', letterSpacing: 0.5, marginTop: 1 },
  locationDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  // Search
  searchBox: {
    height: 48,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 24,
    backgroundColor: COLORS.white,
  },
  searchInput: { flex: 1, height: 48, marginLeft: 8, color: COLORS.dark, fontSize: 14 },
  searchIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Categories
  categoryList: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  categoryChip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    backgroundColor: COLORS.white,
  },
  categoryChipSelected: { backgroundColor: COLORS.green },
  categoryChipText: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
  categoryChipTextSelected: { color: COLORS.white },

  // Filters
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 12, marginBottom: 4 },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 4, gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  filterChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  filterChipText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.white },
  sortHarvestBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  sortHarvestText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },

  // Section
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  sectionTitle: { color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  sortDistanceText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },

  // Product Grid
  listContent: { paddingHorizontal: 12, paddingBottom: 80 },
  columnWrapper: { gap: 10, marginBottom: 10 },
  productCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  productImage: { width: '100%', height: 110, backgroundColor: '#E5ECE6' },
  productContent: { padding: 8 },
  productTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  farmerBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  farmerBadgeText: { color: COLORS.muted, fontSize: 9, fontWeight: '600', flexShrink: 1 },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: { color: COLORS.dark, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  productBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: COLORS.green, fontSize: 13, fontWeight: '800' },
  priceUnit: { color: COLORS.muted, fontSize: 10, fontWeight: '500' },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#EAF5EB',
  },
  stockText: { color: COLORS.green, fontSize: 9, fontWeight: '700' },

  emptyText: { padding: 28, color: COLORS.muted, textAlign: 'center', fontSize: 15 },

  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '600' },
  tabLabelActive: { color: COLORS.green },
});