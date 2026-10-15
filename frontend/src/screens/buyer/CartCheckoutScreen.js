import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const DELIVERY_FEE = 250;

export default function CartCheckoutScreen({ navigation }) {
  const { items, updateQuantity, removeItem, addToCart } = useCart();
  const { user } = useAuth();
  const { strings } = useLanguage();
  const [address, setAddress] = useState('24 Flower Road, Colombo 07');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const deliveryFee = items.length ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const confirmOrder = () => {
    if (items.length === 0) {
      Alert.alert(strings.myCart || 'Your cart is empty', 'Please add some fresh produce before continuing.');
      return;
    }
    if (!address.trim()) {
      Alert.alert(strings.deliveryAddress || 'Delivery address needed', 'Please enter a delivery address to continue.');
      return;
    }

    const orderData = {
      id: `SK${Math.floor(1000 + Math.random() * 9000)}`,
      items: items.map((item) => ({
        id: item.id,
        name: item.name || item.cropName || 'Fresh Produce',
        quantity: item.quantity,
        unit: item.unit || 'kg',
        unitPrice: item.unitPrice,
        image: item.image,
        farmer: item.farmer,
      })),
      itemName: items.length === 1 ? (items[0].name || items[0].cropName) : `${items[0].name || items[0].cropName} + ${items.length - 1} more`,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      unit: items[0]?.unit || 'kg',
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: address,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment',
      userEmail: user?.email || 'sahan@gmail.com',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Confirmed',
    };

    navigation.navigate('OtpVerification', { order: orderData });
  };

  const handleBrowseProduce = () => {
    try {
      navigation.navigate('ExploreTab');
    } catch (e) {
      navigation.navigate('BuyerTabs', { screen: 'ExploreTab' });
    }
  };

  const handleAddSample = () => {
    if (addToCart) {
      addToCart({
        id: 'tomato-01',
        name: 'Fresh Tomatoes',
        price: 245,
        unit: 'kg',
        farmer: "Sunil's Organic Farm",
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
      }, 5);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text numberOfLines={1} style={styles.itemName}>{item.name || item.cropName}</Text>
        <Text style={styles.itemFarmer}>{item.farmer || item.category || 'Local farmer'}</Text>
        <Text style={styles.itemPrice}>Rs. {item.unitPrice.toLocaleString()} / {item.unit}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${item.name || item.cropName}`}
            disabled={item.quantity <= 1}
            onPress={() => updateQuantity(item.id, -1)}
            style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
          >
            <Ionicons name="remove" size={18} color={item.quantity <= 1 ? '#AAB2AC' : COLORS.green} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Increase ${item.name || item.cropName}`}
            onPress={() => updateQuantity(item.id, 1)}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={18} color={COLORS.green} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemTrailing}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.name || item.cropName}`}
          onPress={() => removeItem(item.id)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={19} color="#B23B32" />
        </TouchableOpacity>
        <Text style={styles.lineTotal}>Rs. {(item.unitPrice * item.quantity).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={23} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{strings.myCart || 'Your Cart'}</Text>
          <Text style={styles.subtitle}>
            {items.length} {items.length === 1 ? 'farm-fresh item' : 'farm-fresh items'}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="basket-outline" size={44} color={COLORS.green} />
            </View>
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptySubtitle}>Find fresh farm harvest directly from local growers.</Text>
            
            <View style={styles.emptyActionsRow}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleBrowseProduce}
                style={styles.shopButton}
                activeOpacity={0.85}
              >
                <Ionicons name="search" size={16} color="#FFFFFF" />
                <Text style={styles.shopButtonText}>Browse Produce</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                onPress={handleAddSample}
                style={styles.sampleButton}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={16} color={COLORS.green} />
                <Text style={styles.sampleButtonText}>+ Add Sample Tomatoes</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.footerSection}>
              <Text style={styles.sectionTitle}>{strings.deliveryAddress || 'Delivery address'}</Text>
              <View style={styles.addressBox}>
                <View style={styles.addressIcon}>
                  <Ionicons name="location-outline" size={20} color={COLORS.green} />
                </View>
                <TextInput
                  accessibilityLabel="Delivery address"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  style={styles.addressInput}
                  placeholder="Enter your delivery address"
                  placeholderTextColor="#8A938C"
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Edit delivery address"
                  onPress={() => Alert.alert('Delivery address', 'Edit the address directly in the field.')}
                  style={styles.editAddressButton}
                >
                  <Ionicons name="create-outline" size={19} color={COLORS.green} />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>{strings.paymentMethod || 'Payment method'}</Text>

              {/* Cash on Delivery */}
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ checked: paymentMethod === 'cod' }}
                onPress={() => setPaymentMethod('cod')}
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cod' ? styles.paymentOptionActive : styles.paymentOptionInactive,
                ]}
                activeOpacity={0.85}
              >
                <View style={styles.cashIcon}>
                  <Ionicons name="cash-outline" size={22} color={COLORS.green} />
                </View>
                <View style={styles.paymentCopy}>
                  <Text style={styles.paymentTitle}>{strings.cashOnDelivery || 'Cash on Delivery (COD)'}</Text>
                  <Text style={styles.paymentSubtitle}>Pay in cash when your fresh order arrives</Text>
                </View>
                <View style={[styles.radioOuter, paymentMethod === 'cod' && styles.radioActive]}>
                  {paymentMethod === 'cod' && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>

              {/* Card Payment */}
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ checked: paymentMethod === 'card' }}
                onPress={() => setPaymentMethod('card')}
                style={[
                  styles.paymentOption,
                  { marginTop: 10 },
                  paymentMethod === 'card' ? styles.paymentOptionActive : styles.paymentOptionInactive,
                ]}
                activeOpacity={0.85}
              >
                <View style={[styles.cashIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="card-outline" size={22} color="#1976D2" />
                </View>
                <View style={styles.paymentCopy}>
                  <Text style={styles.paymentTitle}>{strings.cardPayment || 'Online Card Payment'}</Text>
                  <Text style={styles.paymentSubtitle}>Visa, Mastercard, AMEX</Text>
                </View>
                <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioActive]}>
                  {paymentMethod === 'card' && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>

              {paymentMethod === 'card' && (
                <View style={styles.cardDetailsBox}>
                  <View style={styles.cardRow}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.green} />
                    <Text style={styles.cardSecureText}>Secure 256-bit Encrypted Card Payment</Text>
                  </View>
                  <View style={styles.cardMockInput}>
                    <Ionicons name="card" size={18} color="#1976D2" />
                    <Text style={styles.cardMockNumber}>•••• •••• •••• 4242</Text>
                    <Text style={styles.cardBrandBadge}>VISA</Text>
                  </View>
                </View>
              )}

              <Text style={styles.sectionTitle}>Price summary</Text>
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{strings.subtotal || 'Subtotal'}</Text>
                  <Text style={styles.summaryValue}>Rs. {subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{strings.deliveryFee || 'Delivery fee'}</Text>
                  <Text style={styles.summaryValue}>
                    {items.length ? `Rs. ${deliveryFee.toLocaleString()}` : 'Rs. 0'}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>{strings.total || 'Total amount'}</Text>
                  <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
                </View>
                <Text style={styles.codNote}>
                  <Ionicons
                    name={paymentMethod === 'cod' ? 'shield-checkmark-outline' : 'card-outline'}
                    size={14}
                    color={COLORS.green}
                  />
                  {paymentMethod === 'cod' ? '  No payment needed until delivery' : '  Safe & encrypted card checkout'}
                </Text>
              </View>

              {/* Inline Primary Continue Button (always visible in scroll flow) */}
              <View style={styles.inlineButtonWrapper}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={strings.proceedToCheckout || 'Continue to Checkout'}
                  onPress={confirmOrder}
                  style={styles.continueInlineButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueInlineButtonText}>
                    {strings.proceedToCheckout || 'Continue to Checkout'}
                  </Text>
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
      />

      {/* Floating Bottom Action Bar (elevated above bottom tab bar) */}
      {items.length > 0 && (
        <View style={styles.floatingBottomBar}>
          <View style={styles.bottomTotal}>
            <Text style={styles.bottomTotalLabel}>{strings.total || 'Total'}</Text>
            <Text style={styles.bottomTotalValue}>Rs. {total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={strings.proceedToCheckout || 'Continue to Checkout'}
            onPress={confirmOrder}
            style={styles.confirmButton}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>
              {strings.proceedToCheckout || 'Continue to Checkout'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
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
  screen: {
    flex: 1,
    backgroundColor: '#EDECEB',
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 44 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  subtitle: { marginTop: 2, color: COLORS.muted, fontSize: 12 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160, // Clearance for both floating bar and tab bar
  },
  cartItem: {
    minHeight: 110,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(16px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
  },
  productImage: { width: 78, height: 86, alignSelf: 'center', borderRadius: 14, backgroundColor: '#E5ECE6' },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { color: COLORS.dark, fontSize: 14.5, fontWeight: '750' },
  itemFarmer: { marginTop: 2, color: COLORS.muted, fontSize: 11 },
  itemPrice: { marginTop: 4, color: COLORS.green, fontSize: 13, fontWeight: '700' },
  quantityControls: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.4 },
  quantityText: { fontSize: 14, fontWeight: '750', color: COLORS.dark, minWidth: 20, textAlign: 'center' },
  itemTrailing: { alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 2 },
  removeButton: { padding: 4 },
  lineTotal: { fontSize: 13, fontWeight: '750', color: COLORS.dark },
  footerSection: { marginTop: 8 },
  sectionTitle: {
    color: COLORS.dark,
    fontSize: 14.5,
    fontWeight: '750',
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(16px)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '600',
    paddingVertical: 2,
  },
  editAddressButton: { padding: 6 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(16px)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentOptionActive: {
    borderColor: COLORS.green,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  paymentOptionInactive: { opacity: 0.8 },
  cashIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCopy: { flex: 1 },
  paymentTitle: { fontSize: 13.5, fontWeight: '750', color: COLORS.dark },
  paymentSubtitle: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#9EAA9F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  cardDetailsBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.25)',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardSecureText: { fontSize: 11, color: COLORS.green, fontWeight: '700' },
  cardMockInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  cardMockNumber: { flex: 1, fontSize: 12.5, fontWeight: '600', color: COLORS.dark, letterSpacing: 1 },
  cardBrandBadge: { fontSize: 11, fontWeight: '800', color: '#1976D2' },
  summaryBox: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  summaryLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  summaryValue: { color: COLORS.dark, fontSize: 13.5, fontWeight: '700' },
  summaryDivider: { marginVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  totalLabel: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },
  totalValue: { color: COLORS.green, fontSize: 17, fontWeight: '800' },
  codNote: { marginTop: 8, color: COLORS.green, fontSize: 11, fontWeight: '600' },
  inlineButtonWrapper: {
    marginTop: 16,
    marginBottom: 8,
  },
  continueInlineButton: {
    backgroundColor: COLORS.green,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 5,
  },
  continueInlineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '750',
    letterSpacing: 0.2,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 76 : 72,
    left: 16,
    right: 16,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(24px)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 9999,
  },
  bottomTotal: { minWidth: 92 },
  bottomTotalLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  bottomTotalValue: { marginTop: 1, color: COLORS.dark, fontSize: 15.5, fontWeight: '800' },
  confirmButton: {
    flex: 1,
    height: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 23,
    backgroundColor: COLORS.green,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '750', letterSpacing: 0.2 },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(20px)',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { color: COLORS.dark, fontSize: 18, fontWeight: '800' },
  emptySubtitle: { marginTop: 6, color: COLORS.muted, textAlign: 'center', fontSize: 13, lineHeight: 18 },
  emptyActionsRow: {
    marginTop: 18,
    width: '100%',
    gap: 10,
  },
  shopButton: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    backgroundColor: COLORS.green,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  shopButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '750' },
  sampleButton: {
    height: 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  sampleButtonText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
});