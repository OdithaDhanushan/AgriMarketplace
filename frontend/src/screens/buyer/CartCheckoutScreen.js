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

const DELIVERY_FEE = 250;

export default function CartCheckoutScreen({ navigation }) {
  const { items, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('24 Flower Road, Colombo 07');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const deliveryFee = items.length ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const confirmOrder = () => {
    if (items.length === 0) {
      Alert.alert('Your cart is empty', 'Add some fresh produce before confirming an order.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Delivery address needed', 'Enter a delivery address to continue.');
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

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text numberOfLines={1} style={styles.itemName}>{item.name || item.cropName}</Text>
        <Text style={styles.itemFarmer}>{item.farmer || item.category || 'Local farmer'}</Text>
        <Text style={styles.itemPrice}>Rs. {item.unitPrice.toLocaleString()} / {item.unit}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Decrease ${item.name || item.cropName}`} disabled={item.quantity <= 1} onPress={() => updateQuantity(item.id, -1)} style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}><Ionicons name="remove" size={18} color={item.quantity <= 1 ? '#AAB2AC' : COLORS.green} /></TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Increase ${item.name || item.cropName}`} onPress={() => updateQuantity(item.id, 1)} style={styles.quantityButton}><Ionicons name="add" size={18} color={COLORS.green} /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemTrailing}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.name || item.cropName}`} onPress={() => removeItem(item.id)} style={styles.removeButton}><Ionicons name="trash-outline" size={19} color="#B23B32" /></TouchableOpacity>
        <Text style={styles.lineTotal}>Rs. {(item.unitPrice * item.quantity).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={23} color={COLORS.dark} /></TouchableOpacity>
        <View style={styles.headingCopy}><Text style={styles.title}>Your cart</Text><Text style={styles.subtitle}>{items.length} {items.length === 1 ? 'farm-fresh item' : 'farm-fresh items'}</Text></View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyCart}><Ionicons name="basket-outline" size={40} color={COLORS.green} /><Text style={styles.emptyTitle}>Your basket is empty</Text><Text style={styles.emptySubtitle}>Find something fresh from a local farm.</Text><TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Explore')} style={styles.shopButton}><Text style={styles.shopButtonText}>Browse produce</Text></TouchableOpacity></View>}
        ListFooterComponent={(
          <View>
            <Text style={styles.sectionTitle}>Delivery address</Text>
            <View style={styles.addressBox}>
              <View style={styles.addressIcon}><Ionicons name="location-outline" size={20} color={COLORS.green} /></View>
              <TextInput accessibilityLabel="Delivery address" value={address} onChangeText={setAddress} multiline style={styles.addressInput} placeholder="Enter your delivery address" placeholderTextColor="#8A938C" />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit delivery address" onPress={() => Alert.alert('Delivery address', 'Edit the address directly in the field.')} style={styles.editAddressButton}><Ionicons name="create-outline" size={19} color={COLORS.green} /></TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Payment method</Text>

            {/* Cash on Delivery */}
            <TouchableOpacity
              accessibilityRole="radio"
              accessibilityState={{ checked: paymentMethod === 'cod' }}
              onPress={() => setPaymentMethod('cod')}
              style={[styles.paymentOption, paymentMethod === 'cod' ? styles.paymentOptionActive : styles.paymentOptionInactive]}
            >
              <View style={styles.cashIcon}><Ionicons name="cash-outline" size={22} color={COLORS.green} /></View>
              <View style={styles.paymentCopy}>
                <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
                <Text style={styles.paymentSubtitle}>Pay in cash when your order arrives</Text>
              </View>
              <View style={[styles.radioOuter, paymentMethod === 'cod' && styles.radioActive]}>
                {paymentMethod === 'cod' && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
              </View>
            </TouchableOpacity>

            {/* Card Payment */}
            <TouchableOpacity
              accessibilityRole="radio"
              accessibilityState={{ checked: paymentMethod === 'card' }}
              onPress={() => setPaymentMethod('card')}
              style={[styles.paymentOption, { marginTop: 10 }, paymentMethod === 'card' ? styles.paymentOptionActive : styles.paymentOptionInactive]}
            >
              <View style={[styles.cashIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="card-outline" size={22} color="#1976D2" />
              </View>
              <View style={styles.paymentCopy}>
                <Text style={styles.paymentTitle}>Card Payment</Text>
                <Text style={styles.paymentSubtitle}>Visa, Mastercard, AMEX</Text>
              </View>
              <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioActive]}>
                {paymentMethod === 'card' && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
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
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>Rs. {subtotal.toLocaleString()}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery fee</Text><Text style={styles.summaryValue}>{items.length ? `Rs. ${deliveryFee.toLocaleString()}` : 'Rs. 0'}</Text></View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total amount</Text><Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text></View>
              <Text style={styles.codNote}>
                <Ionicons name={paymentMethod === 'cod' ? 'shield-checkmark-outline' : 'card-outline'} size={14} color={COLORS.green} />
                {paymentMethod === 'cod' ? '  No payment needed until delivery' : '  Safe & encrypted card checkout'}
              </Text>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomTotal}><Text style={styles.bottomTotalLabel}>Total</Text><Text style={styles.bottomTotalValue}>Rs. {total.toLocaleString()}</Text></View>
          <TouchableOpacity accessibilityRole="button" onPress={confirmOrder} style={styles.confirmButton}><Text style={styles.confirmButtonText}>Confirm order</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></TouchableOpacity>
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
  screen: { flex: 1, backgroundColor: '#EDECEB' },
  header: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 44 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  subtitle: { marginTop: 2, color: COLORS.muted, fontSize: 11.5 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  cartItem: {
    minHeight: 120,
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
  productImage: { width: 80, height: 96, alignSelf: 'center', borderRadius: 12, backgroundColor: '#E5ECE6' },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { color: COLORS.dark, fontSize: 14.5, fontWeight: '750' },
  itemFarmer: { marginTop: 2, color: COLORS.muted, fontSize: 11 },
  itemPrice: { marginTop: 4, color: COLORS.green, fontSize: 12.5, fontWeight: '700' },
  quantityControls: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  disabledButton: { opacity: 0.4 },
  quantityText: { minWidth: 20, color: COLORS.dark, textAlign: 'center', fontSize: 14, fontWeight: '750' },
  itemTrailing: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  lineTotal: { marginBottom: 6, color: COLORS.dark, fontSize: 12.5, fontWeight: '750' },
  sectionTitle: { marginTop: 16, marginBottom: 8, color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  addressBox: {
    minHeight: 70,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(16px)',
  },
  addressIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addressInput: { flex: 1, minHeight: 48, paddingVertical: 8, color: COLORS.dark, fontSize: 13 },
  editAddressButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  paymentOption: {
    minHeight: 68,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(16px)',
    marginBottom: 8,
  },
  paymentOptionActive: { borderColor: COLORS.green, backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  paymentOptionInactive: { borderColor: COLORS.line },
  cardDetailsBox: {
    marginTop: 4,
    marginBottom: 8,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BBDEFB',
    backgroundColor: 'rgba(240, 247, 255, 0.85)',
    gap: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardSecureText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  cardMockInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFD8DC',
    backgroundColor: COLORS.white,
  },
  cardMockNumber: { color: COLORS.dark, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  cardBrandBadge: { color: '#1976D2', fontSize: 12, fontWeight: '800' },
  cashIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  paymentCopy: { flex: 1 },
  paymentTitle: { color: COLORS.dark, fontSize: 14, fontWeight: '750' },
  paymentSubtitle: { marginTop: 2, color: COLORS.muted, fontSize: 11 },
  radioOuter: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#AAB2AC',
  },
  radioActive: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  summaryBox: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    backdropFilter: 'blur(16px)',
  },
  summaryRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.dark, fontSize: 13, fontWeight: '650' },
  summaryDivider: { marginVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  totalLabel: { color: COLORS.dark, fontSize: 14.5, fontWeight: '750' },
  totalValue: { color: COLORS.green, fontSize: 17, fontWeight: '800' },
  codNote: { marginTop: 7, color: COLORS.green, fontSize: 11, fontWeight: '600' },
  bottomBar: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.line,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(24px)',
  },
  bottomTotal: { minWidth: 98 },
  bottomTotalLabel: { color: COLORS.muted, fontSize: 11 },
  bottomTotalValue: { marginTop: 2, color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  confirmButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 25,
    backgroundColor: COLORS.green,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '750', letterSpacing: 0.2 },
  emptyCart: { alignItems: 'center', paddingVertical: 38, paddingHorizontal: 18 },
  emptyTitle: { marginTop: 11, color: COLORS.dark, fontSize: 17, fontWeight: '800' },
  emptySubtitle: { marginTop: 5, color: COLORS.muted, textAlign: 'center', fontSize: 13 },
  shopButton: {
    minHeight: 46,
    marginTop: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: COLORS.green,
  },
  shopButtonText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '750' },
});