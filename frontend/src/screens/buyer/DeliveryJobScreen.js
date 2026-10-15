import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TOMATO_IMG = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';

export default function DeliveryJobScreen({ route, navigation }) {
  const { user, logout } = useAuth();
  const [activeJob, setActiveJob] = useState(route?.params?.order || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDriverJobs = async () => {
      try {
        const res = await api.get('/orders/driver-jobs');
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          // If active job not set or route params absent, use the first pending delivery order
          if (!route?.params?.order) {
            setActiveJob(res.data[0]);
          }
        }
      } catch (err) {
        // Fallback to demo order
      }
    };
    fetchDriverJobs();
    const interval = setInterval(fetchDriverJobs, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [route?.params?.order]);

  const order = activeJob || route?.params?.order || {
    id: 'SK1024',
    orderNumber: '#SK1024',
    itemName: 'Fresh Tomatoes',
    quantity: 10,
    unit: 'kg',
    total: 2450,
  };

  const orderId = order.orderNumber || (order.id ? (String(order.id).startsWith('#') ? order.id : `#${order.id}`) : '#SK1024');
  const itemName = order.itemName || (order.items?.[0]?.productName) || (order.items?.[0]?.name) || 'Fresh Tomatoes';
  const quantity = order.quantity || (order.items?.[0]?.quantity) || 10;
  const unit = order.unit || (order.items?.[0]?.unit) || 'kg';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Do you want to log out of the Driver Portal?', [
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

  const handleReject = () => {
    Alert.alert('Delivery Job', 'Job declined. Checking next dispatch job.', [
      { text: 'OK' }
    ]);
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const orderKey = order._id || order.id || order.orderNumber || 'SK1024';
      await api.patch(`/orders/${orderKey}/accept-job`);
    } catch (err) {
      // Continue even if network error
    } finally {
      setLoading(false);
      navigation.navigate('Pickup', { order });
    }
  };

  return (
    <View style={styles.container}>
      {/* Frosted Glass Header */}
      <View style={styles.gradientHeader}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('DriverHome')}
              style={styles.backButton}
              accessibilityLabel="Back to Driver Home"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color="#1E3821" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Delivery Job</Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              accessibilityLabel="Driver Logout"
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={17} color="#C62828" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* "New Delivery" Badge */}
        <View style={styles.badgeWrap}>
          <View style={styles.newDeliveryBadge}>
            <Text style={styles.newDeliveryText}>New Delivery Available</Text>
          </View>
        </View>

        {/* Produce Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: TOMATO_IMG }} style={styles.productThumb} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{itemName}</Text>
            <Text style={styles.productQty}>{quantity} {unit}</Text>
            <Text style={styles.orderIdText}>Order {orderId}</Text>
          </View>
        </View>

        {/* Pickup & Delivery Location Card */}
        <View style={styles.routeCard}>
          {/* Pickup */}
          <View style={styles.routePoint}>
            <View style={styles.pinIconCircle}>
              <Ionicons name="location-sharp" size={18} color="#607D8B" />
            </View>
            <View style={styles.routeDetails}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.locationName}>{"Sunil's Farm"}</Text>
              <Text style={styles.locationCity}>Dambadeniya</Text>
            </View>
          </View>

          {/* Vertical Connecting Line */}
          <View style={styles.routeLineWrap}>
            <View style={styles.routeLine} />
          </View>

          {/* Delivery */}
          <View style={styles.routePoint}>
            <View style={styles.pinIconCircle}>
              <Ionicons name="location-sharp" size={18} color="#607D8B" />
            </View>
            <View style={styles.routeDetails}>
              <Text style={styles.routeLabel}>Delivery</Text>
              <Text style={styles.locationName}>Green Leaf Restaurant</Text>
              <Text style={styles.locationCity}>Kurunegala</Text>
            </View>
          </View>
        </View>

        {/* Distance & Delivery Fee Summary */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Distance</Text>
          <Text style={styles.metaValue}>8.4 km</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Delivery Fee</Text>
          <Text style={styles.metaValue}>Rs. 650</Text>
        </View>

        {/* Bottom Reject & Accept Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity onPress={handleReject} style={styles.rejectBtn} activeOpacity={0.8}>
            <Text style={styles.rejectBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAccept} disabled={loading} style={styles.acceptBtn} activeOpacity={0.85}>
            <Text style={styles.btnText}>{loading ? 'Accepting...' : 'Accept Delivery ➔'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDECEB',
  },
  gradientHeader: {
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  safeArea: {
    paddingTop: Platform.OS === 'web' ? 44 : 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  driverInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  driverInfoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3821',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B2E1E',
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(254, 242, 242, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  badgeWrap: {
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  newDeliveryBadge: {
    backgroundColor: '#D7EEFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  newDeliveryText: {
    color: '#1565C0',
    fontSize: 14,
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  productThumb: {
    width: 90,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#E0EAE0',
  },
  productInfo: {
    marginLeft: 16,
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  productQty: {
    fontSize: 14,
    color: '#455A64',
    marginTop: 2,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 4,
  },
  routeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pinIconCircle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeDetails: {
    marginLeft: 10,
  },
  routeLabel: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '600',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
    marginTop: 2,
  },
  locationCity: {
    fontSize: 14,
    color: '#455A64',
    marginTop: 1,
  },
  routeLineWrap: {
    paddingLeft: 13,
    height: 38,
    justifyContent: 'center',
  },
  routeLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#78909C',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  metaLabel: {
    fontSize: 16,
    color: '#1A2E1C',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 235, 238, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 154, 154, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: '#C62828',
    fontSize: 15,
    fontWeight: '800',
  },
  acceptBtn: {
    flex: 1.4,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
