import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import api from '../services/api';

// Available Delivery Drivers (Component 3: Secondary Stakeholder - e.g., Nimal, 40)
const MOCK_DRIVERS = [
  { id: 'drv_1', name: 'Nimal Perera', vehicle: 'Three-Wheeler (Bajaj RE)', phone: '+94 71 234 5678', distance: '1.2 km away' },
  { id: 'drv_2', name: 'Ajith Kumara', vehicle: 'Mini Van (Carry)', phone: '+94 77 987 6543', distance: '3.5 km away' },
  { id: 'drv_3', name: 'Sunil Silva', vehicle: 'Motorcycle with Box', phone: '+94 75 444 3322', distance: '0.8 km away' },
];

export default function FarmerOrdersScreen({ navigation }) {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [assignedDrivers, setAssignedDrivers] = useState({}); // { orderId: driverName }

  const [orders, setOrders] = useState([
    {
      _id: 'ord_1',
      buyerName: 'Priya Restaurant (Colombo)',
      cropName: 'Apples',
      quantityKg: 10,
      totalAmount: 3000,
      status: 'PENDING',
      date: 'Today, 10:30 AM',
    },
    {
      _id: 'ord_2',
      buyerName: 'Green Leaf Retail Shop',
      cropName: 'Carrots',
      quantityKg: 25,
      totalAmount: 5500,
      status: 'ACCEPTED',
      date: 'Yesterday, 2:15 PM',
    },
  ]);

  useEffect(() => {
    fetchOrdersFromBackend();
  }, []);

  const fetchOrdersFromBackend = async () => {
    try {
      const res = await api.get('/orders');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map((o) => ({
          _id: o._id || o.id,
          id: o.orderNumber ? o.orderNumber.replace('#', '') : (o._id ? o._id.slice(-6).toUpperCase() : `ORD-${Date.now()}`),
          buyerName: o.buyerId?.name || (o.userEmail ? o.userEmail.split('@')[0] : 'Retail Buyer'),
          cropName: o.items?.[0]?.productName || o.items?.[0]?.name || 'Fresh Produce',
          quantityKg: o.items?.[0]?.quantity || 10,
          totalAmount: o.totalAmount || o.total || 0,
          status: o.status || 'Pending',
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Recent Order',
        }));
        setOrders(normalized);
      }
    } catch (e) {
      console.log('Using local fallback orders:', e.message);
    }
  };

  const handleAcceptOrder = async (id) => {
    setOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, status: 'Confirmed' } : ord))
    );
    try {
      await api.patch(`/orders/${id}/status`, { status: 'Confirmed' });
    } catch (err) {
      console.log('Backend sync notice:', err?.response?.data || err.message);
    }
    Alert.alert('🔵 Order Confirmed!', 'You have confirmed the order. You can now dispatch a delivery partner.');
  };

  const handleRejectOrder = async (id) => {
    setOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, status: 'Cancelled' } : ord))
    );
    try {
      await api.patch(`/orders/${id}/status`, { status: 'Cancelled' });
    } catch (err) {
      console.log('Backend sync notice:', err?.response?.data || err.message);
    }
    Alert.alert('Order Declined', 'The order has been cancelled.');
  };

  const handleMarkDelivered = async (id) => {
    setOrders((prev) =>
      prev.map((ord) => (ord._id === id ? { ...ord, status: 'Delivered' } : ord))
    );
    try {
      await api.patch(`/orders/${id}/status`, { status: 'Delivered' });
    } catch (err) {
      console.log('Backend sync notice:', err?.response?.data || err.message);
    }
    Alert.alert('🟢 Order Delivered!', 'This order has been marked as completed & delivered.');
  };

  // Open Driver Assignment Modal
  const openDispatchModal = (order) => {
    setSelectedOrder(order);
    setDriverModalVisible(true);
  };

  // Assign Driver & Update Backend
  const handleAssignDriver = async (driver) => {
    if (!selectedOrder) return;

    setAssignedDrivers((prev) => ({ ...prev, [selectedOrder._id]: driver.name }));
    setDriverModalVisible(false);

    // Update local order status to Out for Delivery
    setOrders((prev) =>
      prev.map((ord) => (ord._id === selectedOrder._id ? { ...ord, status: 'Out for Delivery' } : ord))
    );

    Alert.alert(
      '🚚 Driver Dispatched!',
      `Successfully assigned ${driver.name} (${driver.vehicle}) to deliver this order.`
    );

    try {
      await api.patch(`/orders/${selectedOrder._id}/status`, { status: 'Out for Delivery' });
      await api.post('/deliveries', {
        orderId: selectedOrder._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicle: driver.vehicle,
        status: 'Out for Delivery',
      });
    } catch (e) {
      console.log('Logistics API sync notice:', e.message);
    }
  };

  const isStatusPending = (st) => String(st).toUpperCase() === 'PENDING';
  const isStatusConfirmed = (st) => ['ACCEPTED', 'CONFIRMED'].includes(String(st).toUpperCase());
  const isStatusDispatched = (st) => ['OUT_FOR_DELIVERY', 'OUT FOR DELIVERY'].includes(String(st).toUpperCase());
  const isStatusDelivered = (st) => String(st).toUpperCase() === 'DELIVERED';

  const filteredOrders = orders.filter((ord) => {
    if (filterTab === 'PENDING') return isStatusPending(ord.status);
    if (filterTab === 'ACCEPTED') return isStatusConfirmed(ord.status) || isStatusDispatched(ord.status);
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#bfe3b4', '#d8eed1', '#f5f7f6', '#ffffff']} style={styles.gradientBackground} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incoming Farm Orders</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBanner}>
            <Ionicons name="receipt-outline" size={22} color="#2e7d32" />
            <Text style={styles.infoBannerText}>
              Manage orders and dispatch local delivery drivers directly for secure fulfillment.
            </Text>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {['ALL', 'PENDING', 'ACCEPTED'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, filterTab === tab && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setFilterTab(tab)}
              >
                <Text style={[styles.filterChipText, filterTab === tab && styles.filterChipTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No orders found under this filter.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderCardTop}>
                  <View style={styles.rowAlign}>
                    <MaterialCommunityIcons name="storefront-outline" size={20} color="#2e7d32" />
                    <Text style={styles.buyerName}>{order.buyerName || 'Retail Buyer'}</Text>
                  </View>
                  <Text
                    style={[
                      styles.statusBadge,
                      (order.status === 'ACCEPTED' || order.status === 'Confirmed') && styles.statusACCEPTED,
                      (order.status === 'OUT_FOR_DELIVERY' || order.status === 'Out for Delivery') && styles.statusDispatched,
                      (order.status === 'PENDING' || order.status === 'Pending') && styles.statusPending,
                      (order.status === 'REJECTED' || order.status === 'Cancelled') && styles.statusRejected,
                      (order.status === 'Delivered') && { backgroundColor: '#e8f5e9', color: '#2e7d32' },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>

                <View style={styles.orderDetailsBox}>
                  <Text style={styles.cropOrdered}>
                    📦 {order.quantityKg || order.requestedQuantityKg} kg of <Text style={{ fontWeight: '900' }}>{order.cropName || 'Produce'}</Text>
                  </Text>
                  <Text style={styles.orderAmount}>Total: Rs. {order.totalAmount || 3000}</Text>
                  <Text style={styles.orderDate}>{order.date || 'Recent Order'}</Text>

                  {assignedDrivers[order._id] && (
                    <Text style={styles.assignedDriverText}>
                      🚚 Assigned Driver: <Text style={{ fontWeight: 'bold' }}>{assignedDrivers[order._id]}</Text>
                    </Text>
                  )}
                </View>

                {/* Pending Actions */}
                {(order.status === 'PENDING' || order.status === 'Pending') && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      activeOpacity={0.8}
                      onPress={() => handleRejectOrder(order._id)}
                    >
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      activeOpacity={0.8}
                      onPress={() => handleAcceptOrder(order._id)}
                    >
                      <Text style={styles.acceptBtnText}>Accept Order</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 🚚 COMPONENT 3 INTEGRATION: Arrange Delivery Button */}
                {(order.status === 'ACCEPTED' || order.status === 'Confirmed') && (
                  <TouchableOpacity
                    style={styles.logisticsBtn}
                    activeOpacity={0.85}
                    onPress={() => openDispatchModal(order)}
                  >
                    <Ionicons name="car-sport" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.logisticsBtnText}>🚚 Arrange Delivery (Dispatch Rider)</Text>
                  </TouchableOpacity>
                )}

                {/* Out for Delivery Action */}
                {(order.status === 'OUT_FOR_DELIVERY' || order.status === 'Out for Delivery') && (
                  <TouchableOpacity
                    style={[styles.logisticsBtn, { backgroundColor: '#2e7d32' }]}
                    activeOpacity={0.85}
                    onPress={() => handleMarkDelivered(order._id)}
                  >
                    <Ionicons name="checkmark-done" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.logisticsBtnText}>🟢 Mark as Delivered</Text>
                  </TouchableOpacity>
                )}

                {/* Delivered state */}
                {order.status === 'Delivered' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: '#e8f5e9' }}>
                    <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
                    <Text style={{ color: '#2e7d32', fontWeight: '700', fontSize: 13 }}>Order Completed & Delivered</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <BottomNavBar activeTab="Orders" navigation={navigation} />

        {/* 🚚 SELECT DELIVERY DRIVER MODAL (Component 3) */}
        {driverModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              onPress={() => setDriverModalVisible(false)}
            />

            <View style={styles.modalContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.modalTitle}>Assign Delivery Partner</Text>
                <TouchableOpacity onPress={() => setDriverModalVisible(false)}>
                  <Ionicons name="close-circle" size={26} color="#333" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Select a nearby logistics provider for pickup:</Text>

              {MOCK_DRIVERS.map((driver) => (
                <TouchableOpacity
                  key={driver.id}
                  style={styles.driverOption}
                  activeOpacity={0.8}
                  onPress={() => handleAssignDriver(driver)}
                >
                  <View style={styles.driverIconCircle}>
                    <Ionicons name="bicycle" size={22} color="#1976d2" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.driverName}>{driver.name} ({driver.distance})</Text>
                    <Text style={styles.driverVehicle}>{driver.vehicle} • {driver.phone}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#777" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7', position: 'relative' },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 44 : 14,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1f5223', textAlign: 'center' },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#a5d6a7',
  },
  infoBannerText: { fontSize: 12, color: '#1b5e20', fontWeight: '600', marginLeft: 10, flex: 1 },

  filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  filterChip: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dce7dc',
  },
  filterChipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  filterChipText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  filterChipTextActive: { color: '#fff' },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  orderCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  buyerName: { fontSize: 15, fontWeight: 'bold', color: '#222', marginLeft: 8 },
  statusBadge: { fontSize: 11, fontWeight: '900', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusPending: { backgroundColor: '#fff8e1', color: '#b7791f' },
  statusACCEPTED: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  statusDispatched: { backgroundColor: '#e3f2fd', color: '#1976d2' },
  statusRejected: { backgroundColor: '#ffebee', color: '#c62828' },
  orderDetailsBox: { backgroundColor: '#f8faf9', borderRadius: 12, padding: 12, marginBottom: 12 },
  cropOrdered: { fontSize: 15, color: '#333', marginBottom: 4 },
  orderAmount: { fontSize: 16, fontWeight: '900', color: '#1b5e20', marginBottom: 2 },
  orderDate: { fontSize: 11, color: '#777' },
  assignedDriverText: { fontSize: 12, color: '#1976d2', marginTop: 6 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  rejectBtn: { flex: 1, backgroundColor: '#ffebee', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  rejectBtnText: { color: '#c62828', fontWeight: 'bold', fontSize: 14 },
  acceptBtn: { flex: 1, backgroundColor: '#2e7d32', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  logisticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 4,
    elevation: 2,
  },
  logisticsBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  emptyBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Driver Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    zIndex: 999999,
  },
  backdropDismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
    elevation: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  modalSub: { fontSize: 12, color: '#666', marginTop: 2, marginBottom: 14 },
  driverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  driverIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  driverVehicle: { fontSize: 11, color: '#666', marginTop: 2 },
});