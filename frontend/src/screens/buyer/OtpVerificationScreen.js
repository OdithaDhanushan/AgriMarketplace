import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

const DEFAULT_ORDER = {
  id: 'SK1024',
  itemName: 'Fresh Carrot',
  quantity: 20,
  unit: 'kg',
  total: 6200,
  paymentMethod: 'Cash on delivery',
};

function OtpVerificationScreen({ route, navigation }) {
  const { addOrder, clearCart } = useCart();
  const order = { ...DEFAULT_ORDER, ...(route?.params?.order || {}) };
  const [code, setCode] = useState(['4', '8', '2', '7']);
  const inputs = useRef([]);

  const updateDigit = (value, index) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setCode((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item))
    );
    if (digit && index < 3) inputs.current[index + 1]?.focus();
  };

  const confirmCode = () => {
    if (code.some((digit) => !digit)) {
      inputs.current[code.findIndex((digit) => !digit)]?.focus();
      return;
    }

    const confirmedOrder = {
      ...order,
      otpCode: code.join(''),
      status: 'Confirmed',
    };

    addOrder(confirmedOrder);
    clearCart();

    navigation.navigate('OrderConfirmed', { order: confirmedOrder });
  };

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

      <View style={styles.content}>
        {/* Product Icon Circle */}
        <View style={styles.productIconCircle}>
          <Ionicons name="cube-outline" size={40} color={COLORS.white} />
        </View>

        <Text style={styles.addOtpTitle}>Add OPT</Text>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order #</Text>
            <Text style={styles.orderValue}>#{order.id}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>{order.itemName}</Text>
            <Text style={styles.orderValue}>{order.quantity}{order.unit}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total amount</Text>
            <Text style={styles.totalValue}>Rs.{Number(order.total).toLocaleString()}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Payment method</Text>
            <Text style={styles.orderValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Delivery Verification Code */}
        <View style={styles.verificationBox}>
          <View style={styles.verificationHeader}>
            <Ionicons name="lock-closed" size={15} color={COLORS.muted} />
            <Text style={styles.verificationTitle}>DELIVERY VERIFICATION CODE</Text>
          </View>
          <View style={styles.digitRow}>
            {code.map((digit, index) => (
              <TextInput
                key={`digit-${index}`}
                ref={(ref) => { inputs.current[index] = ref; }}
                accessibilityLabel={`Verification digit ${index + 1}`}
                value={digit}
                onChangeText={(value) => updateDigit(value, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !code[index] && index > 0)
                    inputs.current[index - 1]?.focus();
                }}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={styles.digitInput}
              />
            ))}
          </View>
          <Text style={styles.verificationHint}>
            Give this code to the delivery partner when your order arrives
          </Text>
        </View>
      </View>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={confirmCode}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmText}>Confirm</Text>
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

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10, alignItems: 'center' },

  // Product Icon Circle
  productIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  addOtpTitle: {
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },

  // Order Card
  orderCard: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  orderLabel: { color: COLORS.muted, fontSize: 13 },
  orderValue: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.line, marginVertical: 4 },
  totalValue: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },

  // Verification Box
  verificationBox: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#F0F7F0',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  verificationTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  digitInput: {
    width: 60,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    color: COLORS.green,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
  },
  verificationHint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    marginBottom: 16,
  },
  confirmButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});

export default OtpVerificationScreen;