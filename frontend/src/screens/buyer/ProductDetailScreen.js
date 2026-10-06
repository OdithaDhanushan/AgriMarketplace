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
  name: 'Fresh Carrots',
  category: 'Vegetables',
  price: 280,
  unit: 'kg',
  rating: 4.8,
  reviews: 64,
  harvest: 'Harvested Yesterday Morning',
  location: 'Nuwara Eliya',
  distance: 180,
  farmer: 'Sunil Perera',
  farmerLocation: 'Nuwara Eliya, Sri Lanka',
  phone: '+94 77 234 5678',
  image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=1200',
  farmerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  availableStock: 500,
  minimumOrder: 10,
  packQuantity: 20,
};

const REVIEWS = [
  { id: 'review-a', name: 'Malini K.', date: '2 days ago', text: 'Crisp, sweet carrots and delivered right on time.' },
  { id: 'review-b', name: 'Kasun D.', date: '1 week ago', text: 'Great quality from a reliable farmer. Very fresh.' },
];

function ProductDetailScreen({ route, navigation }) {
  const product = { ...PRODUCT, ...(route?.params?.product || {}) };

  const continueToCheckout = () => navigation.navigate('Checkout', { product, quantity: PRODUCT.packQuantity });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: product.image }} style={styles.heroImage} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={23} color={COLORS.dark} /></TouchableOpacity>
          <View style={styles.heroTags}>
            <View style={styles.heroTag}><Ionicons name="time-outline" size={14} color={COLORS.green} /><Text style={styles.heroTagText}>{product.harvest || PRODUCT.harvest}</Text></View>
            <View style={styles.heroTag}><Ionicons name="location-outline" size={14} color={COLORS.green} /><Text style={styles.heroTagText}>{product.location || PRODUCT.location} {product.distance || PRODUCT.distance}km away</Text></View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}><Text style={styles.category}>{product.category || PRODUCT.category}</Text><Text style={styles.title}>{product.name || PRODUCT.name}</Text></View>
            <View style={styles.rating}><Ionicons name="star" size={16} color="#E5A500" /><Text style={styles.ratingText}>{product.rating || PRODUCT.rating}</Text></View>
          </View>
          <Text style={styles.price}>Rs. {Number(product.price || PRODUCT.price).toLocaleString()} <Text style={styles.unit}>/ {product.unit || PRODUCT.unit}</Text></Text>

          <View style={styles.farmerCard}>
            <Image source={{ uri: product.farmerImage || PRODUCT.farmerImage }} style={styles.farmerPhoto} />
            <View style={styles.farmerInfo}>
              <View style={styles.farmerNameRow}><Text style={styles.farmerName}>{product.farmer || PRODUCT.farmer}</Text><View style={styles.verified}><Ionicons name="checkmark-circle" size={15} color={COLORS.green} /><Text style={styles.verifiedText}>Verified</Text></View></View>
              <Text style={styles.farmerLocation}>{product.farmerLocation || PRODUCT.farmerLocation}</Text>
              <View style={styles.farmerRating}><Ionicons name="star" size={13} color="#E5A500" /><Text style={styles.farmerRatingText}>{product.rating || PRODUCT.rating} farmer rating</Text></View>
            </View>
          </View>
          <View style={styles.farmerActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => Linking.openURL(`tel:${product.phone || PRODUCT.phone}`).catch(() => Alert.alert('Call unavailable', 'This device cannot start a phone call.'))} style={styles.contactButton}><Ionicons name="call-outline" size={18} color={COLORS.green} /><Text style={styles.contactText}>Call Farmer</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => Alert.alert('Chat with farmer', `A chat with ${product.farmer || PRODUCT.farmer} will be available soon.`)} style={styles.contactButton}><Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.green} /><Text style={styles.contactText}>Chat</Text></TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Product specifications</Text>
          <View style={styles.specTable}>
            {[
              ['Available Stock', `${product.availableStock || PRODUCT.availableStock} kg`],
              ['Minimum Order Qty', `${product.minimumOrder || PRODUCT.minimumOrder} kg`],
              ['Unit Price', `Rs. ${Number(product.price || PRODUCT.price).toLocaleString()}/${product.unit || PRODUCT.unit}`],
              ['Pack / Order Qty', `${product.packQuantity || PRODUCT.packQuantity} kg`],
            ].map(([label, value], index) => <View key={label} style={[styles.specRow, index === 3 && styles.specRowLast]}><Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{value}</Text></View>)}
          </View>

          <View style={styles.reviewsTitleRow}><Text style={styles.sectionTitle}>Buyer reviews</Text><View style={styles.reviewsCount}><Ionicons name="star" size={14} color="#E5A500" /><Text style={styles.reviewsCountText}>{product.rating || PRODUCT.rating} · {product.reviews || PRODUCT.reviews} reviews</Text></View></View>
          {REVIEWS.map((review) => <View key={review.id} style={styles.review}><View style={styles.reviewHeader}><Text style={styles.reviewer}>{review.name}</Text><Text style={styles.reviewDate}>{review.date}</Text></View><View style={styles.reviewStars}>{[1, 2, 3, 4, 5].map((star) => <Ionicons key={star} name="star" size={13} color="#E5A500" />)}</View><Text style={styles.reviewText}>{review.text}</Text></View>)}
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <View><Text style={styles.bottomLabel}>Pack size</Text><Text style={styles.bottomQty}>{product.packQuantity || PRODUCT.packQuantity} kg</Text></View>
        <TouchableOpacity accessibilityRole="button" onPress={continueToCheckout} style={styles.buyButton}><Text style={styles.buyButtonText}>Buy Now / Checkout</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 18 },
  hero: { height: 278, backgroundColor: '#E5ECE6' },
  heroImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 13, left: 16, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: COLORS.white },
  heroTags: { position: 'absolute', left: 13, right: 13, bottom: 13, gap: 7 },
  heroTag: { minHeight: 35, alignSelf: 'flex-start', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, backgroundColor: COLORS.white },
  heroTagText: { color: COLORS.dark, fontSize: 11, fontWeight: '600' },
  content: { paddingHorizontal: 18 },
  titleRow: { marginTop: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  titleCopy: { flex: 1 },
  category: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  title: { marginTop: 3, color: COLORS.dark, fontSize: 24, fontWeight: '800' },
  rating: { minHeight: 38, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, backgroundColor: COLORS.white },
  ratingText: { color: COLORS.dark, fontSize: 14, fontWeight: '700' },
  price: { marginTop: 8, color: COLORS.green, fontSize: 22, fontWeight: '800' },
  unit: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  farmerCard: { minHeight: 88, marginTop: 16, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, backgroundColor: COLORS.white },
  farmerPhoto: { width: 59, height: 59, borderRadius: 30, backgroundColor: '#E5ECE6' },
  farmerInfo: { flex: 1, gap: 4 },
  farmerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  farmerName: { color: COLORS.dark, fontSize: 14, fontWeight: '700' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  farmerLocation: { color: COLORS.muted, fontSize: 11 },
  farmerRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmerRatingText: { color: COLORS.dark, fontSize: 11, fontWeight: '600' },
  farmerActions: { marginTop: 8, flexDirection: 'row', gap: 8 },
  contactButton: { flex: 1, minHeight: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#B9D9BC', borderRadius: 8, backgroundColor: COLORS.white },
  contactText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  sectionTitle: { marginTop: 19, marginBottom: 9, color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  specTable: { overflow: 'hidden', paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, backgroundColor: COLORS.white },
  specRow: { minHeight: 46, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.line },
  specRowLast: { borderBottomWidth: 0 },
  specLabel: { color: COLORS.muted, fontSize: 12 },
  specValue: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },
  reviewsTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewsCount: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewsCountText: { color: COLORS.muted, fontSize: 11 },
  review: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewer: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewStars: { marginTop: 5, flexDirection: 'row', gap: 2 },
  reviewText: { marginTop: 5, color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  bottomBar: { minHeight: 76, paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  bottomLabel: { color: COLORS.muted, fontSize: 11 },
  bottomQty: { marginTop: 2, color: COLORS.dark, fontSize: 14, fontWeight: '800' },
  buyButton: { flex: 1, minHeight: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 9, backgroundColor: COLORS.green },
  buyButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});

export default ProductDetailScreen;