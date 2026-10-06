import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_PRODUCE = {
  id: 'produce-1',
  name: 'Vine Tomatoes',
  category: 'Vegetables',
  price: 280,
  marketPrice: 330,
  unit: 'kg',
  harvested: 'Today, 6:30 AM',
  farmer: 'Nimali Perera',
  rating: 4.9,
  reviews: 128,
  location: 'Dambulla, Central Province',
  description: 'Sun-ripened tomatoes picked this morning from our family plot. Grown with natural compost and handled with care from field to market.',
  image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=1200',
  photos: [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500',
    'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=500',
  ],
  farmerPhoto: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=250',
};

const MOCK_REVIEWS = [
  { id: 'review-1', name: 'Dilani S.', date: '2 days ago', text: 'Beautifully fresh and full of flavour. Arrived carefully packed.' },
  { id: 'review-2', name: 'Ruwan P.', date: '1 week ago', text: 'Exactly as described. I will be ordering again.' },
];

const formatPrice = (amount) => `Rs. ${amount.toLocaleString()}`;

export default function ProduceDetailScreen({ route, navigation }) {
  const item = { ...MOCK_PRODUCE, ...(route?.params?.item || {}) };
  const [quantity, setQuantity] = useState(1);
  const savings = Math.max(0, item.marketPrice - item.price);
  const savingsPercent = item.marketPrice ? Math.round((savings / item.marketPrice) * 100) : 0;

  const openCheckout = () => {
    navigation.navigate('CartCheckout', {
      cartItems: [{ ...item, quantity, unitPrice: item.price }],
    });
  };

  const addToCart = () => {
    Alert.alert('Added to cart', `${quantity} ${item.unit} of ${item.name} is ready for checkout.`, [
      { text: 'Keep browsing', style: 'cancel' },
      { text: 'Go to cart', onPress: openCheckout },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Image source={{ uri: item.image }} style={styles.heroImage} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={23} color={COLORS.dark} />
          </TouchableOpacity>
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}><Ionicons name="leaf" size={14} color={COLORS.green} /><Text style={styles.trustText}>100% Organic</Text></View>
            <View style={styles.trustBadge}><Ionicons name="sunny" size={14} color={COLORS.green} /><Text style={styles.trustText}>Fresh Harvest</Text></View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.title}>{item.name}</Text>
            </View>
            <View style={styles.ratingPill}><Ionicons name="star" size={15} color="#E5A500" /><Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text></View>
          </View>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(item.price)}<Text style={styles.unit}> / {item.unit}</Text></Text>
            <Text style={styles.marketPrice}>Market {formatPrice(item.marketPrice)}</Text>
          </View>
          <View style={styles.savingsBanner}>
            <View style={styles.savingsIcon}><Ionicons name="trending-down" size={19} color={COLORS.green} /></View>
            <View style={styles.savingsCopy}>
              <Text style={styles.savingsTitle}>Save {formatPrice(savings)} ({savingsPercent}%)</Text>
              <Text style={styles.savingsSub}>Compared with the traditional market price</Text>
            </View>
            <Ionicons name="checkmark-circle" size={21} color={COLORS.green} />
          </View>

          <View style={styles.harvestLine}>
            <Ionicons name="time-outline" size={19} color={COLORS.green} />
            <View style={styles.harvestCopy}><Text style={styles.rowTitle}>Harvested {item.harvested}</Text><Text style={styles.rowSubtitle}>Picked fresh in {item.location}</Text></View>
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>From the farm</Text><Text style={styles.photoCount}>{item.photos.length} photos</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {item.photos.map((photo, index) => <Image key={`${photo}-${index}`} source={{ uri: photo }} style={styles.galleryImage} />)}
          </ScrollView>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Meet your farmer</Text></View>
          <View style={styles.farmerCard}>
            <Image source={{ uri: item.farmerPhoto || MOCK_PRODUCE.farmerPhoto }} style={styles.farmerPhoto} />
            <View style={styles.farmerDetails}>
              <Text style={styles.farmerName}>{item.farmer}</Text>
              <View style={styles.farmerLocation}><Ionicons name="location-outline" size={14} color={COLORS.muted} /><Text style={styles.rowSubtitle}>{item.location}</Text></View>
              <View style={styles.farmerRating}><Ionicons name="star" size={14} color="#E5A500" /><Text style={styles.farmerRatingText}>{item.rating} farmer rating</Text></View>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="View farmer" style={styles.profileButton} onPress={() => Alert.alert(item.farmer, 'Farmer profile details are shown here.') }>
              <Ionicons name="chevron-forward" size={19} color={COLORS.green} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent buyer reviews</Text><Text style={styles.reviewCount}>{item.reviews} reviews</Text></View>
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.review}>
              <View style={styles.reviewTop}><Text style={styles.reviewerName}>{review.name}</Text><Text style={styles.reviewDate}>{review.date}</Text></View>
              <View style={styles.reviewStars}>{[1, 2, 3, 4, 5].map((star) => <Ionicons key={star} name="star" size={13} color="#E5A500" />)}</View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}

          <View style={styles.quantityRow}>
            <View><Text style={styles.quantityTitle}>Quantity</Text><Text style={styles.quantityNote}>Sold per {item.unit}</Text></View>
            <View style={styles.stepper}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Decrease quantity" disabled={quantity <= 1} onPress={() => setQuantity((current) => Math.max(1, current - 1))} style={[styles.stepButton, quantity <= 1 && styles.stepButtonDisabled]}><Ionicons name="remove" size={20} color={quantity <= 1 ? '#AAB2AC' : COLORS.green} /></TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Increase quantity" onPress={() => setQuantity((current) => current + 1)} style={styles.stepButton}><Ionicons name="add" size={20} color={COLORS.green} /></TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity accessibilityRole="button" onPress={addToCart} style={styles.addButton}><Ionicons name="bag-add-outline" size={20} color={COLORS.green} /><Text style={styles.addButtonText}>Add to cart</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={openCheckout} style={styles.buyButton}><Text style={styles.buyButtonText}>Buy now</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 20 },
  hero: { height: 290, position: 'relative', backgroundColor: '#E5ECE6' },
  heroImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 14, left: 18, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  trustBadges: { position: 'absolute', bottom: 15, left: 16, flexDirection: 'row', gap: 8 },
  trustBadge: { minHeight: 34, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 17, backgroundColor: COLORS.white },
  trustText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  content: { paddingHorizontal: 20 },
  titleRow: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  titleGroup: { flex: 1 },
  category: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  title: { marginTop: 3, color: COLORS.dark, fontSize: 25, fontWeight: '800' },
  ratingPill: { minHeight: 38, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, backgroundColor: COLORS.white },
  ratingText: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },
  description: { marginTop: 12, color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  priceRow: { marginTop: 17, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  price: { color: COLORS.green, fontSize: 23, fontWeight: '800' },
  unit: { color: COLORS.muted, fontSize: 14, fontWeight: '500' },
  marketPrice: { color: COLORS.muted, fontSize: 13, textDecorationLine: 'line-through' },
  savingsBanner: { minHeight: 68, marginTop: 14, padding: 11, flexDirection: 'row', alignItems: 'center', borderRadius: 10, backgroundColor: '#EAF5EB' },
  savingsIcon: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.white },
  savingsCopy: { flex: 1, marginLeft: 10 },
  savingsTitle: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  savingsSub: { marginTop: 3, color: COLORS.muted, fontSize: 11 },
  harvestLine: { minHeight: 67, marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  harvestCopy: { gap: 4 },
  rowTitle: { color: COLORS.dark, fontSize: 14, fontWeight: '700' },
  rowSubtitle: { color: COLORS.muted, fontSize: 12 },
  sectionHeader: { marginTop: 21, marginBottom: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: COLORS.dark, fontSize: 17, fontWeight: '800' },
  photoCount: { color: COLORS.muted, fontSize: 12 },
  gallery: { gap: 10 },
  galleryImage: { width: 112, height: 86, borderRadius: 9, backgroundColor: '#E5ECE6' },
  farmerCard: { minHeight: 86, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 11, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  farmerPhoto: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#E5ECE6' },
  farmerDetails: { flex: 1, gap: 5 },
  farmerName: { color: COLORS.dark, fontSize: 15, fontWeight: '750' },
  farmerLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmerRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  farmerRatingText: { color: COLORS.dark, fontSize: 12, fontWeight: '650' },
  profileButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  reviewCount: { color: COLORS.muted, fontSize: 12 },
  review: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewerName: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 12 },
  reviewStars: { marginTop: 5, flexDirection: 'row', gap: 2 },
  reviewText: { marginTop: 6, color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  quantityRow: { minHeight: 75, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityTitle: { color: COLORS.dark, fontSize: 15, fontWeight: '750' },
  quantityNote: { marginTop: 3, color: COLORS.muted, fontSize: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  stepButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  stepButtonDisabled: { backgroundColor: '#F0F2F1' },
  quantityValue: { minWidth: 28, color: COLORS.dark, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  bottomBar: { minHeight: 76, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  addButton: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 9, borderWidth: 1, borderColor: COLORS.green },
  addButtonText: { color: COLORS.green, fontSize: 14, fontWeight: '750' },
  buyButton: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 9, backgroundColor: COLORS.green },
  buyButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '750' },
});