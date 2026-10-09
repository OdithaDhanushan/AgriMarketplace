import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DEFAULT_ORDER = {
  id: 'SK1024',
  itemName: 'Fresh Produce',
  quantity: 20,
  unit: 'kg',
  total: 6200,
  paymentMethod: 'Cash on Delivery',
};

export default function OtpVerificationScreen({ route, navigation }) {
  const { addOrder, clearCart } = useCart();
  const { user } = useAuth();
  const order = { ...DEFAULT_ORDER, ...(route?.params?.order || {}) };
  const targetEmail = (order.userEmail || order.email || user?.email || 'sahan@gmail.com').trim().toLowerCase();

  // OTP starts empty
  const [code, setCode] = useState(['', '', '', '']);
  const [validationError, setValidationError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [statusNotice, setStatusNotice] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const inputs = useRef([]);

  // Send OTP to user's login email
  const requestOtp = useCallback(async () => {
    try {
      setIsSendingOtp(true);
      setValidationError('');
      setStatusNotice(`Sending verification code to ${targetEmail}...`);

      const res = await api.post('/orders/send-otp', {
        email: targetEmail,
        orderNumber: order.id,
      });

      if (res.data?.success) {
        setStatusNotice(`Verification code sent to ${targetEmail}`);
        if (res.data?.debugOtp) {
          setDebugOtp(res.data.debugOtp);
        }
        setResendCooldown(30);
      } else {
        setStatusNotice('Could not send OTP. Please try again.');
      }
    } catch (err) {
      console.log('Error requesting OTP:', err?.message);
      setStatusNotice('Failed to connect to email server. Please try resending.');
    } finally {
      setIsSendingOtp(false);
    }
  }, [targetEmail, order.id]);

  // Request OTP automatically on component mount
  useEffect(() => {
    requestOtp();
  }, [requestOtp]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const updateDigit = (value, index) => {
    setValidationError('');
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setCode((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item))
    );
    if (digit && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const confirmCode = async () => {
    setHasSubmitted(true);
    const enteredOtp = code.join('').trim();

    // ── Validation: OTP is required & must have 4 digits ──
    if (!enteredOtp || enteredOtp.length < 4 || code.some((digit) => !digit)) {
      const emptyIndex = code.findIndex((digit) => !digit);
      if (emptyIndex !== -1) {
        inputs.current[emptyIndex]?.focus();
      }
      const errorMsg = `කරුණාකර ඔබගේ Email ලිපිනයට (${targetEmail}) ලැබුණු 4-digit OTP අංකය ඇතුළත් කරන්න.`;
      setValidationError(errorMsg);
      Alert.alert(
        'OTP Required (කේතය ඇතුළත් කරන්න)',
        `කරුණාකර ඔබගේ Email (${targetEmail}) වෙත ලැබුණු 4-digit OTP අංකය ඇතුළත් කරන්න.\n\nPlease enter the 4-digit OTP sent to your email to confirm the order.`
      );
      return;
    }

    // ── Verify with Backend ──
    try {
      setIsVerifying(true);
      setValidationError('');

      const res = await api.post('/orders/verify-otp', {
        email: targetEmail,
        otpCode: enteredOtp,
      });

      if (res.data?.success) {
        // Confirmed successfully
        const confirmedOrder = {
          ...order,
          otpCode: enteredOtp,
          userEmail: targetEmail,
          status: 'Confirmed',
        };

        await addOrder(confirmedOrder);
        clearCart();

        navigation.navigate('OrderConfirmed', { order: confirmedOrder });
      } else {
        const invalidMsg = 'ඔබ ඇතුළත් කළ OTP අංකය වැරදියි. කරුණාකර ඔබගේ Email පරීක්ෂා කර නැවත උත්සාහ කරන්න.';
        setValidationError(invalidMsg);
        Alert.alert('Invalid OTP', invalidMsg);
      }
    } catch (err) {
      const errResponseMsg = err?.response?.data?.message || 'Invalid or expired OTP. Please check your email.';
      setValidationError(errResponseMsg);
      Alert.alert('Verification Failed', errResponseMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={23} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Verification</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Icon Circle */}
        <View style={styles.productIconCircle}>
          <Ionicons name="shield-checkmark" size={44} color={COLORS.white} />
        </View>

        <Text style={styles.addOtpTitle}>Verify Your Order</Text>
        <Text style={styles.addOtpSubtitle}>
          We sent a 4-digit verification code (OTP) to your account email.
        </Text>

        {/* Email Address Pill */}
        <View style={styles.emailPill}>
          <Ionicons name="mail" size={16} color={COLORS.green} />
          <Text style={styles.emailPillText}>{targetEmail}</Text>
        </View>

        {/* Status Notice */}
        {statusNotice ? (
          <View style={styles.statusBox}>
            {isSendingOtp ? (
              <ActivityIndicator size="small" color={COLORS.green} />
            ) : (
              <Ionicons name="checkmark-circle" size={15} color={COLORS.green} />
            )}
            <Text style={styles.statusText}>{statusNotice}</Text>
          </View>
        ) : null}

        {/* Debug OTP Banner (development friendly) */}
        {debugOtp ? (
          <View style={styles.debugBanner}>
            <Ionicons name="key-outline" size={14} color="#B78103" />
            <Text style={styles.debugText}>OTP: <Text style={styles.debugCode}>{debugOtp}</Text> (or check email inbox)</Text>
          </View>
        ) : null}

        {/* Order Details Summary Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order Reference</Text>
            <Text style={styles.orderValue}>#{order.id}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>{order.itemName || 'Produce'}</Text>
            <Text style={styles.orderValue}>{order.quantity} {order.unit || 'kg'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {Number(order.total).toLocaleString()}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Payment Method</Text>
            <Text style={styles.orderValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Delivery Verification Code Input Box */}
        <View style={[styles.verificationBox, validationError ? styles.verificationBoxError : null]}>
          <View style={styles.verificationHeader}>
            <Ionicons name="lock-closed" size={15} color={COLORS.green} />
            <Text style={styles.verificationTitle}>ENTER 4-DIGIT OTP</Text>
          </View>

          <View style={styles.digitRow}>
            {code.map((digit, index) => {
              const hasError = hasSubmitted && !digit;
              return (
                <TextInput
                  key={`digit-${index}`}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  accessibilityLabel={`Verification digit ${index + 1}`}
                  value={digit}
                  onChangeText={(value) => updateDigit(value, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  style={[
                    styles.digitInput,
                    digit ? styles.digitInputFilled : null,
                    hasError || validationError ? styles.digitInputError : null,
                  ]}
                  placeholder="•"
                  placeholderTextColor="#B0BEC5"
                />
              );
            })}
          </View>

          {/* Validation Error Message */}
          {validationError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={17} color="#D32F2F" />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : (
            <Text style={styles.verificationHint}>
              Enter the code sent to your email to confirm the order
            </Text>
          )}

          {/* Resend OTP Button */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn't receive code? </Text>
            {resendCooldown > 0 ? (
              <Text style={styles.resendCooldown}>Resend in {resendCooldown}s</Text>
            ) : (
              <TouchableOpacity
                onPress={requestOtp}
                disabled={isSendingOtp}
                style={styles.resendBtn}
              >
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={confirmCode}
          disabled={isVerifying}
          style={[styles.confirmButton, isVerifying && styles.confirmButtonDisabled]}
          activeOpacity={0.85}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.confirmText}>Confirm Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#F5F7F5',
  dark: '#1A1A1A',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    height: 54,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30, alignItems: 'center' },
  productIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.green,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addOtpTitle: {
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  addOtpSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF5EB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  emailPillText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F7F0',
  },
  statusText: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  debugBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  debugText: { color: '#8D6E63', fontSize: 12 },
  debugCode: { color: '#E65100', fontWeight: '800', letterSpacing: 2 },
  orderCard: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  orderLabel: { color: COLORS.muted, fontSize: 13 },
  orderValue: { color: COLORS.dark, fontSize: 13, fontWeight: '600' },
  divider: { borderTopWidth: 1, borderTopColor: COLORS.line, marginVertical: 4 },
  totalValue: { color: COLORS.green, fontSize: 16, fontWeight: '800' },
  verificationBox: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
  },
  verificationBoxError: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFFBFB',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    justifyContent: 'center',
  },
  verificationTitle: {
    color: COLORS.dark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  digitInput: {
    width: 60,
    height: 64,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: COLORS.line,
    backgroundColor: '#FAFAFA',
    color: COLORS.dark,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
  },
  digitInputFilled: {
    borderColor: COLORS.green,
    backgroundColor: '#F5FAF5',
    color: COLORS.green,
  },
  digitInputError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  verificationHint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  resendPrompt: { color: COLORS.muted, fontSize: 13 },
  resendCooldown: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  resendBtn: { paddingVertical: 2 },
  resendText: { color: COLORS.green, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  confirmButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.65,
  },
  confirmText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});