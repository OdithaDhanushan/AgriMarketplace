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

const DEFAULT_ORDER = { id: 'SK1024', itemName: 'Fresh Carrots', quantity: 20, unit: 'kg', total: 6200, paymentMethod: 'Cash on delivery' };

function OtpVerificationScreen({ route, navigation }) {
  const order = { ...DEFAULT_ORDER, ...(route?.params?.order || {}) };
  const [code, setCode] = useState(['4', '8', '2', '7']);
  const inputs = useRef([]);

  const updateDigit = (value, index) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 3) inputs.current[index + 1]?.focus();
  };

  const confirmCode = () => {
    if (code.some((digit) => !digit)) {
      inputs.current[code.findIndex((digit) => !digit)]?.focus();
      return;
    }
    navigation.navigate('OrderConfirmed', { order });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="chevron-back" size={23} color={COLORS.dark} /></TouchableOpacity>
        <View><Text style={styles.title}>Delivery verification</Text><Text style={styles.subtitle}>One last step to keep your order safe</Text></View>
      </View>
      <View style={styles.content}>
        <View style={styles.orderCard}>
          <View style={styles.orderCardTop}><View style={styles.orderIcon}><Ionicons name="receipt-outline" size={20} color={COLORS.green} /></View><View style={styles.orderIdBlock}><Text style={styles.orderNumber}>Order #{order.id}</Text><Text style={styles.orderStatus}>Ready for delivery</Text></View><View style={styles.statusMark}><Ionicons name="checkmark" size={15} color={COLORS.white} /></View></View>
          <View style={styles.divider} />
          <View style={styles.orderRow}><Text style={styles.rowLabel}>Order items</Text><Text style={styles.rowValue}>{order.itemName} {order.quantity}{order.unit}</Text></View>
          <View style={styles.orderRow}><Text style={styles.rowLabel}>Total amount</Text><Text style={styles.totalValue}>Rs. {Number(order.total).toLocaleString()}</Text></View>
          <View style={styles.orderRow}><Text style={styles.rowLabel}>Payment method</Text><View style={styles.codTag}><Ionicons name="cash-outline" size={14} color={COLORS.green} /><Text style={styles.codText}>{order.paymentMethod}</Text></View></View>
        </View>

        <View style={styles.securityIcon}><Ionicons name="shield-checkmark" size={27} color={COLORS.green} /></View>
        <Text style={styles.codeTitle}>DELIVERY VERIFICATION CODE</Text>
        <Text style={styles.codeDescription}>Give this code to the delivery partner when your order arrives.</Text>
        <View style={styles.digitRow}>
          {code.map((digit, index) => (
            <TextInput
              key={`digit-${index}`}
              ref={(ref) => { inputs.current[index] = ref; }}
              accessibilityLabel={`Verification digit ${index + 1}`}
              value={digit}
              onChangeText={(value) => updateDigit(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus();
              }}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              style={styles.digitInput}
            />
          ))}
        </View>
      </View>
      <View style={styles.bottomBar}><TouchableOpacity accessibilityRole="button" onPress={confirmCode} style={styles.confirmButton}><Text style={styles.confirmText}>Confirm</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white} /></TouchableOpacity></View>
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: { minHeight: 77, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.dark, fontSize: 20, fontWeight: '800' },
  subtitle: { marginTop: 3, color: COLORS.muted, fontSize: 11 },
  content: { flex: 1, paddingHorizontal: 19, paddingTop: 9 },
  orderCard: { paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, backgroundColor: COLORS.white },
  orderCardTop: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#EAF5EB' },
  orderIdBlock: { flex: 1 },
  orderNumber: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },
  orderStatus: { marginTop: 3, color: COLORS.green, fontSize: 11, fontWeight: '600' },
  statusMark: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: COLORS.green },
  divider: { marginVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.line },
  orderRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowLabel: { color: COLORS.muted, fontSize: 12 },
  rowValue: { flexShrink: 1, color: COLORS.dark, textAlign: 'right', fontSize: 12, fontWeight: '600' },
  totalValue: { color: COLORS.green, fontSize: 14, fontWeight: '800' },
  codTag: { minHeight: 30, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, backgroundColor: '#EAF5EB' },
  codText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  securityIcon: { width: 58, height: 58, marginTop: 44, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderRadius: 29, backgroundColor: '#EAF5EB' },
  codeTitle: { marginTop: 17, color: COLORS.dark, textAlign: 'center', fontSize: 14, fontWeight: '800', letterSpacing: 0.4 },
  codeDescription: { maxWidth: 300, marginTop: 8, alignSelf: 'center', color: COLORS.muted, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  digitRow: { marginTop: 25, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  digitInput: { width: 56, height: 62, borderRadius: 10, borderWidth: 1.5, borderColor: '#B9D9BC', backgroundColor: COLORS.white, color: COLORS.green, textAlign: 'center', fontSize: 23, fontWeight: '800' },
  bottomBar: { minHeight: 72, paddingHorizontal: 17, paddingVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  confirmButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 9, backgroundColor: COLORS.green },
  confirmText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});

export default OtpVerificationScreen;