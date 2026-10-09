import React from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#F8F9FA',
  dark: '#212121',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
};

export default function OrdersScreen({ navigation }) {
  const { orders, loadingOrders, fetchOrders } = useCart();

  const renderOrderItem = ({ item }) => {
    const hasItemsArray = Array.isArray(item.items) && item.items.length > 0;

    return (
      <View style={styles.orderCard}>
        {/* Top Header: Order ID & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdRow}>
            <Ionicons name="receipt" size={17} color={COLORS.green} />
            <Text style={styles.orderIdText}>#{item.id}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{item.status || 'Confirmed'}</Text>
          </View>
        </View>

        <Text style={styles.orderDateText}>{item.date || 'Recent order'}</Text>

        <View style={styles.divider} />

        {/* Product Items */}
        {hasItemsArray ? (
          <View style={styles.itemsList}>
            {item.items.map((prod, index) => (
              <View key={prod.id || `prod-${index}`} style={styles.itemRow}>
                {prod.image ? (
                  <Image source={{ uri: prod.image }} style={styles.itemThumb} />
                ) : (
                  <View style={styles.itemPlaceholderThumb}>
                    <Ionicons name="leaf" size={16} color={COLORS.green} />
                  </View>
                )}
                <View style={styles.itemCopy}>
                  <Text numberOfLines={1} style={styles.itemName}>
                    {prod.name || prod.cropName || 'Fresh Item'}
                  </Text>
                  <Text style={styles.itemSub}>
                    {prod.farmer ? `${prod.farmer} • ` : ''}
                    {prod.quantity} {prod.unit || 'kg'}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  Rs. {((Number(prod.unitPrice) || 0) * (Number(prod.quantity) || 1)).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.itemRow}>
            <View style={styles.itemPlaceholderThumb}>
              <Ionicons name="cube-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemName}>{item.itemName || 'Fresh Produce'}</Text>
              <Text style={styles.itemSub}>{item.quantity} {item.unit || 'kg'}</Text>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* Delivery & Payment Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <View style={styles.metaIconRow}>
              <Ionicons
                name={item.paymentMethod === 'Card Payment' ? 'card-outline' : 'cash-outline'}
                size={14}
                color={COLORS.muted}
              />
              <Text style={styles.metaText}>{item.paymentMethod || 'Cash on Delivery'}</Text>
            </View>
            {item.deliveryAddress && (
              <View style={[styles.metaIconRow, { marginTop: 4 }]}>
                <Ionicons name="location-outline" size={14} color={COLORS.muted} />
                <Text numberOfLines={1} style={styles.metaText}>{item.deliveryAddress}</Text>
              </View>
            )}
          </View>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs. {Number(item.total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Verification code pill */}
        {item.otpCode && (
          <View style={styles.otpBanner}>
            <Ionicons name="key-outline" size={13} color={COLORS.green} />
            <Text style={styles.otpBannerText}>
              Delivery OTP: <Text style={styles.otpBold}>{item.otpCode}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>
          {orders.length} {orders.length === 1 ? 'order confirmed' : 'orders confirmed'}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item, index) => item.id || `order-${index}`}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(loadingOrders)}
            onRefresh={fetchOrders}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="receipt-outline" size={56} color="#A8B6A9" />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your confirmed orders will appear here once you complete a purchase.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => navigation.navigate('Explore')}
              style={styles.browseButton}
            >
              <Text style={styles.browseButtonText}>Browse fresh produce</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  title: { color: COLORS.dark, fontSize: 24, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  listContent: { padding: 16, paddingBottom: 32 },

  // Order Card
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderIdText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#EAF5EB',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  statusText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '700',
  },
  orderDateText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 10,
  },

  // Items
  itemsList: { gap: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5ECE6',
  },
  itemPlaceholderThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: { flex: 1 },
  itemName: { color: COLORS.dark, fontSize: 14, fontWeight: '700' },
  itemSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  itemPrice: { color: COLORS.dark, fontSize: 13, fontWeight: '700' },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  metaCol: { flex: 1, paddingRight: 10 },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: { color: COLORS.muted, fontSize: 12, flexShrink: 1 },
  totalBlock: { alignItems: 'flex-end' },
  totalLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '500' },
  totalValue: { color: COLORS.green, fontSize: 17, fontWeight: '800', marginTop: 1 },

  // OTP Banner
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F8F1',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  otpBannerText: { color: COLORS.dark, fontSize: 12 },
  otpBold: { color: COLORS.green, fontWeight: '800' },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { color: COLORS.dark, fontSize: 20, fontWeight: '800' },
  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  browseButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: COLORS.green,
  },
  browseButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});
