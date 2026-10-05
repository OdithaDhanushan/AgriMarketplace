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

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Rice', 'Spices'];

const MOCK_PRODUCE = [
  {
    id: 'produce-1',
    name: 'Vine Tomatoes',
    category: 'Vegetables',
    price: 280,
    marketPrice: 330,
    unit: 'kg',
    harvested: '5 hours ago',
    farmer: 'Nimali Perera',
    rating: 4.9,
    location: 'Dambulla',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=900',
  },
  {
    id: 'produce-2',
    name: 'Sweet Papaya',
    category: 'Fruits',
    price: 190,
    marketPrice: 220,
    unit: 'kg',
    harvested: '3 hours ago',
    farmer: 'Saman Jayawardena',
    rating: 4.8,
    location: 'Kurunegala',
    image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=900',
  },
  {
    id: 'produce-3',
    name: 'Red Nadu Rice',
    category: 'Rice',
    price: 240,
    marketPrice: 260,
    unit: 'kg',
    harvested: '2 days ago',
    farmer: 'Kumara Bandara',
    rating: 4.7,
    location: 'Polonnaruwa',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900',
  },
  {
    id: 'produce-4',
    name: 'Ceylon Cinnamon',
    category: 'Spices',
    price: 720,
    marketPrice: 850,
    unit: '250 g',
    harvested: '1 day ago',
    farmer: 'Anula Fernando',
    rating: 5.0,
    location: 'Matale',
    image: 'https://images.unsplash.com/photo-1603905179139-d6e3a4b4e7a9?w=900',
  },
];

const formatPrice = (amount) => `Rs. ${amount.toLocaleString()}`;

export default function BuyerHomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const visibleProduce = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return MOCK_PRODUCE.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery = !normalizedQuery || `${item.name} ${item.category} ${item.farmer}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const renderProduce = ({ item }) => {
    const savingsPercent = Math.round(((item.marketPrice - item.price) / item.marketPrice) * 100);
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name} from ${item.farmer}`}
        activeOpacity={0.88}
        style={styles.productCard}
        onPress={() => navigation.navigate('ProduceDetail', { item })}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productContent}>
          <View style={styles.productHeading}>
            <View style={styles.titleGroup}>
              <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
              <Text style={styles.categoryLabel}>{item.category}</Text>
            </View>
            <View style={styles.priceGroup}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
              <Text style={styles.priceUnit}>/ {item.unit}</Text>
            </View>
          </View>
          <View style={styles.savingsBadge}>
            <Ionicons name="trending-down" size={15} color={COLORS.green} />
            <Text style={styles.savingsText}>{savingsPercent}% lower than market</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.mutedMeta}><Ionicons name="time-outline" size={14} color={COLORS.muted} />  Harvested {item.harvested}</Text>
            <Text style={styles.rating}><Ionicons name="star" size={14} color="#E5A500" /> {item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.farmerRow}>
            <View style={styles.farmerAvatar}><Ionicons name="person" size={15} color={COLORS.green} /></View>
            <Text style={styles.farmerName}>{item.farmer}</Text>
            <Text style={styles.farmerLocation}>{item.location}</Text>
            <Ionicons name="chevron-forward" size={17} color={COLORS.muted} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Field & Fork</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={15} color={COLORS.green} />
            <Text style={styles.locationText}>Delivering to Colombo 07</Text>
            <Ionicons name="chevron-down" size={15} color={COLORS.dark} />
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="My farmers"
            style={styles.headerButton}
            onPress={() => navigation.navigate('MyFarmers')}
          >
            <Ionicons name="heart-outline" size={22} color={COLORS.dark} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open cart"
            style={styles.headerButton}
            onPress={() => navigation.navigate('CartCheckout')}
          >
            <Ionicons name="bag-outline" size={23} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.muted} />
        <TextInput
          accessibilityLabel="Search produce"
          placeholder="Search fresh produce or farmers"
          placeholderTextColor="#8A938C"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={19} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

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

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Fresh from the farm</Text>
          <Text style={styles.sectionSubtitle}>{visibleProduce.length} local picks for you</Text>
        </View>
        <Ionicons name="leaf-outline" size={22} color={COLORS.green} />
      </View>

      <FlatList
        data={visibleProduce}
        keyExtractor={(item) => item.id}
        renderItem={renderProduce}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No produce matches that search.</Text>}
      />
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { minHeight: 76, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appTitle: { color: COLORS.dark, fontSize: 24, fontWeight: '800' },
  locationRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { color: COLORS.muted, fontSize: 13 },
  headerActions: { flexDirection: 'row', gap: 7 },
  headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: COLORS.white },
  searchBox: { height: 52, marginHorizontal: 20, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, backgroundColor: COLORS.white },
  searchInput: { flex: 1, height: 48, marginLeft: 10, color: COLORS.dark, fontSize: 15 },
  clearButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  categoryList: { paddingHorizontal: 20, paddingVertical: 14, gap: 9 },
  categoryChip: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 17, borderRadius: 24, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  categoryChipSelected: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  categoryChipText: { color: COLORS.dark, fontSize: 14, fontWeight: '600' },
  categoryChipTextSelected: { color: COLORS.white },
  sectionHeading: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.dark, fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { marginTop: 3, color: COLORS.muted, fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 13 },
  productCard: { overflow: 'hidden', borderRadius: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line },
  productImage: { width: '100%', height: 170, backgroundColor: '#E5ECE6' },
  productContent: { padding: 14 },
  productHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  titleGroup: { flex: 1 },
  productName: { color: COLORS.dark, fontSize: 18, fontWeight: '750' },
  categoryLabel: { marginTop: 3, color: COLORS.muted, fontSize: 13 },
  priceGroup: { alignItems: 'flex-end' },
  price: { color: COLORS.green, fontSize: 17, fontWeight: '800' },
  priceUnit: { color: COLORS.muted, fontSize: 12 },
  savingsBadge: { alignSelf: 'flex-start', marginTop: 11, paddingVertical: 6, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, backgroundColor: '#EAF5EB' },
  savingsText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  metaRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mutedMeta: { color: COLORS.muted, fontSize: 12 },
  rating: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  farmerRow: { minHeight: 48, marginTop: 9, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: COLORS.line },
  farmerAvatar: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#EAF5EB' },
  farmerName: { flex: 1, color: COLORS.dark, fontSize: 13, fontWeight: '650' },
  farmerLocation: { color: COLORS.muted, fontSize: 12 },
  emptyText: { padding: 28, color: COLORS.muted, textAlign: 'center', fontSize: 15 },
});