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
  const order = route?.params?.order;

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

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <View style={styles.checkCircle}><Ionicons name="checkmark" size={58} color={COLORS.white} /></View>
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
        <View style={styles.deliveryNote}>
          <Ionicons name="leaf-outline" size={18} color={COLORS.green} />
          <Text style={styles.deliveryText}>Thank you for supporting local farmers.</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity accessibilityRole="button" onPress={goToOrders} style={styles.doneButton}>
          <Text style={styles.doneText}>View Orders</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = { green: '#2E7D32', accent: '#4CAF50', background: '#F8F9FA', dark: '#212121', muted: '#68736B', line: '#E5EAE6', white: '#FFFFFF' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 122, height: 122, alignItems: 'center', justifyContent: 'center', borderRadius: 61, backgroundColor: COLORS.green, shadowColor: COLORS.green, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  title: { marginTop: 27, color: COLORS.dark, textAlign: 'center', fontSize: 27, fontWeight: '800' },
  subtitle: { marginTop: 9, color: COLORS.muted, textAlign: 'center', fontSize: 15 },
  orderIdBadge: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#EAF5EB', borderWidth: 1, borderColor: '#C8E6C9', alignItems: 'center', gap: 4 },
  orderIdText: { color: COLORS.green, fontSize: 15, fontWeight: '800' },
  orderTotalText: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  deliveryNote: { minHeight: 48, marginTop: 20, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 9, backgroundColor: '#EAF5EB' },
  deliveryText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  bottom: { paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.white },
  doneButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 9, backgroundColor: COLORS.green },
  doneText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});

export default OrderConfirmedScreen;