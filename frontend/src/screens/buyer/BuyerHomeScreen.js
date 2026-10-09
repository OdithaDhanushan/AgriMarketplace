import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const CITIES = [
  'Colombo 01', 'Colombo 03', 'Colombo 05', 'Colombo 07',
  'Colombo 10', 'Kandy', 'Galle', 'Negombo', 'Kurunegala',
  'Jaffna', 'Matara', 'Anuradhapura',
];

const CATEGORIES = ['All Produce', 'Vegetables', 'Fruits', 'Organic', 'Bulk'];

const RADIUS_OPTIONS = ['5km', '10km', '20km', '50km', '100km'];
const PRICE_OPTIONS = ['Any Price', 'Under Rs.200', 'Rs.200–500', 'Rs.500–1000', 'Above Rs.1000'];
const RATING_OPTIONS = ['Any Rating', '3★+', '4★+', '4.5★+', '5★ only'];
const SORT_OPTIONS = ['Nearest', 'Price: Low–High', 'Price: High–Low', 'Rating', 'Newest'];

const normalizeProduce = (p) => ({
  id: p._id || `produce-${Math.random()}`,
  _id: p._id,
  name: p.cropName || 'Fresh Produce',
  cropName: p.cropName || 'Fresh Produce',
  category: p.category || 'Vegetables',
  price: Number(p.sellingPricePerKg ?? p.price ?? 0),
  marketPrice: Number(p.marketPricePerKg ?? p.sellingPricePerKg ?? p.price ?? 0),
  unit: 'kg',
  farmer: p.farmer || 'Local Farm',
  farmerPhone: p.farmerPhone || '+94 77 123 4567',
  rating: Number(p.rating || 4.8),
  distance: Number(p.distanceKm || p.distance || 5.0),
  stock: Number(p.quantityKg ?? p.stock ?? 10),
  availableStock: Number(p.quantityKg ?? p.availableStock ?? 10),
  minOrderQty: Number(p.minOrderQty || 1),
  harvest: p.harvestDate ? `Harvested: ${p.harvestDate}` : 'Harvested recently',
  locationBadge: `${p.location || 'Sri Lanka'} (${p.distanceKm || p.distance || 5}km away)`,
  image: p.photoUrl || p.image || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
  photoUrl: p.photoUrl || p.image || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
  description: p.description || '',
  isSoldOut: Boolean(p.isSoldOut),
  createdAt: p.createdAt,
});

// ─── Dropdown Component ───────────────────────────────────────────────────────

