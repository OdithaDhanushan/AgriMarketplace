import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Default product data ─────────────────────────────────────────────────────
const PRODUCT = {
  id: 'carrot-01',
  name: 'Fresh Nuwara Eliya Carrots',
  category: 'Vegetables',
  price: 280,
  unit: 'kg',
  rating: 4.8,
  reviews: 42,
  harvest: 'Harvested: Yesterday Morning',
  locationBadge: 'Nuwara Eliya (160km away)',
  farmer: 'Sunil Perera',
  farmerRating: 4.8,
  farmerReviews: 42,
  farmerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  phone: '+94 77 234 5678',
  image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=1200',
  availableStock: 500,
  minOrderQty: 10,
};

const MOCK_REVIEWS = [
  {
    id: 'r1',
    name: 'Priya G.',
    rating: 5,
    date: '2 days ago',
    text: 'Very fresh carrots! Delivered on time and quality was excellent.',
  },
  {
    id: 'r2',
    name: 'Kasun D.',
    rating: 4,
    date: '1 week ago',
    text: 'Good quality. Slightly smaller than expected but taste was great.',
  },
  {
    id: 'r3',
    name: 'Malini K.',
    rating: 5,
    date: '2 weeks ago',
    text: 'Best carrots I have ordered! Will definitely buy again.',
  },
];

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRow({ rating, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color="#E5A500"
        />
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
function ProductDetailScreen({ route, navigation }) {
  const product = { ...PRODUCT, ...(route?.params?.product || {}) };

  const [orderQty, setOrderQty] = useState(String(product.minOrderQty * 2)); // default 20kg
  const [isWishlisted, setIsWishlisted] = useState(false);

  const parsedQty = parseInt(orderQty, 10) || 0;
  const isValidQty = parsedQty >= product.minOrderQty && parsedQty <= product.availableStock;

  const handleOrderNow = () => {
    if (!isValidQty) {
      Alert.alert(
        'Invalid Quantity',
        `Please enter a quantity between ${product.minOrderQty}kg and ${product.availableStock}kg.`
      );
      return;
    }
    navigation.navigate('Checkout', { product, quantity: parsedQty });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${product.phone}`).catch(() =>
      Alert.alert('Call unavailable', 'This device cannot start a phone call.')
    );
  };

  const handleChat = () => {
    Alert.alert('Chat with Farmer', `A chat with ${product.farmer} will be available soon.`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Image ── */}
        <View style={styles.hero}>
          <Image source={{ uri: product.image }} style={styles.heroImage} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.dark} />
          </TouchableOpacity>

          {/* Share & Wishlist */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroActionBtn}>
              <Ionicons name="share-social-outline" size={20} color={COLORS.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroActionBtn}
              onPress={() => setIsWishlisted((v) => !v)}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={isWishlisted ? '#E53935' : COLORS.dark}
              />
            </TouchableOpacity>
          </View>

          {/* Dot indicators */}
          <View style={styles.heroDots}>
            <View style={[styles.heroDot, styles.heroDotActive]} />
            <View style={styles.heroDot} />
            <View style={styles.heroDot} />
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>

          {/* Harvest & Location tags */}
          <View style={styles.tagRow}>
            <View style={styles.tagGreen}>
              <Text style={styles.tagGreenText}>{product.harvest}</Text>
            </View>
            <View style={styles.tagYellow}>
              <Text style={styles.tagYellowText}>{product.locationBadge}</Text>
            </View>
          </View>

          {/* Product name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price & Rating */}
          <View style={styles.priceRatingRow}>
            <Text style={styles.price}>
              Rs. {Number(product.price).toLocaleString()}{' '}
              <Text style={styles.priceUnit}>/ {product.unit}</Text>
            </Text>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={15} color="#E5A500" />
              <Text style={styles.ratingVal}>{product.rating}</Text>
              <Text style={styles.ratingCount}>({product.reviews} reviews)</Text>
            </View>
          </View>

          {/* ── Farmer Card ── */}
          <View style={styles.farmerCard}>
            <Image source={{ uri: product.farmerImage }} style={styles.farmerPhoto} />
            <View style={styles.farmerInfo}>
              <View style={styles.farmerNameRow}>
                <Text style={styles.farmerName}>{product.farmer}</Text>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
              </View>
              <View style={styles.farmerRatingRow}>
                <Ionicons name="star" size={12} color="#E5A500" />
                <Text style={styles.farmerRatingText}>
                  {product.farmerRating} ({product.farmerReviews} reviews)
                </Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>

          {/* Farmer contact buttons */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call-outline" size={16} color={COLORS.green} />
              <Text style={styles.callButtonText}>Call Farmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.white} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* ── Specifications ── */}
          <Text style={styles.sectionLabel}>SPECIFICATIONS</Text>
          <View style={styles.specCard}>
            {/* Available Stock */}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Available Stock</Text>
              <Text style={styles.specVal}>{product.availableStock} kg available</Text>
            </View>
            <View style={styles.specDivider} />

            {/* Min Order Qty */}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Min. Order Qty</Text>
              <Text style={styles.specVal}>Min {product.minOrderQty} kg</Text>
            </View>
            <View style={styles.specDivider} />

            {/* Unit Price */}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Unit Price</Text>
              <Text style={[styles.specVal, styles.specValGreen]}>
                Rs. {Number(product.price).toLocaleString()} / {product.unit}
              </Text>
            </View>
            <View style={styles.specDivider} />

            {/* Add Order Qty — editable */}
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Add Order Qty</Text>
              <View style={styles.qtyInputWrap}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    const v = Math.max(product.minOrderQty, parsedQty - 5);
                    setOrderQty(String(v));
                  }}
                >
                  <Ionicons name="remove" size={16} color={COLORS.green} />
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={orderQty}
                  onChangeText={(v) => setOrderQty(v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={5}
                  selectTextOnFocus
                />
                <Text style={styles.qtyUnit}>kg</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    const v = Math.min(product.availableStock, parsedQty + 5);
                    setOrderQty(String(v));
                  }}
                >
                  <Ionicons name="add" size={16} color={COLORS.green} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Order total preview */}
          {isValidQty && (
            <View style={styles.orderPreview}>
              <Text style={styles.orderPreviewLabel}>Order Total ({parsedQty} {product.unit})</Text>
              <Text style={styles.orderPreviewVal}>
                Rs. {(product.price * parsedQty).toLocaleString()}
              </Text>
            </View>
          )}

          {/* ── Order Now Button ── */}
          <TouchableOpacity
            style={[styles.orderBtn, !isValidQty && styles.orderBtnDisabled]}
            onPress={handleOrderNow}
            activeOpacity={0.85}
          >
            <Ionicons name="bag-check-outline" size={20} color={COLORS.white} />
            <Text style={styles.orderBtnText}>Order Now</Text>
          </TouchableOpacity>

          {!isValidQty && parsedQty > 0 && (
            <Text style={styles.qtyWarning}>
              {parsedQty < product.minOrderQty
                ? `Minimum order is ${product.minOrderQty} kg`
                : `Only ${product.availableStock} kg available`}
            </Text>
          )}

          {/* ── Buyer Reviews ── */}
          <View style={styles.reviewsTitleRow}>
            <Text style={styles.sectionLabel}>BUYER REVIEWS</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.name[0]}</Text>
                </View>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <StarRow rating={review.rating} size={13} />
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  green: '#2E7D32',
  background: '#F5F7F5',
  dark: '#1A1A1A',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 24 },

  // Hero
  hero: { height: 270, backgroundColor: '#D5E8D6', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: {
    position: 'absolute', top: 14, left: 14,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  heroActions: { position: 'absolute', top: 14, left: 62, flexDirection: 'row', gap: 8 },
  heroActionBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  heroDots: {
    position: 'absolute', bottom: 12, alignSelf: 'center',
    width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  heroDotActive: { backgroundColor: COLORS.green, width: 18 },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 14 },

  // Tags
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  tagGreen: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, backgroundColor: '#EAF5EB',
    borderWidth: 1, borderColor: '#B9D9BC',
  },
  tagGreenText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  tagYellow: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, backgroundColor: '#FFF8E1',
    borderWidth: 1, borderColor: '#FFE082',
  },
  tagYellowText: { color: '#795548', fontSize: 11, fontWeight: '700' },

  // Product name & price
  productName: { color: COLORS.dark, fontSize: 22, fontWeight: '800', marginBottom: 8, lineHeight: 28 },
  priceRatingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  price: { color: COLORS.green, fontSize: 22, fontWeight: '800' },
  priceUnit: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal: { color: COLORS.dark, fontSize: 13, fontWeight: '800' },
  ratingCount: { color: COLORS.muted, fontSize: 11 },

  // Farmer Card
  farmerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.line,
    backgroundColor: COLORS.white, marginBottom: 10,
  },
  farmerPhoto: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5ECE6' },
  farmerInfo: { flex: 1, gap: 4 },
  farmerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  farmerName: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },
  farmerRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmerRatingText: { color: COLORS.muted, fontSize: 12 },
  verifiedBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, backgroundColor: '#EAF5EB',
  },
  verifiedText: { color: COLORS.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  // Contact buttons
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  callButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, minHeight: 46,
    borderWidth: 1.5, borderColor: COLORS.green,
    borderRadius: 10, backgroundColor: COLORS.white,
  },
  callButtonText: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  chatButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, minHeight: 46,
    borderRadius: 10, backgroundColor: COLORS.green,
  },
  chatButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

  // Specifications
  sectionLabel: {
    color: COLORS.muted, fontSize: 12, fontWeight: '800',
    letterSpacing: 0.5, marginBottom: 10,
  },
  specCard: {
    borderWidth: 1, borderColor: COLORS.line,
    borderRadius: 12, backgroundColor: COLORS.white,
    paddingHorizontal: 14, marginBottom: 12,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', minHeight: 50,
  },
  specDivider: { borderTopWidth: 1, borderTopColor: COLORS.line },
  specKey: { color: COLORS.muted, fontSize: 13 },
  specVal: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  specValGreen: { color: COLORS.green },

  // Qty input
  qtyInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#EAF5EB',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyInput: {
    width: 48, height: 34,
    borderWidth: 1, borderColor: COLORS.line,
    borderRadius: 8, textAlign: 'center',
    color: COLORS.green, fontSize: 14, fontWeight: '800',
    backgroundColor: COLORS.white,
  },
  qtyUnit: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },

  // Order preview
  orderPreview: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#EAF5EB', borderRadius: 10, marginBottom: 12,
  },
  orderPreviewLabel: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  orderPreviewVal: { color: COLORS.green, fontSize: 16, fontWeight: '800' },

  // Order Now button
  orderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, minHeight: 54,
    borderRadius: 12, backgroundColor: COLORS.green, marginBottom: 6,
  },
  orderBtnDisabled: { backgroundColor: '#A5C8A7' },
  orderBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  qtyWarning: { color: '#C62828', fontSize: 12, textAlign: 'center', marginBottom: 10 },

  // Buyer Reviews
  reviewsTitleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 18, marginBottom: 10,
  },
  seeAllText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.line,
    borderRadius: 12, padding: 12, marginBottom: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.green,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  reviewerInfo: { flex: 1 },
  reviewerName: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  reviewText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
});

export default ProductDetailScreen;