import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { setAuthToken } from '../../services/api';

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#F5F7F5',
  dark: '#1A1A1A',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  tagBg: '#EAF5EB',
  danger: '#D32F2F',
};

export default function ProfileScreen({ navigation, route }) {
  const { user, updateUser, logout } = useAuth();
  const initialUser = route?.params?.user || user;

  // Buyer profile state
  const [name, setName] = useState(initialUser.name || 'Café Fresh Restaurant');
  const [email, setEmail] = useState(initialUser.email || 'procurement@cafefresh.lk');
  const [phone, setPhone] = useState(initialUser.phone || '+94 77 987 6543');
  const [address, setAddress] = useState(
    initialUser.address || initialUser.location || 'No. 45, Green Path, Colombo 07',
  );
  const [businessType] = useState('Restaurant / Hotel');

  // Preferences toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsUpdatesEnabled, setSmsUpdatesEnabled] = useState(true);

  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const [editAddress, setEditAddress] = useState(address);

  const handleOpenEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);
    setEditAddress(address);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const normalizedEmail = editEmail.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    const updatedProfile = {
      name: editName.trim(),
      email: normalizedEmail,
      phone: editPhone.trim(),
      address: editAddress.trim(),
    };
    updateUser(updatedProfile);
    setName(editName.trim());
    setEmail(normalizedEmail);
    setPhone(editPhone.trim());
    setAddress(editAddress.trim());
    setIsEditModalVisible(false);
    Alert.alert('Profile Updated', `Your login email is set to: ${normalizedEmail}`);
  };

  const performLogout = () => {
    logout();
    setAuthToken(null);
    const rootNav = navigation.getParent() || navigation;
    if (rootNav?.reset) {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } else {
      rootNav?.navigate('LoginScreen');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out?')) {
        performLogout();
      }
      return;
    }

    Alert.alert('Log Out', 'Are you sure you want to log out of AgriDirect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Buyer Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account & delivery settings</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          onPress={handleOpenEdit}
          style={styles.editHeaderBtn}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.green} />
          <Text style={styles.editHeaderBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="storefront" size={32} color={COLORS.white} />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName} numberOfLines={1}>{name}</Text>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.green} />
                <Text style={styles.badgeText}>Verified Buyer</Text>
              </View>
            </View>
            <Text style={styles.profileRole}>{businessType}</Text>
            <Text style={styles.profileSub} numberOfLines={1}>{email}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.green} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="heart-outline" size={20} color={COLORS.green} />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Saved Farms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="location-outline" size={20} color={COLORS.green} />
            <Text style={styles.statNumber}>Colombo 07</Text>
            <Text style={styles.statLabel}>Main Hub</Text>
          </View>
        </View>

        {/* Contact & Delivery Details */}
        <Text style={styles.sectionHeading}>CONTACT & DELIVERY</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="call-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
          </View>
          <View style={styles.lineDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
              <Text style={styles.infoHint}>
                Order verification OTP codes will be sent to this email address.
              </Text>
            </View>
          </View>
          <View style={styles.lineDivider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="location-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Default Delivery Address</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </View>
          </View>
        </View>

        {/* Quick Shortcuts */}
        <Text style={styles.sectionHeading}>SHORTCUTS</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation?.navigate('Orders')}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.green} />
            </View>
            <Text style={styles.menuText}>My Orders & Invoices</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>

          <View style={styles.lineDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation?.navigate('MyFarmers')}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="people-outline" size={20} color={COLORS.green} />
            </View>
            <Text style={styles.menuText}>Partner Farmers</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>

          <View style={styles.lineDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation?.navigate('My Cart')}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="cart-outline" size={20} color={COLORS.green} />
            </View>
            <Text style={styles.menuText}>My Active Cart</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* Notification Preferences */}
        <Text style={styles.sectionHeading}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchTitle}>Order Push Notifications</Text>
              <Text style={styles.switchDesc}>Status alerts when orders are accepted or dispatched</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D0D6D1', true: '#A5D6A7' }}
              thumbColor={notificationsEnabled ? COLORS.green : '#F5F5F5'}
            />
          </View>
          <View style={styles.lineDivider} />
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchTitle}>SMS Delivery OTP</Text>
              <Text style={styles.switchDesc}>Receive verification code via SMS to your phone</Text>
            </View>
            <Switch
              value={smsUpdatesEnabled}
              onValueChange={setSmsUpdatesEnabled}
              trackColor={{ false: '#D0D6D1', true: '#A5D6A7' }}
              thumbColor={smsUpdatesEnabled ? COLORS.green : '#F5F5F5'}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Buyer Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Business / Buyer Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g. Café Fresh"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  placeholder="+94 77 ..."
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@domain.lk"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Delivery Address</Text>
                <TextInput
                  style={[styles.fieldInput, styles.fieldInputMultiline]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  multiline
                  numberOfLines={2}
                  placeholder="Street, City, Postal Code"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headerTitle: { color: COLORS.dark, fontSize: 22, fontWeight: '800' },
  headerSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#EAF5EB',
  },
  editHeaderBtnText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  profileName: { color: COLORS.dark, fontSize: 17, fontWeight: '800' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF5EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  profileRole: { color: COLORS.muted, fontSize: 13, marginTop: 3, fontWeight: '600' },
  profileSub: { color: COLORS.muted, fontSize: 12, marginTop: 1 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.line },
  statNumber: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '500' },

  // Section heading
  sectionHeading: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Info card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { color: COLORS.muted, fontSize: 11 },
  infoValue: { color: COLORS.dark, fontSize: 14, fontWeight: '600', marginTop: 2 },
  infoHint: { color: COLORS.green, fontSize: 11, marginTop: 4, fontWeight: '500' },
  lineDivider: { height: 1, backgroundColor: COLORS.line },

  // Menu Card
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, color: COLORS.dark, fontSize: 14, fontWeight: '600' },

  // Switches
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 10,
  },
  switchContent: { flex: 1 },
  switchTitle: { color: COLORS.dark, fontSize: 14, fontWeight: '600' },
  switchDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2, lineHeight: 16 },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  modalTitle: { color: COLORS.dark, fontSize: 18, fontWeight: '800' },
  modalBody: { padding: 18, gap: 14 },
  formField: { gap: 6 },
  fieldLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  fieldInput: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.dark,
    backgroundColor: '#FBFDFB',
  },
  fieldInputMultiline: { minHeight: 64, textAlignVertical: 'top' },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
  },
  modalCancelBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: 'center',
  },
  modalSaveBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});