function DropdownModal({ visible, title, options, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => { onSelect(option); onClose(); }}
              style={[styles.modalOption, selected === option && styles.modalOptionSelected]}
            >
              <Text style={[styles.modalOptionText, selected === option && styles.modalOptionTextSelected]}>
                {option}
              </Text>
              {selected === option && <Ionicons name="checkmark" size={16} color={COLORS.green} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BuyerHomeScreen({ navigation }) {
  const [produceList, setProduceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Produce');
  const [selectedCity, setSelectedCity] = useState('Colombo 07');
  const [selectedRadius, setSelectedRadius] = useState('20km');
  const [selectedPrice, setSelectedPrice] = useState('Any Price');
  const [selectedRating, setSelectedRating] = useState('4★+');
  const [selectedSort, setSelectedSort] = useState('Nearest');

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [radiusModalVisible, setRadiusModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const fetchProduce = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get('/produce');
      let data = res.data;
      if (Array.isArray(data) && data.length === 0) {
        const seedRes = await api.post('/produce/seed');
        data = seedRes.data?.list || [];
      }
      if (Array.isArray(data)) {
        setProduceList(data.map(normalizeProduce));
      }
    } catch (err) {
      console.log('Error fetching produce:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProduce();
  }, [fetchProduce]);

  const visibleProduce = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = produceList.filter((item) => {
      const matchCat = selectedCategory === 'All Produce' || item.category === selectedCategory;
      const matchQ = !q || `${item.name} ${item.category} ${item.farmer}`.toLowerCase().includes(q);

      // Price filter
      let matchPrice = true;
      if (selectedPrice === 'Under Rs.200') matchPrice = item.price < 200;
      else if (selectedPrice === 'Rs.200–500') matchPrice = item.price >= 200 && item.price <= 500;
      else if (selectedPrice === 'Rs.500–1000') matchPrice = item.price > 500 && item.price <= 1000;
      else if (selectedPrice === 'Above Rs.1000') matchPrice = item.price > 1000;

      // Rating filter
      let matchRating = true;
      if (selectedRating === '3★+') matchRating = item.rating >= 3;
      else if (selectedRating === '4★+') matchRating = item.rating >= 4;
      else if (selectedRating === '4.5★+') matchRating = item.rating >= 4.5;
      else if (selectedRating === '5★ only') matchRating = item.rating === 5;

      // Radius filter (distance in km)
      const radiusVal = parseFloat(selectedRadius);
      const matchRadius = item.distance <= radiusVal;

      return matchCat && matchQ && matchPrice && matchRating && matchRadius;
    });

    // Sort
    if (selectedSort === 'Nearest') list = [...list].sort((a, b) => a.distance - b.distance);
    else if (selectedSort === 'Price: Low–High') list = [...list].sort((a, b) => a.price - b.price);
    else if (selectedSort === 'Price: High–Low') list = [...list].sort((a, b) => b.price - a.price);
    else if (selectedSort === 'Rating') list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [produceList, query, selectedCategory, selectedRadius, selectedPrice, selectedRating, selectedSort]);

  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    navigation.navigate('My Cart');
  };

  const renderProduce = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.productCard}
      onPress={() => navigation.navigate('ProduceDetail', { item })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.placeholderImg]}>
          <Ionicons name="leaf" size={28} color={COLORS.green} />
        </View>
      )}
      <View style={styles.productContent}>
        <View style={styles.productMeta}>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{item.distance}km away</Text>
          </View>
          <Text numberOfLines={1} style={styles.farmerName}>{item.farmer}</Text>
        </View>
        <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.price}>Rs. {item.price.toLocaleString()} <Text style={styles.priceUnit}>/{item.unit}</Text></Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#E5A500" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel={`Add ${item.name} to cart`}
        onPress={() => handleAddToCart(item)}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>AgriDirect</Text>
          <Text style={styles.appSubtitle}>RESTAURANT B2B PORTAL</Text>
        </View>
        <TouchableOpacity style={styles.locationPill} onPress={() => setCityModalVisible(true)}>
          <Ionicons name="location" size={13} color={COLORS.green} />
          <Text style={styles.locationPillText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={13} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.muted} />
        <TextInput
          placeholder="Search carrots, leeks, tomatoes..."
          placeholderTextColor="#9AA09C"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="mic" size={18} color={COLORS.green} />
        )}
      </View>

      {/* ── Category Chips ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
        {CATEGORIES.map((cat) => {
          const selected = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryChip, selected && styles.categoryChipSelected]}
            >
              <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Filter Row ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <TouchableOpacity style={styles.filterChip} onPress={() => setRadiusModalVisible(true)}>
          <Text style={styles.filterChipText}>Radius: {selectedRadius}</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.dark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setPriceModalVisible(true)}>
          <Text style={styles.filterChipText}>{selectedPrice === 'Any Price' ? 'Price Range' : selectedPrice}</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.dark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setRatingModalVisible(true)}>
          <Text style={styles.filterChipText}>Rating {selectedRating}</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.dark} />
        </TouchableOpacity>
      </ScrollView>

      {/* ── Results Info Row ── */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>Showing {visibleProduce.length} products near you</Text>
        <TouchableOpacity onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortText}>Sort: {selectedSort}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Nearby Fresh Produce</Text>
          <Text style={styles.sectionSubtitle}>{visibleProduce.length} suppliers found near {selectedCity}</Text>
        </View>
        <TouchableOpacity style={styles.sortDistanceBtn} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortDistanceBtnText}>Sort: Distance</Text>
        </TouchableOpacity>
      </View>

      {/* ── Product List ── */}
      <FlatList
        data={visibleProduce}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={renderProduce}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProduce(true)}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color={COLORS.green} />
              <Text style={styles.emptyText}>Loading fresh produce from farmers...</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="leaf-outline" size={36} color={COLORS.muted} />
              <Text style={styles.emptyText}>No produce found matching your filters.</Text>
            </View>
          )
        }
      />

      {/* ── Dropdowns ── */}
      <DropdownModal
        visible={cityModalVisible}
        title="Select City"
        options={CITIES}
        selected={selectedCity}
        onSelect={setSelectedCity}
        onClose={() => setCityModalVisible(false)}
      />
      <DropdownModal
        visible={radiusModalVisible}
        title="Search Radius"
        options={RADIUS_OPTIONS}
        selected={selectedRadius}
        onSelect={setSelectedRadius}
        onClose={() => setRadiusModalVisible(false)}
      />
      <DropdownModal
        visible={priceModalVisible}
        title="Price Range"
        options={PRICE_OPTIONS}
        selected={selectedPrice}
        onSelect={setSelectedPrice}
        onClose={() => setPriceModalVisible(false)}
      />
      <DropdownModal
        visible={ratingModalVisible}
        title="Minimum Rating"
        options={RATING_OPTIONS}
        selected={selectedRating}
        onSelect={setSelectedRating}
        onClose={() => setRatingModalVisible(false)}
      />
      <DropdownModal
        visible={sortModalVisible}
        title="Sort By"
        options={SORT_OPTIONS}
        selected={selectedSort}
        onSelect={setSelectedSort}
        onClose={() => setSortModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Colors & Styles ──────────────────────────────────────────────────────────

const COLORS = {
  green: '#2E7D32',
  background: '#F5F7F5',
  dark: '#1A1A1A',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
  headerBg: '#F0F7F0',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.headerBg,
  },
  appTitle: { color: COLORS.green, fontSize: 22, fontWeight: '800' },
  appSubtitle: { color: COLORS.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 1 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.white,
  },
  locationPillText: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: COLORS.white,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.dark },

  // Categories
  categoryList: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  categoryChipSelected: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  categoryChipText: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  categoryChipTextSelected: { color: COLORS.white },

  // Filters
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 6 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  filterChipText: { color: COLORS.dark, fontSize: 12, fontWeight: '600' },

  // Results row
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultsText: { color: COLORS.muted, fontSize: 12 },
  sortText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  sectionTitle: { color: COLORS.dark, fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  sortDistanceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#EAF5EB',
  },
  sortDistanceBtnText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },

  // Product list
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
    paddingRight: 10,
  },
  productImage: { width: 90, height: 90, backgroundColor: '#E5ECE6' },
  placeholderImg: { justifyContent: 'center', alignItems: 'center' },
  productContent: { flex: 1, paddingVertical: 10, paddingHorizontal: 10 },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  distanceBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#EAF5EB',
  },
  distanceText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  farmerName: { color: COLORS.muted, fontSize: 11, fontWeight: '500', flexShrink: 1 },
  productName: { color: COLORS.dark, fontSize: 15, fontWeight: '700', marginBottom: 5 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  priceUnit: { color: COLORS.muted, fontSize: 11, fontWeight: '500' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    maxHeight: 420,
  },
  modalTitle: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  modalOptionSelected: { backgroundColor: '#EAF5EB' },
  modalOptionText: { color: COLORS.dark, fontSize: 14 },
  modalOptionTextSelected: { color: COLORS.green, fontWeight: '700' },
});