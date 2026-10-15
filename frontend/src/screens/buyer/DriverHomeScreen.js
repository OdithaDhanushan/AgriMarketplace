import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DRIVER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
const DEFAULT_PRODUCE_IMG = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';

export default function DriverHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'READY', 'IN_TRANSIT', 'COMPLETED'
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/orders/driver-jobs');
      if (Array.isArray(res.data)) {
        setJobs(res.data);
      }
    } catch (err) {
      // Fallback fallback sample jobs if backend unreachable
      if (jobs.length === 0) {
        setJobs([
          {
            _id: 'sample-1',
            orderNumber: '#SK1024',
            items: [
              {
                productName: 'Fresh Tomatoes',
                quantity: 10,
                unit: 'kg',
                image: DEFAULT_PRODUCE_IMG,
              },
            ],
            totalAmount: 2450,
            deliveryFee: 650,
            deliveryAddress: 'Green Leaf Restaurant, Kurunegala',
            status: 'Confirmed',
            otpCode: '4827',
          },
          {
            _id: 'sample-2',
            orderNumber: '#SK1025',
            items: [
              {
                productName: 'Organic Carrots',
                quantity: 15,
                unit: 'kg',
                image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
              },
            ],
            totalAmount: 3600,
            deliveryFee: 750,
            deliveryAddress: 'Colombo Central Market, Pettah',
            status: 'Pending',
            otpCode: '8192',
          },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-poll real data every 3 seconds
    const interval = setInterval(() => {
      fetchJobs(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs(true);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Do you wish to log out of the Driver Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (logout) logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          });
        },
      },
    ]);
  };

  const getFilteredJobs = () => {
    if (selectedFilter === 'READY') {
      return jobs.filter((j) => j.status === 'Confirmed' || j.status === 'Pending');
    }
    if (selectedFilter === 'IN_TRANSIT') {
      return jobs.filter((j) => j.status === 'Picked up' || j.status === 'Out for delivery');
    }
    if (selectedFilter === 'COMPLETED') {
      return jobs.filter((j) => j.status === 'Delivered');
    }
    return jobs;
  };

  const filteredJobs = getFilteredJobs();
  const readyCount = jobs.filter((j) => j.status === 'Confirmed' || j.status === 'Pending').length;
  const transitCount = jobs.filter((j) => j.status === 'Picked up' || j.status === 'Out for delivery').length;
  const deliveredCount = jobs.filter((j) => j.status === 'Delivered').length;

  const handleOpenOrder = (job) => {
    if (job.status === 'Picked up') {
      navigation.navigate('Pickup', { order: job });
    } else if (job.status === 'Out for delivery') {
      navigation.navigate('Navigation', { order: job });
    } else if (job.status === 'Delivered') {
      Alert.alert('Order Completed', `Order ${job.orderNumber || job.id} has already been verified and delivered.`);
    } else {
      navigation.navigate('DeliveryJob', { order: job });
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Floating Glass Header (iPhone 17 style) */}
        <View style={styles.glassHeaderShell}>
          <View style={styles.glassHeader}>
            <View style={styles.driverProfileRow}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: DRIVER_AVATAR }} style={styles.driverAvatar} />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.driverCopy}>
                <Text style={styles.driverGreeting}>Good day,</Text>
                <Text numberOfLines={1} style={styles.driverName}>
                  {user?.name || 'Nimal Perera'}
                </Text>
              </View>
            </View>

            {/* Status Pill & Logout Button */}
            <View style={styles.headerRightRow}>
              <View style={styles.statusPill}>
                <View style={styles.pulsingDot} />
                <Text style={styles.statusPillText}>On Duty</Text>
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.glassLogoutBtn}
                activeOpacity={0.7}
                accessibilityLabel="Sign out"
              >
                <Ionicons name="log-out-outline" size={17} color="#B71C1C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2E7D32"
              colors={['#2E7D32']}
            />
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Live Stats Glass Dashboard */}
            <View style={styles.statsCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.85)', 'rgba(245, 244, 240, 0.65)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statsCardGradient}
              >
                <View style={styles.statsRow}>
                  <View style={styles.statCapsule}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="bicycle" size={18} color="#2E7D32" />
                    </View>
                    <Text style={styles.statValue}>{readyCount + transitCount}</Text>
                    <Text style={styles.statLabel}>Active Jobs</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCapsule}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#FFF3E0' }]}>
                      <Ionicons name="cash-outline" size={18} color="#E65100" />
                    </View>
                    <Text style={styles.statValue}>Rs. 3,850</Text>
                    <Text style={styles.statLabel}>Earnings</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCapsule}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#EDE7F6' }]}>
                      <Ionicons name="star" size={17} color="#F57F17" />
                    </View>
                    <Text style={styles.statValue}>4.8</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                </View>

                {/* Sub banner */}
                <View style={styles.vehicleInfoBanner}>
                  <Ionicons name="shield-checkmark" size={14} color="#2E7D32" />
                  <Text style={styles.vehicleInfoText}>
                    Motorbike • WP AB-4827 • Kurunegala Depot
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Filter Pills (Frosted Glass) */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionHeading}>Delivery Dispatch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  onPress={() => setSelectedFilter('ALL')}
                  style={[styles.filterChip, selectedFilter === 'ALL' && styles.filterChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, selectedFilter === 'ALL' && styles.filterChipTextActive]}>
                    All ({jobs.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedFilter('READY')}
                  style={[styles.filterChip, selectedFilter === 'READY' && styles.filterChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, selectedFilter === 'READY' && styles.filterChipTextActive]}>
                    Ready ({readyCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedFilter('IN_TRANSIT')}
                  style={[styles.filterChip, selectedFilter === 'IN_TRANSIT' && styles.filterChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, selectedFilter === 'IN_TRANSIT' && styles.filterChipTextActive]}>
                    In Transit ({transitCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedFilter('COMPLETED')}
                  style={[styles.filterChip, selectedFilter === 'COMPLETED' && styles.filterChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, selectedFilter === 'COMPLETED' && styles.filterChipTextActive]}>
                    Delivered ({deliveredCount})
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Orders Feed */}
            {loading && jobs.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Fetching live delivery dispatch...</Text>
              </View>
            ) : filteredJobs.length === 0 ? (
              <View style={styles.emptyGlassCard}>
                <Ionicons name="sparkles" size={32} color="#78909C" />
                <Text style={styles.emptyTitle}>No Orders In This Category</Text>
                <Text style={styles.emptySubtitle}>
                  New orders confirmed by buyers will automatically pop up here in real time.
                </Text>
              </View>
            ) : (
              filteredJobs.map((item) => {
                const orderKey = item._id || item.id || item.orderNumber;
                const orderNumber = item.orderNumber || (item.id ? `#${item.id}` : '#SK1024');
                const firstProduct = item.items?.[0] || {};
                const productName = firstProduct.productName || firstProduct.name || item.itemName || 'Fresh Produce';
                const quantity = firstProduct.quantity || item.quantity || 10;
                const unit = firstProduct.unit || item.unit || 'kg';
                const productImg = firstProduct.image || DEFAULT_PRODUCE_IMG;
                const fee = item.deliveryFee || 650;
                const isDelivered = item.status === 'Delivered';
                const isTransit = item.status === 'Picked up' || item.status === 'Out for delivery';

                return (
                  <View key={orderKey} style={styles.orderGlassCard}>
                    {/* Top Row: Order ID & Status Glass Tag */}
                    <View style={styles.orderHeaderRow}>
                      <View style={styles.orderIdBadge}>
                        <Ionicons name="receipt-outline" size={14} color="#1B5E20" />
                        <Text style={styles.orderIdBadgeText}>{orderNumber}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusTag,
                          isDelivered
                            ? styles.statusTagDelivered
                            : isTransit
                            ? styles.statusTagTransit
                            : styles.statusTagReady,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            isDelivered
                              ? styles.statusTagTextDelivered
                              : isTransit
                              ? styles.statusTagTextTransit
                              : styles.statusTagTextReady,
                          ]}
                        >
                          {item.status || 'Confirmed'}
                        </Text>
                      </View>
                    </View>

                    {/* Produce Information Row */}
                    <View style={styles.produceRow}>
                      <Image source={{ uri: productImg }} style={styles.produceThumb} />
                      <View style={styles.produceCopy}>
                        <Text style={styles.produceTitle}>{productName}</Text>
                        <Text style={styles.produceSub}>
                          {quantity} {unit} • Total: Rs. {Number(item.totalAmount || item.total || 2450).toLocaleString()}
                        </Text>
                        <View style={styles.feeRow}>
                          <Ionicons name="wallet-outline" size={13} color="#2E7D32" />
                          <Text style={styles.feeText}>Delivery Fee: Rs. {fee}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Route Preview (Pickup ➔ Dropoff) */}
                    <View style={styles.routeBox}>
                      <View style={styles.routeItem}>
                        <Ionicons name="radio-button-on" size={14} color="#43A047" />
                        <Text numberOfLines={1} style={styles.routeText}>
                          {"Sunil's Farm (Dambadeniya Depot)"}
                        </Text>
                      </View>
                      <View style={styles.routeConnector} />
                      <View style={styles.routeItem}>
                        <Ionicons name="location-sharp" size={14} color="#E53935" />
                        <Text numberOfLines={1} style={styles.routeText}>
                          {item.deliveryAddress || 'Green Leaf Restaurant, Kurunegala'}
                        </Text>
                      </View>
                    </View>

                    {/* Action Glass Button */}
                    <TouchableOpacity
                      onPress={() => handleOpenOrder(item)}
                      style={[
                        styles.actionGlassBtn,
                        isDelivered && styles.actionGlassBtnDone,
                      ]}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          isDelivered
                            ? ['rgba(129, 199, 132, 0.4)', 'rgba(76, 175, 80, 0.45)']
                            : ['#2E7D32', '#1B5E20']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.actionGradient}
                      >
                        <Text style={[styles.actionBtnText, isDelivered && styles.actionBtnTextDone]}>
                          {isDelivered
                            ? 'Completed ✓'
                            : item.status === 'Picked up'
                            ? 'Continue Pickup Photo ➔'
                            : item.status === 'Out for delivery'
                            ? 'Resume Navigation ➔'
                            : 'Accept & Start Delivery ➔'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDECEB', // Requested #EDECEB primary color
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 44 : 8,
  },
  glassHeaderShell: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  glassHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#1A2E1C',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  driverProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#D7D6D4',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverCopy: {
    flex: 1,
  },
  driverGreeting: {
    fontSize: 12,
    color: '#607264',
    fontWeight: '500',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(232, 245, 233, 0.9)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2E7D32',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B5E20',
  },
  glassLogoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 235, 238, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 205, 210, 0.9)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  statsCard: {
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  statsCardGradient: {
    padding: 16,
    borderRadius: 24,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCapsule: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  statLabel: {
    fontSize: 11,
    color: '#607264',
    fontWeight: '600',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  vehicleInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    backgroundColor: 'rgba(232, 245, 233, 0.65)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  vehicleInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  filterSection: {
    marginTop: 22,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2E1C',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#455A64',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#607264',
    fontWeight: '600',
  },
  emptyGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#607264',
    textAlign: 'center',
    lineHeight: 18,
  },
  orderGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  orderIdBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B5E20',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTagReady: {
    backgroundColor: 'rgba(255, 243, 224, 0.9)',
    borderColor: '#FFE0B2',
  },
  statusTagTransit: {
    backgroundColor: 'rgba(227, 242, 253, 0.9)',
    borderColor: '#BBDEFB',
  },
  statusTagDelivered: {
    backgroundColor: 'rgba(232, 245, 233, 0.9)',
    borderColor: '#C8E6C9',
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTagTextReady: {
    color: '#E65100',
  },
  statusTagTextTransit: {
    color: '#1565C0',
  },
  statusTagTextDelivered: {
    color: '#2E7D32',
  },
  produceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  produceThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#E0EAE0',
  },
  produceCopy: {
    flex: 1,
  },
  produceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  produceSub: {
    fontSize: 13,
    color: '#546E7A',
    marginTop: 2,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  feeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  routeBox: {
    backgroundColor: 'rgba(240, 242, 238, 0.75)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 12,
    color: '#37474F',
    fontWeight: '600',
    flex: 1,
  },
  routeConnector: {
    width: 1.5,
    height: 10,
    backgroundColor: '#B0BEC5',
    marginLeft: 6,
    marginVertical: 2,
  },
  actionGlassBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  actionGlassBtnDone: {
    shadowOpacity: 0.05,
  },
  actionGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actionBtnTextDone: {
    color: '#1B5E20',
  },
});
