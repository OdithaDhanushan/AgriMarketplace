import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAdminProduce,
  deleteAdminUser,
  getAdminMetrics,
  getAdminOrders,
  getAdminProduce,
  getAdminUsers,
  updateAdminOrderStatus,
} from '../../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#4CAF50',
  amber: '#F59E0B',
  blue: '#2563EB',
  purple: '#7C3AED',
  rose: '#E11D48',
  bg: '#F4F7F4',
  cardBg: '#FFFFFF',
  textDark: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  tagGreen: '#DCFCE7',
  tagGreenText: '#15803D',
  tagBlue: '#DBEAFE',
  tagBlueText: '#1D4ED8',
  tagAmber: '#FEF3C7',
  tagAmberText: '#B45309',
  tagRose: '#FFE4E6',
  tagRoseText: '#BE123C',
};

const STATUS_COLORS = {
  Confirmed: { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle' },
  Processing: { bg: '#FEF3C7', text: '#B45309', icon: 'sync' },
  'Out for Delivery': { bg: '#F3E8FF', text: '#6B21A8', icon: 'bicycle' },
  Delivered: { bg: '#DCFCE7', text: '#15803D', icon: 'shield-checkmark' },
  Cancelled: { bg: '#FFE4E6', text: '#BE123C', icon: 'close-circle' },
};

export default function AdminDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, produce, users
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  const [produceList, setProduceList] = useState([]);
  const [produceSearch, setProduceSearch] = useState('');

  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Status update modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const showNotification = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const loadAllData = useCallback(async () => {
    try {
      const [metricsData, ordersData, produceData, usersData] = await Promise.all([
        getAdminMetrics().catch(() => null),
        getAdminOrders().catch(() => []),
        getAdminProduce().catch(() => []),
        getAdminUsers().catch(() => []),
      ]);

      if (metricsData) setMetrics(metricsData);
      if (Array.isArray(ordersData)) setOrders(ordersData);
      if (Array.isArray(produceData)) setProduceList(produceData);
      if (Array.isArray(usersData)) setUsersList(usersData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateAdminOrderStatus(selectedOrder._id, newStatus);
      showNotification('Success', `Order #${selectedOrder.orderNumber} updated to ${newStatus}`);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      // Reload orders & metrics
      loadAllData();
    } catch (error) {
      showNotification('Error', error.response?.data?.message || 'Could not update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteUser = (targetUser) => {
    const confirmAction = async () => {
      try {
        await deleteAdminUser(targetUser._id);
        showNotification('User Removed', `${targetUser.name} has been removed.`);
        loadAllData();
      } catch (error) {
        showNotification('Error', error.response?.data?.message || 'Could not delete user');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete user "${targetUser.name}"? This action is irreversible.`)) {
        confirmAction();
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to delete "${targetUser.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmAction },
        ]
      );
    }
  };

  const handleDeleteProduce = (item) => {
    const confirmAction = async () => {
      try {
        await deleteAdminProduce(item._id);
        showNotification('Listing Removed', `"${item.cropName}" has been removed.`);
        loadAllData();
      } catch (error) {
        showNotification('Error', error.response?.data?.message || 'Could not delete listing');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove produce listing "${item.cropName}"?`)) {
        confirmAction();
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        `Remove "${item.cropName}" listing from marketplace?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: confirmAction },
        ]
      );
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    const matchesSearch =
      !orderSearch.trim() ||
      o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.deliveryAddress?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.buyerId?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.otpCode?.includes(orderSearch);
    return matchesFilter && matchesSearch;
  });

  // Filtered Produce
  const filteredProduce = produceList.filter((p) => {
    return (
      !produceSearch.trim() ||
      p.cropName?.toLowerCase().includes(produceSearch.toLowerCase()) ||
      p.location?.toLowerCase().includes(produceSearch.toLowerCase()) ||
      p.farmer?.toLowerCase().includes(produceSearch.toLowerCase())
    );
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const matchesSearch =
      !userSearch.trim() ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch) ||
      u.location?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Admin Control Center...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#15803D', '#166534']}
            style={styles.logoBadge}
          >
            <MaterialCommunityIcons name="shield-crown" size={24} color="#FDE047" />
          </LinearGradient>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.headerTitle}>AgriMarket Admin</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>SYSTEM LIVE</Text>
              </View>
            </View>
            <Text style={styles.adminName}>
              Logged in: {user?.name || 'Administrator'} ({user?.email})
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="reload" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
          >
            <MaterialCommunityIcons
              name="view-dashboard"
              size={18}
              color={activeTab === 'overview' ? '#FFF' : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              System Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons
              name="receipt"
              size={17}
              color={activeTab === 'orders' ? '#FFF' : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'produce' && styles.tabBtnActive]}
            onPress={() => setActiveTab('produce')}
          >
            <MaterialCommunityIcons
              name="sprout"
              size={18}
              color={activeTab === 'produce' ? '#FFF' : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'produce' && styles.tabTextActive]}>
              Produce ({produceList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons
              name="people"
              size={17}
              color={activeTab === 'users' ? '#FFF' : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              Users Directory ({usersList.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Body */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Top Stat Cards Grid */}
            <View style={styles.statsGrid}>
              {/* Stat 1: Revenue */}
              <View style={[styles.statCard, { borderLeftColor: COLORS.primary, borderLeftWidth: 4 }]}>
                <View style={styles.statIconBox}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.statLabel}>Total Platform Revenue</Text>
                <Text style={styles.statValue}>
                  LKR {Number(metrics?.summary?.totalRevenue || 0).toLocaleString()}
                </Text>
                <Text style={styles.statSub}>Gross marketplace transactions</Text>
              </View>

              {/* Stat 2: Orders */}
              <View style={[styles.statCard, { borderLeftColor: COLORS.blue, borderLeftWidth: 4 }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="receipt-outline" size={24} color={COLORS.blue} />
                </View>
                <Text style={styles.statLabel}>Total Orders Placed</Text>
                <Text style={styles.statValue}>{metrics?.summary?.totalOrders || 0}</Text>
                <Text style={styles.statSub}>
                  {metrics?.statusBreakdown?.Delivered || 0} Delivered / Completed
                </Text>
              </View>

              {/* Stat 3: Produce Listings */}
              <View style={[styles.statCard, { borderLeftColor: COLORS.amber, borderLeftWidth: 4 }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="basket" size={24} color={COLORS.amber} />
                </View>
                <Text style={styles.statLabel}>Active Produce Listings</Text>
                <Text style={styles.statValue}>{metrics?.summary?.totalProduce || 0}</Text>
                <Text style={styles.statSub}>
                  {Number(metrics?.summary?.totalStockKg || 0).toLocaleString()} kg total inventory
                </Text>
              </View>

              {/* Stat 4: Total Users */}
              <View style={[styles.statCard, { borderLeftColor: COLORS.purple, borderLeftWidth: 4 }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="people-outline" size={24} color={COLORS.purple} />
                </View>
                <Text style={styles.statLabel}>Total Registered Users</Text>
                <Text style={styles.statValue}>{metrics?.summary?.totalUsers || 0}</Text>
                <Text style={styles.statSub}>
                  {metrics?.summary?.totalFarmers || 0} Farmers • {metrics?.summary?.totalBuyers || 0} Buyers
                </Text>
              </View>
            </View>

            {/* Order Progress Status Distribution */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons name="pie-chart" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Order Fulfillment Pipeline</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveTab('orders')}>
                  <Text style={styles.linkText}>View all orders →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pipelineRow}>
                {Object.entries(metrics?.statusBreakdown || {}).map(([st, cnt]) => {
                  const conf = STATUS_COLORS[st] || { bg: '#F3F4F6', text: '#374151', icon: 'ellipse' };
                  return (
                    <View key={st} style={[styles.pipelineCard, { backgroundColor: conf.bg }]}>
                      <Ionicons name={conf.icon} size={18} color={conf.text} />
                      <Text style={[styles.pipelineCount, { color: conf.text }]}>{cnt}</Text>
                      <Text style={[styles.pipelineLabel, { color: conf.text }]}>{st}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Split Grid: Recent Orders & Recent Users */}
            <View style={styles.splitGrid}>
              {/* Recent Orders Box */}
              <View style={styles.halfCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitleSmall}>Latest Orders</Text>
                  <TouchableOpacity onPress={() => setActiveTab('orders')}>
                    <Text style={styles.linkText}>See all</Text>
                  </TouchableOpacity>
                </View>

                {metrics?.recentOrders?.length === 0 ? (
                  <Text style={styles.emptyNote}>No orders recorded yet.</Text>
                ) : (
                  metrics?.recentOrders?.map((ord) => (
                    <View key={ord._id} style={styles.miniListRow}>
                      <View style={styles.miniListLeft}>
                        <Text style={styles.miniTitle}>{ord.orderNumber}</Text>
                        <Text style={styles.miniSubtitle}>
                          {ord.buyerId?.name || 'Customer'} • LKR {ord.totalAmount}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.miniBadge,
                          { backgroundColor: STATUS_COLORS[ord.status]?.bg || '#E5E7EB' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniBadgeText,
                            { color: STATUS_COLORS[ord.status]?.text || '#374151' },
                          ]}
                        >
                          {ord.status}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Recent Users Box */}
              <View style={styles.halfCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitleSmall}>New Registrations</Text>
                  <TouchableOpacity onPress={() => setActiveTab('users')}>
                    <Text style={styles.linkText}>See all</Text>
                  </TouchableOpacity>
                </View>

                {metrics?.recentUsers?.length === 0 ? (
                  <Text style={styles.emptyNote}>No users registered yet.</Text>
                ) : (
                  metrics?.recentUsers?.map((usr) => (
                    <View key={usr._id} style={styles.miniListRow}>
                      <View style={styles.miniListLeft}>
                        <Text style={styles.miniTitle}>{usr.name}</Text>
                        <Text style={styles.miniSubtitle}>
                          {usr.location || 'Sri Lanka'} • {usr.phone}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.miniBadge,
                          {
                            backgroundColor:
                              usr.role === 'Farmer'
                                ? COLORS.tagGreen
                                : usr.role === 'Admin'
                                ? COLORS.tagAmber
                                : COLORS.tagBlue,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniBadgeText,
                            {
                              color:
                                usr.role === 'Farmer'
                                  ? COLORS.tagGreenText
                                  : usr.role === 'Admin'
                                  ? COLORS.tagAmberText
                                  : COLORS.tagBlueText,
                            },
                          ]}
                        >
                          {usr.role}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            {/* Search and Filters */}
            <View style={styles.searchFilterCard}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search order #, address, buyer, OTP..."
                  value={orderSearch}
                  onChangeText={setOrderSearch}
                  placeholderTextColor="#9CA3AF"
                />
                {orderSearch ? (
                  <TouchableOpacity onPress={() => setOrderSearch('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPills}>
                {['All', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.pill, orderFilter === st && styles.pillActive]}
                    onPress={() => setOrderFilter(st)}
                  >
                    <Text style={[styles.pillText, orderFilter === st && styles.pillTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No matching orders found</Text>
                <Text style={styles.emptySub}>Try adjusting your search query or status filter.</Text>
              </View>
            ) : (
              filteredOrders.map((ord) => {
                const conf = STATUS_COLORS[ord.status] || { bg: '#F3F4F6', text: '#374151' };
                return (
                  <View key={ord._id} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View>
                        <Text style={styles.orderNum}>{ord.orderNumber}</Text>
                        <Text style={styles.orderDate}>
                          {new Date(ord.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: conf.text }]}>{ord.status}</Text>
                      </View>
                    </View>

                    {/* Customer & Address Details */}
                    <View style={styles.orderDetailsBox}>
                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.detailText}>
                          Buyer: <Text style={styles.detailBold}>{ord.buyerId?.name || 'Customer'}</Text> (
                          {ord.buyerId?.phone || ord.buyerId?.email || 'No contact info'})
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.detailText}>Delivery to: {ord.deliveryAddress}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="key-outline" size={16} color={COLORS.amber} />
                        <Text style={styles.detailText}>
                          Delivery OTP: <Text style={styles.otpPill}>{ord.otpCode || 'N/A'}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Order Items */}
                    <View style={styles.orderItemsSection}>
                      <Text style={styles.orderItemsLabel}>Ordered Produce Items:</Text>
                      {ord.items?.map((it, idx) => (
                        <View key={idx} style={styles.itemLine}>
                          <Text style={styles.itemLineName}>
                            • {it.productName || it.name} ({it.quantity} {it.unit || 'kg'})
                          </Text>
                          <Text style={styles.itemLinePrice}>
                            LKR {(it.quantity * (it.pricePerKg || it.unitPrice || 0)).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Footer with Total and Action */}
                    <View style={styles.orderCardFooter}>
                      <View>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>LKR {Number(ord.totalAmount).toLocaleString()}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.changeStatusBtn}
                        onPress={() => {
                          setSelectedOrder(ord);
                          setStatusModalVisible(true);
                        }}
                      >
                        <Ionicons name="create-outline" size={16} color="#FFF" />
                        <Text style={styles.changeStatusBtnText}>Update Status</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 3: PRODUCE LISTINGS */}
        {activeTab === 'produce' && (
          <View style={styles.tabContent}>
            <View style={styles.searchFilterCard}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search produce name, farmer, or location..."
                  value={produceSearch}
                  onChangeText={setProduceSearch}
                  placeholderTextColor="#9CA3AF"
                />
                {produceSearch ? (
                  <TouchableOpacity onPress={() => setProduceSearch('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {filteredProduce.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="sprout" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No produce listings found</Text>
                <Text style={styles.emptySub}>No farmer produce matches your criteria.</Text>
              </View>
            ) : (
              <View style={styles.produceGrid}>
                {filteredProduce.map((item) => (
                  <View key={item._id} style={styles.produceCard}>
                    <Image
                      source={{ uri: item.photoUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' }}
                      style={styles.produceImage}
                      resizeMode="cover"
                    />
                    <View style={styles.produceDetails}>
                      <View style={styles.produceTitleRow}>
                        <Text style={styles.produceTitle}>{item.cropName}</Text>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>{item.category || 'Produce'}</Text>
                        </View>
                      </View>

                      <Text style={styles.produceFarmer}>Farmer: {item.farmer || item.farmerId?.name || 'Local Farmer'}</Text>
                      <Text style={styles.produceLocation}>
                        <Ionicons name="location-outline" size={13} color={COLORS.textMuted} /> {item.location || 'Sri Lanka'}
                      </Text>

                      <View style={styles.producePriceRow}>
                        <Text style={styles.producePrice}>LKR {item.sellingPricePerKg} / kg</Text>
                        <Text style={styles.produceStock}>Stock: {item.quantityKg} kg</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteProduceBtn}
                        onPress={() => handleDeleteProduce(item)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        <Text style={styles.deleteProduceBtnText}>Remove Listing</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 4: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <View style={styles.tabContent}>
            <View style={styles.searchFilterCard}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search user name, email, phone, location..."
                  value={userSearch}
                  onChangeText={setUserSearch}
                  placeholderTextColor="#9CA3AF"
                />
                {userSearch ? (
                  <TouchableOpacity onPress={() => setUserSearch('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPills}>
                {['All', 'Farmer', 'Buyer', 'Admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.pill, userRoleFilter === role && styles.pillActive]}
                    onPress={() => setUserRoleFilter(role)}
                  >
                    <Text style={[styles.pillText, userRoleFilter === role && styles.pillTextActive]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {filteredUsers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptySub}>No user accounts match your search filter.</Text>
              </View>
            ) : (
              filteredUsers.map((usr) => (
                <View key={usr._id} style={styles.userCard}>
                  <View style={styles.userCardLeft}>
                    <View
                      style={[
                        styles.userAvatar,
                        {
                          backgroundColor:
                            usr.role === 'Farmer'
                              ? COLORS.tagGreen
                              : usr.role === 'Admin'
                              ? COLORS.tagAmber
                              : COLORS.tagBlue,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.userAvatarText,
                          {
                            color:
                              usr.role === 'Farmer'
                                ? COLORS.tagGreenText
                                : usr.role === 'Admin'
                                ? COLORS.tagAmberText
                                : COLORS.tagBlueText,
                          },
                        ]}
                      >
                        {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{usr.name}</Text>
                        <View
                          style={[
                            styles.userRoleBadge,
                            {
                              backgroundColor:
                                usr.role === 'Farmer'
                                  ? COLORS.tagGreen
                                  : usr.role === 'Admin'
                                  ? COLORS.tagAmber
                                  : COLORS.tagBlue,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.userRoleBadgeText,
                              {
                                color:
                                  usr.role === 'Farmer'
                                    ? COLORS.tagGreenText
                                    : usr.role === 'Admin'
                                    ? COLORS.tagAmberText
                                    : COLORS.tagBlueText,
                              },
                            ]}
                          >
                            {usr.role}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.userEmail}>{usr.email}</Text>
                      <Text style={styles.userPhone}>
                        <Ionicons name="call-outline" size={13} color={COLORS.textMuted} /> {usr.phone} •{' '}
                        <Ionicons name="location-outline" size={13} color={COLORS.textMuted} /> {usr.location}
                      </Text>

                      {usr.farmName ? (
                        <Text style={styles.userFarmName}>Farm: {usr.farmName}</Text>
                      ) : null}

                      <Text style={styles.userDate}>
                        Joined:{' '}
                        {new Date(usr.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  {usr.role !== 'Admin' && (
                    <TouchableOpacity
                      style={styles.deleteUserBtn}
                      onPress={() => handleDeleteUser(usr)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <Text style={styles.modalSubtitle}>
                Order: <Text style={styles.modalBold}>{selectedOrder.orderNumber}</Text> • Current:{' '}
                <Text style={styles.modalBold}>{selectedOrder.status}</Text>
              </Text>
            )}

            <View style={styles.modalOptions}>
              {['Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => {
                const isSelected = selectedOrder?.status === st;
                const conf = STATUS_COLORS[st] || { text: '#111' };
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.modalOptionBtn, isSelected && styles.modalOptionBtnActive]}
                    disabled={isUpdatingStatus}
                    onPress={() => handleUpdateOrderStatus(st)}
                  >
                    <Ionicons name={conf.icon || 'ellipse'} size={18} color={conf.text} />
                    <Text style={[styles.modalOptionText, { color: conf.text }]}>{st}</Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {isUpdatingStatus && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 12 }} />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14532D',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  adminName: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshBtn: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 4,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mainScrollView: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 4,
  },
  statSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionTitleSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pipelineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pipelineCard: {
    flex: 1,
    minWidth: 95,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  pipelineCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  pipelineLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  splitGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 16,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  miniListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  miniListLeft: {
    flex: 1,
    marginRight: 10,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  miniSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingVertical: 16,
    textAlign: 'center',
  },
  searchFilterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  pillActive: {
    backgroundColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  orderDetailsBox: {
    backgroundColor: '#F8FAF8',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textDark,
    flex: 1,
  },
  detailBold: {
    fontWeight: '700',
  },
  otpPill: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  orderItemsSection: {
    paddingTop: 4,
    gap: 4,
  },
  orderItemsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemLineName: {
    fontSize: 13,
    color: COLORS.textDark,
    flex: 1,
  },
  itemLinePrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
  },
  changeStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  changeStatusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  produceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  produceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    minWidth: 260,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  produceImage: {
    width: '100%',
    height: 140,
  },
  produceDetails: {
    padding: 14,
    gap: 6,
  },
  produceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  produceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
  },
  categoryPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  produceFarmer: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  produceLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  producePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  producePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  produceStock: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  deleteProduceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 6,
    marginTop: 6,
  },
  deleteProduceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  userRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userRoleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textDark,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userFarmName: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  userDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  deleteUserBtn: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 16,
  },
  modalBold: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalOptions: {
    gap: 10,
  },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  modalOptionBtnActive: {
    backgroundColor: '#F0FDF4',
    borderColor: COLORS.primary,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});
