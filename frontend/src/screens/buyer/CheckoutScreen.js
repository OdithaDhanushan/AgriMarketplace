import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_PRODUCT = { id: 'carrot-01', name: 'Fresh Carrots', price: 280, unit: 'kg', farmer: 'Sunil Perera' };
const DEFAULT_QUANTITY = 20;
const DELIVERY_FEE = 600;

function CheckoutScreen({ route, navigation }) {
  const product = route?.params?.product || DEFAULT_PRODUCT;
  const quantity = Number(route?.params?.quantity || DEFAULT_QUANTITY);
  const unitPrice = Number(product.price || DEFAULT_PRODUCT.price);
  const itemsTotal = unitPrice * quantity;
  const [address, setAddress] = useState('24 Flower Road, Colombo 07');
  const [editingAddress, setEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const proceedToVerification = () => navigation.navigate('OtpVerification', {
    order: {
      id: 'SK1024',
      itemName: product.name || DEFAULT_PRODUCT.name,
      quantity,
      unit: product.unit || DEFAULT_PRODUCT.unit,
      total: itemsTotal + DELIVERY_FEE,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on delivery' : 'Online card payment',
      address,
    },
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={23} color={COLORS.dark} /></TouchableOpacity>
        <View><Text style={styles.title}>Checkout</Text><Text style={styles.subtitle}>Review your order details</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>Delivery address</Text><TouchableOpacity accessibilityRole="button" onPress={() => setEditingAddress((current) => !current)} style={styles.editButton}><Text style={styles.editText}>{editingAddress ? 'Done' : 'Edit'}</Text></TouchableOpacity></View>
        <View style={styles.addressCard}>
          <View style={styles.addressIcon}><Ionicons name="location" size={20} color={COLORS.green} /></View>
          <View style={styles.addressCopy}>
            {editingAddress ? <TextInput accessibilityLabel="Delivery address" value={address} onChangeText={setAddress} multiline autoFocus style={styles.addressInput} placeholder="Enter delivery address" /> : <Text style={styles.addressText}>{address}</Text>}
            <Text style={styles.addressName}>Nirwan · Home</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
        </View>

        <View style={styles.expressBanner}>
          <View style={styles.expressIcon}><Ionicons name="flash" size={19} color={COLORS.green} /></View>
          <View style={styles.expressCopy}><Text style={styles.expressTitle}>Express delivery</Text><Text style={styles.expressText}>Tomorrow by 8:00 AM</Text></View>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
        </View>

        <Text style={styles.sectionTitle}>Payment method</Text>
        <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: paymentMethod === 'cod' }} onPress={() => setPaymentMethod('cod')} style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentSelected]}>
          <View style={styles.paymentIcon}><Ionicons name="cash-outline" size={22} color={COLORS.green} /></View>
          <View style={styles.paymentCopy}><Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text><Text style={styles.paymentHint}>Pay the delivery partner on arrival</Text></View>
          <View style={[styles.radio, paymentMethod === 'cod' && styles.radioSelected]}>{paymentMethod === 'cod' && <Ionicons name="checkmark" size={13} color={COLORS.white} />}</View>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: paymentMethod === 'card' }} onPress={() => setPaymentMethod('card')} style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentSelected]}>
          <View style={styles.paymentIcon}><Ionicons name="card-outline" size={22} color={COLORS.green} /></View>
          <View style={styles.paymentCopy}><Text style={styles.paymentTitle}>Online Card Payment</Text><Text style={styles.paymentHint}>Visa, Mastercard and more</Text></View>
          <View style={[styles.radio, paymentMethod === 'card' && styles.radioSelected]}>{paymentMethod === 'card' && <Ionicons name="checkmark" size={13} color={COLORS.white} />}</View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><View><Text style={styles.summaryLabel}>Items Total</Text><Text style={styles.summaryHint}>{product.name || DEFAULT_PRODUCT.name} · {quantity} {product.unit || DEFAULT_PRODUCT.unit}</Text></View><Text style={styles.summaryValue}>Rs. {itemsTotal.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><View><Text style={styles.summaryLabel}>Delivery Fee</Text><Text style={styles.summaryHint}>Express delivery</Text></View><Text style={styles.summaryValue}>Rs. {DELIVERY_FEE.toLocaleString()}</Text></View>
          <View style={styles.divider} />
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Payable</Text><Text style={styles.totalValue}>Rs. {(itemsTotal + DELIVERY_FEE).toLocaleString()}</Text></View>
        </View>
        <View style={styles.codMessage}><Ionicons name="shield-checkmark-outline" size={16} color={COLORS.green} /><Text style={styles.codMessageText}>{paymentMethod === 'cod' ? 'Pay safely when your fresh order arrives.' : 'Your card payment will be securely processed.'}</Text></View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity accessibilityRole="button" onPress={proceedToVerification} style={styles.confirmButton}><Text style={styles.confirmButtonText}>{paymentMethod === 'cod' ? 'Confirm Order (Pay on Delivery)' : 'Continue to Payment'}</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { minHeight: 77, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.dark, fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 3, color: COLORS.muted, fontSize: 12 },
  content: { paddingHorizontal: 18, paddingBottom: 20 },
  sectionTitleRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { marginTop: 16, marginBottom: 9, color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  editButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  editText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  addressCard: { minHeight: 79, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  addressIcon: { width: 41, height: 41, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#EAF5EB' },
  addressCopy: { flex: 1 },
  addressText: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  addressInput: { minHeight: 43, color: COLORS.dark, fontSize: 13 },
  addressName: { marginTop: 4, color: COLORS.muted, fontSize: 11 },
  expressBanner: { minHeight: 67, marginTop: 13, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, backgroundColor: '#EAF5EB' },
  expressIcon: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.white },
  expressCopy: { flex: 1 },
  expressTitle: { color: COLORS.green, fontSize: 13, fontWeight: '800' },
  expressText: { marginTop: 3, color: COLORS.dark, fontSize: 12 },
  paymentOption: { minHeight: 71, marginBottom: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white },
  paymentSelected: { borderColor: COLORS.green },
  paymentIcon: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#EAF5EB' },
  paymentCopy: { flex: 1 },
  paymentTitle: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  paymentHint: { marginTop: 3, color: COLORS.muted, fontSize: 11 },
  radio: { width: 23, height: 23, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#AAB2AC' },
  radioSelected: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  summaryCard: { paddingHorizontal: 13, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, backgroundColor: COLORS.white },
  summaryRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  summaryHint: { marginTop: 3, color: COLORS.muted, fontSize: 10 },
  summaryValue: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.line },
  totalRow: { minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: COLORS.dark, fontSize: 14, fontWeight: '800' },
  totalValue: { color: COLORS.green, fontSize: 18, fontWeight: '800' },
  codMessage: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7 },
  codMessageText: { color: COLORS.muted, fontSize: 11 },
  bottomBar: { minHeight: 73, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  confirmButton: { minHeight: 52, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 9, backgroundColor: COLORS.green },
  confirmButtonText: { flexShrink: 1, color: COLORS.white, fontSize: 13, fontWeight: '700' },
});

export default CheckoutScreen;