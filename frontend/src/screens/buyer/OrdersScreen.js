import React from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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

const FILTER_TABS = ['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered'];

// ─── Status Configuration Helper ─────────────────────────────────────────────
const getStatusConfig = (statusRaw) => {
  const s = String(statusRaw || 'Pending').toLowerCase().trim();

  if (s.includes('pending')) {
    return {
      key: 'Pending',
      label: 'Pending',
      sinhalaLabel: '🟡 ගොවියාගේ තහවුරු කිරීම බලාපොරොත්තුවෙන්',
      subtext: 'Waiting for farmer confirmation',
      icon: 'time-outline',
      emoji: '🟡',
      step: 1,
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      textColor: '#B45309',
      dotColor: '#F59E0B',
    };
  }

  if (s.includes('accept') || s === 'confirmed') {
    return {
      key: 'Confirmed',
      label: 'Confirmed',
      sinhalaLabel: '🔵 ගොවියා භාරගෙන ඇත',
      subtext: 'Confirmed by farmer & preparing harvest',
      icon: 'checkmark-circle-outline',
      emoji: '🔵',
      step: 2,
      bgColor: '#DBEAFE',
      borderColor: '#BFDBFE',
      textColor: '#1D4ED8',
      dotColor: '#2563EB',
    };
  }

  if (s.includes('delivery') || s.includes('dispatch') || s.includes('out')) {
    return {
      key: 'Out for Delivery',
      label: 'Out for Delivery',
      sinhalaLabel: '🚚 ප්‍රවාහනයේ පවතී',
      subtext: 'Assigned to driver & on the way',
      icon: 'bicycle-outline',
      emoji: '🚚',
      step: 3,
      bgColor: '#EDE9FE',
      borderColor: '#DDD6FE',
      textColor: '#6D28D9',
      dotColor: '#7C3AED',
    };
  }

  if (s.includes('deliver') || s.includes('complete')) {
    return {
      key: 'Delivered',
      label: 'Delivered',
      sinhalaLabel: '🟢 ලැබී අවසන්',
      subtext: 'Order successfully delivered to you',
      icon: 'checkmark-done-circle-outline',
      emoji: '🟢',
      step: 4,
      bgColor: '#DCFCE7',
      borderColor: '#BBF7D0',
      textColor: '#15803D',
      dotColor: '#16A34A',
    };
  }

  if (s.includes('cancel') || s.includes('reject')) {
    return {
      key: 'Cancelled',
      label: 'Cancelled',
      sinhalaLabel: '🔴 අවලංගු කර ඇත',
      subtext: 'Order declined by farmer',
      icon: 'close-circle-outline',
      emoji: '🔴',
      step: 0,
      bgColor: '#FEE2E2',
      borderColor: '#FECACA',
      textColor: '#B91C1C',
      dotColor: '#EF4444',
    };
  }

  return {
    key: 'Pending',
    label: statusRaw || 'Pending',
    sinhalaLabel: '🟡 ගොවියාගේ තහවුරු කිරීම බලාපොරොත්තුවෙන්',
    subtext: 'Waiting for farmer confirmation',
    icon: 'time-outline',
    emoji: '🟡',
    step: 1,
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
  };
};

export default function OrdersScreen({ navigation }) {
  const { orders, loadingOrders, fetchOrders } = useCart();
  const [selectedFilter, setSelectedFilter] = React.useState('All');

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const filteredOrders = React.useMemo(() => {
    if (selectedFilter === 'All') return orders;
    return orders.filter((o) => {
      const cfg = getStatusConfig(o.status);
      return cfg.key === selectedFilter || cfg.label === selectedFilter;
    });
  }, [orders, selectedFilter]);

  const renderOrderItem = ({ item }) => {
    const hasItemsArray = Array.isArray(item.items) && item.items.length > 0;
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.orderCard}>
        {/* Top Header: Order ID & Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdRow}>
            <Ionicons name="receipt" size={17} color={COLORS.green} />
            <Text style={styles.orderIdText}>#{item.id}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusConfig.bgColor,
                borderColor: statusConfig.borderColor,
                borderWidth: 1,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusConfig.dotColor }]} />
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {statusConfig.emoji} {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* ── Status Meaning Banner (Sinhala & Real-Time Context) ── */}
        <View
          style={[
            styles.statusExplanationBanner,
            { backgroundColor: statusConfig.bgColor, borderColor: statusConfig.borderColor },
          ]}
        >
          <Ionicons name={statusConfig.icon} size={16} color={statusConfig.textColor} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusSinhalaText, { color: statusConfig.textColor }]}>
              {statusConfig.sinhalaLabel}
            </Text>
            <Text style={[styles.statusSubtext, { color: statusConfig.textColor }]}>
              {statusConfig.subtext}
            </Text>
          </View>
        </View>

        {/* ── 4-Stage Visual Progress Stepper ── */}
        {statusConfig.step > 0 && (
          <View style={styles.stepperContainer}>
            {[
              { num: 1, label: 'Pending', emoji: '🟡' },
              { num: 2, label: 'Confirmed', emoji: '🔵' },
              { num: 3, label: 'On Way', emoji: '🚚' },
              { num: 4, label: 'Delivered', emoji: '🟢' },
            ].map((st, i, arr) => {
              const isPassed = statusConfig.step >= st.num;
              const isCurrent = statusConfig.step === st.num;

              return (
                <React.Fragment key={st.num}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isPassed && {
                          backgroundColor: isCurrent ? statusConfig.dotColor : '#2E7D32',
                          borderColor: isCurrent ? statusConfig.dotColor : '#2E7D32',
                        },
                      ]}
                    >
                      <Text style={[styles.stepCircleText, isPassed && { color: '#fff', fontWeight: '800' }]}>
                        {isPassed ? (st.num < statusConfig.step ? '✓' : st.num) : st.num}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.stepLabel,
                        isPassed && { color: COLORS.dark, fontWeight: '700' },
                        isCurrent && { color: statusConfig.textColor, fontWeight: '800' },
                      ]}
                    >
                      {st.label}
                    </Text>
                  </View>
                  {i < arr.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        statusConfig.step > st.num && { backgroundColor: '#2E7D32' },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        )}

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
          Track real-time order status from farm harvest to your doorstep
        </Text>

        {/* Filter Pills */}
        <View style={styles.filterTabsRow}>
          {FILTER_TABS.map((tab) => {
            const isActive = selectedFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTabPill, isActive && styles.filterTabPillActive]}
                onPress={() => setSelectedFilter(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
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
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'All' ? 'No Orders Yet' : `No ${selectedFilter} Orders`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'All'
                ? 'Your farm orders will appear here once you complete a purchase.'
                : `You do not have any orders currently marked as '${selectedFilter}'.`}
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
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  filterTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F2F0',
    borderWidth: 1,
    borderColor: '#E2E8E3',
  },
  filterTabPillActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  filterTabText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
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
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Status Explanation Banner
  statusExplanationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusSinhalaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusSubtext: {
    fontSize: 11,
    opacity: 0.85,
    marginTop: 1,
  },

  // 4-Stage Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    width: 58,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5EAE6',
    borderWidth: 1.5,
    borderColor: '#D0D7D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stepCircleText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5EAE6',
    marginBottom: 16,
    marginHorizontal: 2,
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
