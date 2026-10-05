import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_CART_ITEMS = [
  { id: 'cart-tomatoes', name: 'Vine Tomatoes', category: 'Vegetables', unit: 'kg', unitPrice: 280, quantity: 2, farmer: 'Nimali Perera', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500' },
  { id: 'cart-papaya', name: 'Sweet Papaya', category: 'Fruits', unit: 'kg', unitPrice: 190, quantity: 1, farmer: 'Saman Jayawardena', image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500' },
];

const DELIVERY_FEE = 250;

export default function CartCheckoutScreen({ route, navigation }) {
  const initialItems = route?.params?.cartItems?.length ? route.params.cartItems : MOCK_CART_ITEMS;
  const [items, setItems] = useState(initialItems.map((item, index) => ({
    ...item,
    id: item.id || item._id || `route-item-${index}`,
    unitPrice: Number(item.unitPrice ?? item.price ?? item.sellingPricePerKg ?? 0),
    quantity: Math.max(1, Number(item.quantity || 1)),
    image: item.image || item.photoUrl || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500',
    unit: item.unit || 'kg',
  })));
  const [address, setAddress] = useState('24 Flower Road, Colombo 07');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const deliveryFee = items.length ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const updateQuantity = (id, amount) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  };

  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));

  const confirmOrder = () => {
    if (items.length === 0) {
      Alert.alert('Your cart is empty', 'Add some fresh produce before confirming an order.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Delivery address needed', 'Enter a delivery address to continue.');
      return;
    }
    Alert.alert('Order placed', `Your order for Rs. ${total.toLocaleString()} is confirmed. Payment is due on delivery.`, [
      { text: 'Continue shopping', onPress: () => navigation.navigate('BuyerHome') },
    ]);
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
        ListEmptyComponent={<View style={styles.emptyCart}><Ionicons name="basket-outline" size={40} color={COLORS.green} /><Text style={styles.emptyTitle}>Your basket is empty</Text><Text style={styles.emptySubtitle}>Find something fresh from a local farm.</Text><TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('BuyerHome')} style={styles.shopButton}><Text style={styles.shopButtonText}>Browse produce</Text></TouchableOpacity></View>}
        ListFooterComponent={(
          <View>
            <Text style={styles.sectionTitle}>Delivery address</Text>
            <View style={styles.addressBox}>
              <View style={styles.addressIcon}><Ionicons name="location-outline" size={20} color={COLORS.green} /></View>
              <TextInput accessibilityLabel="Delivery address" value={address} onChangeText={setAddress} multiline style={styles.addressInput} placeholder="Enter your delivery address" placeholderTextColor="#8A938C" />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit delivery address" onPress={() => Alert.alert('Delivery address', 'Edit the address directly in the field.')} style={styles.editAddressButton}><Ionicons name="create-outline" size={19} color={COLORS.green} /></TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Payment method</Text>
            <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: paymentMethod === 'cod' }} onPress={() => setPaymentMethod('cod')} style={styles.paymentOption}>
              <View style={styles.cashIcon}><Ionicons name="cash-outline" size={22} color={COLORS.green} /></View>
              <View style={styles.paymentCopy}><Text style={styles.paymentTitle}>Cash on Delivery</Text><Text style={styles.paymentSubtitle}>Pay when your order arrives</Text></View>
              <View style={[styles.radioOuter, paymentMethod === 'cod' && styles.radioActive]}>{paymentMethod === 'cod' && <Ionicons name="checkmark" size={14} color={COLORS.white} />}</View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Price summary</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>Rs. {subtotal.toLocaleString()}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery fee</Text><Text style={styles.summaryValue}>{items.length ? `Rs. ${deliveryFee.toLocaleString()}` : 'Rs. 0'}</Text></View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total amount</Text><Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text></View>
              <Text style={styles.codNote}><Ionicons name="shield-checkmark-outline" size={14} color={COLORS.green} />  No payment needed until delivery</Text>
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

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { minHeight: 76, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1 },
  title: { color: COLORS.dark, fontSize: 23, fontWeight: '800' },
  subtitle: { marginTop: 3, color: COLORS.muted, fontSize: 12 },
  listContent: { paddingHorizontal: 18, paddingBottom: 18 },
  cartItem: { minHeight: 132, marginBottom: 11, padding: 11, flexDirection: 'row', gap: 10, borderRadius: 11, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  productImage: { width: 82, height: 106, alignSelf: 'center', borderRadius: 8, backgroundColor: '#E5ECE6' },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemName: { color: COLORS.dark, fontSize: 14, fontWeight: '750' },
  itemFarmer: { marginTop: 3, color: COLORS.muted, fontSize: 11 },
  itemPrice: { marginTop: 5, color: COLORS.green, fontSize: 12, fontWeight: '700' },
  quantityControls: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  disabledButton: { backgroundColor: '#F0F2F1' },
  quantityText: { minWidth: 20, color: COLORS.dark, textAlign: 'center', fontSize: 14, fontWeight: '750' },
  itemTrailing: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  lineTotal: { marginBottom: 6, color: COLORS.dark, fontSize: 12, fontWeight: '750' },
  sectionTitle: { marginTop: 16, marginBottom: 9, color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  addressBox: { minHeight: 75, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  addressIcon: { width: 40, height: 46, alignItems: 'center', justifyContent: 'center' },
  addressInput: { flex: 1, minHeight: 56, paddingVertical: 9, color: COLORS.dark, fontSize: 13 },
  editAddressButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  paymentOption: { minHeight: 72, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.green, backgroundColor: COLORS.white },
  cashIcon: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#EAF5EB' },
  paymentCopy: { flex: 1 },
  paymentTitle: { color: COLORS.dark, fontSize: 14, fontWeight: '750' },
  paymentSubtitle: { marginTop: 3, color: COLORS.muted, fontSize: 11 },
  radioOuter: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#AAB2AC' },
  radioActive: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  summaryBox: { padding: 13, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  summaryRow: { minHeight: 31, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.dark, fontSize: 13, fontWeight: '650' },
  summaryDivider: { marginVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.line },
  totalLabel: { color: COLORS.dark, fontSize: 14, fontWeight: '750' },
  totalValue: { color: COLORS.green, fontSize: 17, fontWeight: '800' },
  codNote: { marginTop: 7, color: COLORS.green, fontSize: 11 },
  bottomBar: { minHeight: 76, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  bottomTotal: { minWidth: 98 },
  bottomTotalLabel: { color: COLORS.muted, fontSize: 11 },
  bottomTotalValue: { marginTop: 3, color: COLORS.dark, fontSize: 15, fontWeight: '800' },
  confirmButton: { flex: 1, minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 9, backgroundColor: COLORS.green },
  confirmButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '750' },
  emptyCart: { alignItems: 'center', paddingVertical: 38, paddingHorizontal: 18 },
  emptyTitle: { marginTop: 11, color: COLORS.dark, fontSize: 17, fontWeight: '800' },
  emptySubtitle: { marginTop: 5, color: COLORS.muted, textAlign: 'center', fontSize: 13 },
  shopButton: { minHeight: 48, marginTop: 16, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: COLORS.green },
  shopButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '750' },
});