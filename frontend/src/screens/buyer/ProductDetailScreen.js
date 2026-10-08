import React from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCT = {
  id: 'carrot-01',
  name: 'Fresh Nuwara Eliya Carrots',
  category: 'Vegetables',
  price: 280,
  unit: 'kg',
  rating: 4.8,
  reviews: 132,
  harvest: 'Harvested Yesterday Morning',
  harvestBadge: 'Nuwara Eliya (180km away)',
  location: 'Nuwara Eliya',
  distance: 180,
  farmer: 'Sunil Perera',
  farmerLocation: 'Nuwara Eliya, Sri Lanka',
  phone: '+94 77 234 5678',
  image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=1200',
  farmerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  availableStock: 500,
  minimumOrder: 10,
  unitPrice: 280,
  addOrderQty: 20,
};

const REVIEWS = [
  { id: 'review-a', name: 'Priya G.', date: '2 days ago', rating: 5, text: 'Crisp, sweet carrots and delivered right on time.' },
  { id: 'review-b', name: 'Kasun D.', date: '1 week ago', rating: 5, text: 'Great quality from a reliable farmer. Very fresh.' },
];

function ProductDetailScreen({ route, navigation }) {
  const product = { ...PRODUCT, ...(route?.params?.product || {}) };

  const continueToCheckout = () =>
    navigation.navigate('Checkout', { product, quantity: product.addOrderQty });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.hero}>
          <Image source={{ uri: product.image }} style={styles.heroImage} />

          {/* Back button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={23} color={COLORS.dark} />
          </TouchableOpacity>

          {/* Share / bookmark */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroActionBtn}>
              <Ionicons name="share-social-outline" size={20} color={COLORS.dark} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroActionBtn}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {/* Harvest / location tags */}
          <View style={styles.heroTags}>
            <View style={styles.heroTag}>
              <Ionicons name="time-outline" size={13} color={COLORS.green} />
              <Text style={styles.heroTagText}>{product.harvest}</Text>
            </View>
            <View style={[styles.heroTag, styles.heroTagGreen]}>
              <Ionicons name="location-outline" size={13} color={COLORS.white} />
              <Text style={[styles.heroTagText, styles.heroTagTextWhite]}>{product.harvestBadge || product.location}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.productName}>{product.name}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#E5A500" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewCount}>({product.reviews} reviews)</Text>
            </View>
          </View>

          {/* Price */}
          <Text style={styles.price}>
            Rs. {Number(product.price).toLocaleString()} <Text style={styles.unit}>/ {product.unit}</Text>
          </Text>

          {/* Farmer Card */}
          <View style={styles.farmerCard}>
            <Image source={{ uri: product.farmerImage }} style={styles.farmerPhoto} />
            <View style={styles.farmerInfo}>
              <View style={styles.farmerNameRow}>
                <Text style={styles.farmerName}>{product.farmer}</Text>
                <View style={styles.verified}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.farmerLocation}>{product.farmerLocation}</Text>
              <View style={styles.farmerRatingRow}>
                <Ionicons name="star" size={12} color="#E5A500" />
                <Text style={styles.farmerRatingText}>{product.rating} farmer rating</Text>
              </View>
            </View>
          </View>

          {/* Farmer action buttons */}
          <View style={styles.farmerActions}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                Linking.openURL(`tel:${product.phone}`).catch(() =>
                  Alert.alert('Call unavailable', 'This device cannot start a phone call.')
                )
              }
              style={styles.callButton}
            >
              <Ionicons name="call-outline" size={17} color={COLORS.green} />
              <Text style={styles.callButtonText}>Call Farmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                Alert.alert('Chat with farmer', `A chat with ${product.farmer} will be available soon.`)
              }
              style={styles.chatButton}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={17} color={COLORS.white} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Specifications */}
          <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
          <View style={styles.specTable}>
            {[
              ['Available Stock', `${product.availableStock} kg available`],
              ['Min Order Qty', `Min ${product.minimumOrder} kg`],
              ['Unit Price', `Rs. ${Number(product.price).toLocaleString()} / ${product.unit}`],
              ['Add Order Qty', `${product.addOrderQty} kg`],
            ].map(([label, value], index) => (
              <View
                key={label}
                style={[styles.specRow, index === 3 && styles.specRowLast]}
              >
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Buyer Reviews */}
          <View style={styles.reviewsTitleRow}>
            <Text style={styles.sectionTitle}>BUYER REVIEWS</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.review}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewer}>{review.name}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={13}
                    color={star <= review.rating ? '#E5A500' : '#DDD'}
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { name: 'Explore', icon: 'search', active: false },
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
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 80 },

  // Hero
  hero: { height: 290, backgroundColor: '#E5ECE6', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    gap: 8,
  },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTags: {
    position: 'absolute',
    left: 13,
    right: 13,
    bottom: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  heroTagGreen: { backgroundColor: COLORS.green },
  heroTagText: { color: COLORS.dark, fontSize: 11, fontWeight: '600' },
  heroTagTextWhite: { color: COLORS.white },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titleCopy: { flex: 1 },
  productName: { color: COLORS.dark, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { color: COLORS.dark, fontSize: 14, fontWeight: '800' },
  reviewCount: { color: COLORS.muted, fontSize: 11 },
  price: { marginTop: 6, color: COLORS.green, fontSize: 24, fontWeight: '800' },
  unit: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },

  // Farmer Card
  farmerCard: {
    marginTop: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  farmerPhoto: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E5ECE6' },
  farmerInfo: { flex: 1, gap: 3 },
  farmerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  farmerName: { color: COLORS.dark, fontSize: 14, fontWeight: '800' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { color: COLORS.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  farmerLocation: { color: COLORS.muted, fontSize: 11 },
  farmerRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmerRatingText: { color: COLORS.dark, fontSize: 11, fontWeight: '600' },

  // Farmer Actions
  farmerActions: { marginTop: 10, flexDirection: 'row', gap: 10 },
  callButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  callButtonText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  chatButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: COLORS.green,
  },
  chatButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  // Specs
  sectionTitle: { marginTop: 18, marginBottom: 9, color: COLORS.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  specTable: {
    overflow: 'hidden',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  specRow: {
    minHeight: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  specRowLast: { borderBottomWidth: 0 },
  specLabel: { color: COLORS.muted, fontSize: 12 },
  specValue: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },

  // Reviews
  reviewsTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAllText: { color: COLORS.green, fontSize: 12, fontWeight: '700', marginTop: 18 },
  review: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewer: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewStars: { marginTop: 5, flexDirection: 'row', gap: 2 },
  reviewText: { marginTop: 5, color: COLORS.muted, fontSize: 12, lineHeight: 18 },

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

export default ProductDetailScreen;