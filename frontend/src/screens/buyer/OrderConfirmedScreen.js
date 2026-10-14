import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function OrderConfirmedScreen({ route, navigation }) {
  const order = route?.params?.order || {
    id: 'SK1024',
    itemName: 'Fresh Tomatoes',
    quantity: 10,
    unit: 'kg',
    total: 2450,
    otpCode: '4827',
  };

  const deliveryOtp = order?.otpCode || '4827';

  const goToOrders = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'BuyerTabs',
          params: { screen: 'Orders' },
        },
      ],
    });
  };

  const trackOrder = () => {
    navigation.navigate('TrackOrder', { order });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={54} color={COLORS.white} />
        </View>
        <Text style={styles.title}>Order confirmed!</Text>
        <Text style={styles.subtitle}>Your fresh farm order is on its way.</Text>

        {order?.id && (
          <View style={styles.orderIdBadge}>
            <Text style={styles.orderIdText}>Order #{order.id}</Text>
            {order?.total && (
              <Text style={styles.orderTotalText}>Total: Rs. {Number(order.total).toLocaleString()}</Text>
            )}
          </View>
        )}

        {/* Customer Verification Code Box (Shown exclusively to Buyer) */}
        <View style={styles.secureCodeCard}>
          <View style={styles.secureCodeHeader}>
            <Ionicons name="shield-checkmark" size={17} color={COLORS.green} />
            <Text style={styles.secureCodeTitle}>Your Delivery Verification Code</Text>
          </View>
          <Text style={styles.codeDigits}>{deliveryOtp.split('').join(' ')}</Text>
          <Text style={styles.secureCodeHint}>
            🔒 Provide this 4-digit code to your delivery driver upon receiving your produce to verify and complete delivery safely.
          </Text>
        </View>

        <View style={styles.deliveryNote}>
          <Ionicons name="leaf-outline" size={18} color={COLORS.green} />
          <Text style={styles.deliveryText}>Thank you for supporting local farmers.</Text>
        </View>

        {/* Test Delivery Partner Flow link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('DeliveryJob', { order })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingVertical: 6 }}
        >
          <Ionicons name="bicycle-outline" size={16} color={COLORS.green} />
          <Text style={{ color: COLORS.green, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>
            Test Delivery Partner Flow (Driver Job)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        {/* Track Order Primary Button */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={trackOrder}
          style={styles.trackButton}
        >
          <Ionicons name="map-outline" size={18} color={COLORS.white} />
          <Text style={styles.trackText}>Track Live Order</Text>
        </TouchableOpacity>

        {/* View Orders Secondary Button */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={goToOrders}
          style={styles.ordersButton}
        >
          <Text style={styles.ordersText}>View My Orders</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.muted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#F8F9FA',
  dark: '#212121',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  checkCircle: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: { marginTop: 18, color: COLORS.dark, textAlign: 'center', fontSize: 24, fontWeight: '800' },
  subtitle: { marginTop: 6, color: COLORS.muted, textAlign: 'center', fontSize: 14 },
  orderIdBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EAF5EB',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    gap: 2,
  },
  orderIdText: { color: COLORS.green, fontSize: 15, fontWeight: '800' },
  orderTotalText: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  secureCodeCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  secureCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  secureCodeTitle: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '700',
  },
  codeDigits: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
    letterSpacing: 8,
    marginVertical: 4,
  },
  secureCodeHint: {
    fontSize: 12,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 17,
  },
  deliveryNote: {
    minHeight: 40,
    marginTop: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#EAF5EB',
  },
  deliveryText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  bottom: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  trackButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  trackText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  ordersButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    backgroundColor: '#F1F4F1',
  },
  ordersText: { color: COLORS.dark, fontSize: 14, fontWeight: '600' },
});

export default OrderConfirmedScreen;