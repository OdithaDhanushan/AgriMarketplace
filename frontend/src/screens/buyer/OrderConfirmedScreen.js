import React from 'react';
import {
  Platform,
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
  background: '#EDECEB',
  dark: '#1B2E1E',
  muted: '#5A6E5D',
  line: 'rgba(255, 255, 255, 0.95)',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'web' ? 44 : 0,
  },
  center: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    marginTop: 20,
    color: COLORS.dark,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.muted,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  orderIdBadge: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  orderIdText: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: '800',
  },
  orderTotalText: {
    color: COLORS.dark,
    fontSize: 13,
    fontWeight: '600',
  },
  secureCodeCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
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
    marginVertical: 6,
  },
  secureCodeHint: {
    fontSize: 12,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 17,
  },
  deliveryNote: {
    minHeight: 44,
    marginTop: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)' } : {}),
  },
  deliveryText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'web' ? 24 : 14,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    gap: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  trackButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  trackText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  ordersButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  ordersText: {
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderConfirmedScreen;