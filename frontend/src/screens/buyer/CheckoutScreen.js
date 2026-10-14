import React, { useState } from 'react';
import {
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
import { useAuth } from '../../context/AuthContext';

const DEFAULT_PRODUCT = {
  id: 'carrot-01',
  name: 'Carrots',
  price: 280,
  unit: 'kg',
  farmer: 'Sunil Perera',
  image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400',
};
const DEFAULT_QUANTITY = 20;
const DELIVERY_FEE = 1500;

function CheckoutScreen({ route, navigation }) {
  const { user } = useAuth();
  const product = route?.params?.product || DEFAULT_PRODUCT;
  const quantity = Number(route?.params?.quantity || DEFAULT_QUANTITY);
  const unitPrice = Number(product.price || DEFAULT_PRODUCT.price);
  const itemsTotal = unitPrice * quantity;

  const [address, setAddress] = useState('Cafe Fresh, No 45, Green Path, Colombo 07');
  const [editingAddress, setEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const total = itemsTotal + DELIVERY_FEE;

  const proceedToVerification = () =>
    navigation.navigate('OtpVerification', {
      order: {
        id: `SK${Math.floor(1000 + Math.random() * 9000)}`,
        itemName: product.name || DEFAULT_PRODUCT.name,
        quantity,
        unit: product.unit || DEFAULT_PRODUCT.unit,
        total,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on delivery' : 'Online card payment',
        address,
        userEmail: user?.email || 'sahan@gmail.com',
        productImage: product.image || DEFAULT_PRODUCT.image,
      },
    });

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={23} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconRow}>
            <Ionicons name="location" size={16} color={COLORS.green} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setEditingAddress((current) => !current)}
            style={styles.editButton}
          >
            <Text style={styles.editText}>{editingAddress ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addressCard}>
          {editingAddress ? (
            <TextInput
              accessibilityLabel="Delivery address"
              value={address}
              onChangeText={setAddress}
              multiline
              autoFocus
              style={styles.addressInput}
              placeholder="Enter delivery address"
            />
          ) : (
            <Text style={styles.addressText}>{address}</Text>
          )}
        </View>

        {/* Express Delivery Banner */}
        <View style={styles.expressBanner}>
          <View style={styles.expressIconWrap}>
            <Ionicons name="flash" size={18} color={COLORS.green} />
          </View>
          <View style={styles.expressCopy}>
            <Text style={styles.expressTitle}>GUARANTEED EXPRESS DELIVERY</Text>
            <Text style={styles.expressText}>Tomorrow by 8:00 AM</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={COLORS.green} />
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionLabel}>Select Payment Method</Text>

        {/* COD Option */}
        <TouchableOpacity
          accessibilityRole="radio"
          accessibilityState={{ checked: paymentMethod === 'cod' }}
          onPress={() => setPaymentMethod('cod')}
          style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentSelected]}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIconWrap}>
              <Ionicons name="cash-outline" size={22} color={COLORS.green} />
            </View>
            <View style={styles.paymentCopy}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentHint}>Pay with cash on your doorstep</Text>
              {paymentMethod === 'cod' && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>⭐ RECOMMENDED FOR 1ST PURCHASE</Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.radio, paymentMethod === 'cod' && styles.radioSelected]}>
            {paymentMethod === 'cod' && <Ionicons name="checkmark" size={13} color={COLORS.white} />}
          </View>
        </TouchableOpacity>

        {/* Online Card Option */}
        <TouchableOpacity
          accessibilityRole="radio"
          accessibilityState={{ checked: paymentMethod === 'card' }}
          onPress={() => setPaymentMethod('card')}
          style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentSelected]}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIconWrap}>
              <Ionicons name="card-outline" size={22} color={COLORS.green} />
            </View>
            <View style={styles.paymentCopy}>
              <Text style={styles.paymentTitle}>Online Card Payment</Text>
              <Text style={styles.paymentHint}>Visa, Mastercard, AMEX</Text>
            </View>
          </View>
          <View style={[styles.radio, paymentMethod === 'card' && styles.radioSelected]}>
            {paymentMethod === 'card' && <Ionicons name="checkmark" size={13} color={COLORS.white} />}
          </View>
        </TouchableOpacity>

        {/* Order Summary */}
        <Text style={styles.sectionLabel}>Order Summary</Text>
        <View style={styles.summaryCard}>
          {/* Product row */}
          <View style={styles.summaryProductRow}>
            <Image
              source={{ uri: product.image || DEFAULT_PRODUCT.image }}
              style={styles.summaryProductImage}
            />
            <View style={styles.summaryProductInfo}>
              <Text style={styles.summaryProductName}>{product.name || DEFAULT_PRODUCT.name} ({quantity}{product.unit || DEFAULT_PRODUCT.unit})</Text>
            </View>
            <Text style={styles.summaryValue}>Rs. {itemsTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>Rs. {DELIVERY_FEE.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable on Delivery</Text>
            <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
          </View>
          <Text style={styles.noPaymentNote}>
            {paymentMethod === 'cod'
              ? 'Zero upfront payment required'
              : 'Secure online payment'}
          </Text>
        </View>

        {/* Security note */}
        <View style={styles.codMessage}>
          <Ionicons name="shield-checkmark-outline" size={15} color={COLORS.green} />
          <Text style={styles.codMessageText}>
            An unique SMS confirmation will be sent to your phone once the delivery driver accepts the pickup.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={proceedToVerification}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>
            {paymentMethod === 'cod' ? 'Confirm Order (Pay on Delivery)' : 'Continue to Payment'}
          </Text>
        </TouchableOpacity>
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

  // Header
  header: { height: 54, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: 16, paddingBottom: 90 },

  // Address
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { color: COLORS.dark, fontSize: 14, fontWeight: '700' },
  sectionLabel: { color: COLORS.dark, fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  editButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  editText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  addressCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  addressText: { color: COLORS.dark, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  addressInput: { minHeight: 50, color: COLORS.dark, fontSize: 13 },

  // Express Banner
  expressBanner: {
    minHeight: 64,
    marginTop: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    backgroundColor: '#EAF5EB',
  },
  expressIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expressCopy: { flex: 1 },
  expressTitle: { color: COLORS.green, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  expressText: { color: COLORS.dark, fontSize: 13, fontWeight: '600', marginTop: 2 },

  // Payment
  paymentOption: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  paymentSelected: { borderColor: COLORS.green },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  paymentIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: '#EAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCopy: { flex: 1 },
  paymentTitle: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  paymentHint: { marginTop: 2, color: COLORS.muted, fontSize: 11 },
  recommendedBadge: {
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FFF3E0',
  },
  recommendedText: { color: '#E65100', fontSize: 9, fontWeight: '800', letterSpacing: 0.2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#AAB2AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.green, backgroundColor: COLORS.green },

  // Order Summary
  summaryCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  summaryProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  summaryProductImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5ECE6',
  },
  summaryProductInfo: { flex: 1 },
  summaryProductName: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  summaryRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  summaryValue: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.line },
  totalRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { color: COLORS.dark, fontSize: 14, fontWeight: '800' },
  totalValue: { color: COLORS.green, fontSize: 18, fontWeight: '800' },
  noPaymentNote: { color: COLORS.muted, fontSize: 10, marginTop: 2, marginBottom: 6 },

  // COD message
  codMessage: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  codMessageText: { color: COLORS.muted, fontSize: 11, flex: 1, lineHeight: 16 },

  // Bottom confirm
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  confirmButton: {
    minHeight: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.green,
  },
  confirmButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});

export default CheckoutScreen;