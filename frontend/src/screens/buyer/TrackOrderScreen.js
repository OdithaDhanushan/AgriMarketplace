import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
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
import SriLankaMapView from '../../components/SriLankaMapView';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const TOMATO_IMG = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';
const DRIVER_IMG = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';

export default function TrackOrderScreen({ route, navigation }) {
  const { strings, isSinhala } = useLanguage();
  const order = route?.params?.order || {
    id: 'SK1024',
    itemName: 'Fresh tomatos',
    quantity: 10,
    unit: 'kg',
    total: 2450,
    otpCode: '4827',
  };

  const orderId = order.id ? (String(order.id).startsWith('#') ? order.id : `#${order.id}`) : '#SK1024';
  const itemName = order.itemName || (order.items?.[0]?.name) || 'Fresh tomatos';
  const quantity = order.quantity || (order.items?.[0]?.quantity) || 10;
  const unit = order.unit || (order.items?.[0]?.unit) || 'kg';
  const verificationCode = order.otpCode || '4827';

  const [driverName, setDriverName] = useState(order.driverName || 'Nimal Perera');
  const [driverPhone, setDriverPhone] = useState(order.driverPhone || '+94 77 123 4567');

  // Live stage: 1: Order Placed, 2: Farmer Confirmed / Picked up, 3: Out for delivery, 4: Delivered
  const [currentStage, setCurrentStage] = useState(
    order.status === 'Delivered' ? 4 : (order.status === 'Out for delivery' ? 3 : (order.status === 'Picked up' ? 2 : 1))
  );

  // Auto-poll backend in real time every 3 seconds so status and map update automatically
  useEffect(() => {
    let isMounted = true;
    const fetchLiveStatus = async () => {
      try {
        const orderKey = order._id || order.id || order.orderNumber;
        if (!orderKey) return;
        const res = await api.get(`/orders/${orderKey}/live-status`);
        if (isMounted && res.data?.status) {
          const s = res.data.status;
          if (s === 'Delivered') setCurrentStage(4);
          else if (s === 'Out for delivery') setCurrentStage(3);
          else if (s === 'Picked up' || s === 'Confirmed') setCurrentStage(2);
          else setCurrentStage(1);

          if (res.data.driverName) setDriverName(res.data.driverName);
          if (res.data.driverPhone) setDriverPhone(res.data.driverPhone);
        }
      } catch (e) {
        // Quiet fallback
      }
    };

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order]);

  const handleCall = () => {
    Linking.openURL(`tel:${driverPhone}`).catch(() => {
      Alert.alert('Call Delivery Partner', `Calling ${driverName} (${driverPhone})...`);
    });
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${driverPhone}?body=Hello ${driverName}, regarding my order ${orderId}`).catch(() => {
      Alert.alert('Message Partner', `Send SMS to ${driverName} (${driverPhone})`);
    });
  };

  return (
    <View style={styles.container}>
      {/* Frosted Glass Header */}
      <View style={styles.gradientHeader}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#1E3821" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{strings.trackingTitle}</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Real Sri Lankan Map fetched from Google Maps */}
        <View style={styles.routeIllustrationCard}>
          <SriLankaMapView height={185} showControls={true} />
        </View>

        {/* Customer Delivery Verification Code (Shown exclusively to Buyer) */}
        <View style={styles.verificationCodeCard}>
          <View style={styles.codeHeaderRow}>
            <Ionicons name="key" size={16} color="#2E7D32" />
            <Text style={styles.codeHeaderTitle}>{strings.deliveryOtpTitle}</Text>
          </View>
          <Text style={styles.codeDigitsBig}>
            {verificationCode.split('').join(' ')}
          </Text>
          <Text style={styles.codeHintText}>
            🔒 {strings.deliveryOtpDesc}
          </Text>
        </View>

        {/* Delivery Completed Celebration Banner if stage === 4 */}
        {currentStage === 4 && (
          <View style={styles.deliveredCard}>
            <Ionicons name="checkmark-circle" size={26} color="#2E7D32" />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveredCardTitle}>{strings.deliverySuccessTitle}</Text>
              <Text style={styles.deliveredCardSub}>{strings.deliverySuccessSub}</Text>
            </View>
          </View>
        )}

        {/* Delivery Partner Card */}
        <View style={styles.driverCard}>
          <Image source={{ uri: DRIVER_IMG }} style={styles.driverAvatar} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.driverRole}>{strings.driverDetails} • Motorbike (WP AB-4827)</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FBC02D" />
              <Text style={styles.ratingText}>4.7 (128 reviews)</Text>
            </View>
          </View>

          {/* Call & Message Action Buttons */}
          <View style={styles.driverActions}>
            <TouchableOpacity onPress={handleCall} style={styles.actionCircleBtn} accessibilityLabel="Call driver">
              <Ionicons name="call" size={16} color="#1E3821" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMessage} style={styles.actionCircleBtn} accessibilityLabel="Message driver">
              <Ionicons name="chatbubble" size={16} color="#1E3821" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Real-time Order Status Stepper */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineHeading}>{strings.orderStatus}</Text>

          {/* Step 1: Order Placed */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorCol}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, currentStage >= 2 ? styles.stepLineActive : styles.stepLineInactive]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{strings.orderConfirmed}</Text>
              <Text style={styles.stepTime}>{isSinhala ? "පද්ධතිය මඟින් තහවුරු විය" : "கணினி மூலம் உறுதி செய்யப்பட்டது"}</Text>
            </View>
          </View>

          {/* Step 2: Farmer Confirmed / Picked up */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorCol}>
              <View style={[styles.stepDot, currentStage >= 2 ? styles.stepDotDone : styles.stepDotPending]}>
                {currentStage >= 2 ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : <View style={styles.stepInnerDot} />}
              </View>
              <View style={[styles.stepLine, currentStage >= 3 ? styles.stepLineActive : styles.stepLineInactive]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, currentStage >= 2 && styles.stepTitleActive]}>
                {strings.preparing}
              </Text>
              <Text style={styles.stepTime}>{isSinhala ? "ගොවිපොළෙන් සූදානම් කරමින්" : "பண்ணையில் இருந்து பேக்கிங்"}</Text>
            </View>
          </View>

          {/* Step 3: Out for delivery */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorCol}>
              <View style={[styles.stepDot, currentStage >= 3 ? styles.stepDotDone : styles.stepDotPending]}>
                {currentStage >= 3 ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : <View style={styles.stepInnerDot} />}
              </View>
              <View style={[styles.stepLine, currentStage >= 4 ? styles.stepLineActive : styles.stepLineInactive]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, currentStage >= 3 && styles.stepTitleActive]}>
                {strings.outForDelivery}
              </Text>
              <Text style={styles.stepTime}>
                {currentStage >= 3 ? (isSinhala ? "මාර්ගයේ පැමිණෙමින් • විනාඩි 20" : "வருகிறது • 20 நிமிடம்") : (isSinhala ? "රියදුරු වෙත භාරදීමට නියමිතයි" : "எடுக்க காத்திருக்கிறது")}
              </Text>
            </View>
          </View>

          {/* Step 4: Delivered */}
          <View style={styles.stepRow}>
            <View style={styles.stepIndicatorCol}>
              <View style={[styles.stepDot, currentStage >= 4 ? styles.stepDotDone : styles.stepDotPending]}>
                {currentStage >= 4 ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : <View style={styles.stepInnerDot} />}
              </View>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, currentStage >= 4 && styles.stepTitleActive]}>
                {strings.delivered}
              </Text>
              <Text style={styles.stepTime}>
                {currentStage >= 4 ? (isSinhala ? "OTP කේතය මඟින් තහවුරු විය" : "OTP குறியீட்டுடன் முடிந்தது") : (isSinhala ? "ළඟාවීමට නියමිතයි" : "வருகை நிலுவையில் உள்ளது")}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Produce Thumbnail Card */}
        <View style={styles.productSummaryCard}>
          <Image source={{ uri: TOMATO_IMG }} style={styles.productThumb} />
          <View style={styles.productSummaryInfo}>
            <Text style={styles.productSummaryTitle}>{itemName}</Text>
            <Text style={styles.productSummaryQty}>{quantity} {unit}</Text>
            <Text style={styles.productSummaryOrder}>Order {orderId}</Text>
          </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  safeArea: {
    paddingTop: Platform.OS === 'web' ? 44 : 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B2E1E',
    letterSpacing: -0.3,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  routeIllustrationCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  verificationCodeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  codeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  codeDigitsBig: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#1B5E20',
    marginVertical: 4,
  },
  codeHintText: {
    fontSize: 12,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 16,
  },
  deliveredCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  deliveredCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B5E20',
  },
  deliveredCardSub: {
    fontSize: 12,
    color: '#455A64',
    marginTop: 1,
  },
  driverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
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
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0EAE0',
  },
  driverInfo: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2E1C',
  },
  driverRole: {
    fontSize: 12,
    color: '#455A64',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    color: '#37474F',
    fontWeight: '600',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    padding: 18,
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
  timelineHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2E1C',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepIndicatorCol: {
    width: 24,
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#2E7D32',
  },
  stepDotPending: {
    backgroundColor: '#ECEFF1',
    borderWidth: 1.5,
    borderColor: '#B0BEC5',
  },
  stepInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#90A4AE',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepLineActive: {
    backgroundColor: '#2E7D32',
  },
  stepLineInactive: {
    backgroundColor: '#E0E0E0',
  },
  stepContent: {
    marginLeft: 14,
    justifyContent: 'flex-start',
    paddingTop: 1,
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#263238',
  },
  stepTitleActive: {
    color: '#1B5E20',
  },
  stepTime: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
  },
  productSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E0EAE0',
  },
  productSummaryInfo: {
    marginLeft: 14,
    flex: 1,
  },
  productSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2E1C',
  },
  productSummaryQty: {
    fontSize: 13,
    color: '#455A64',
    marginTop: 2,
  },
  productSummaryOrder: {
    fontSize: 12,
    fontWeight: '700',
    color: '#263238',
    marginTop: 4,
  },
});
