import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const PAYMENT_OPTIONS = ['Direct Bank Transfer', 'Cash on Pickup / Delivery', 'Mobile Wallet'];

export default function FarmerProfileScreen({ navigation }) {
  // Farmer Profile States (Persona 1: Sunil, 52)
  const [farmName, setFarmName] = useState("Sunil's Organic Farm");
  const [location, setLocation] = useState('Kurunegala District');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [paymentMode, setPaymentMode] = useState('Direct Bank Transfer');

  // Modals & Interactive Toggles
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // Interactive Settings Toggles
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);

  // Temporary Form States for Editing
  const [tempFarmName, setTempFarmName] = useState(farmName);
  const [tempLocation, setTempLocation] = useState(location);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempPayment, setTempPayment] = useState(paymentMode);

  const handleOpenEdit = () => {
    setTempFarmName(farmName);
    setTempLocation(location);
    setTempPhone(phone);
    setTempPayment(paymentMode);
    setEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    setFarmName(tempFarmName);
    setLocation(tempLocation);
    setPhone(tempPhone);
    setPaymentMode(tempPayment);
    setEditModalVisible(false);
    Alert.alert('Success', 'Farm profile updated successfully!');
  };

  // Call Cooperative Support
  const handleCallCooperative = () => {
    Linking.openURL('tel:+94771234567').catch(() =>
      Alert.alert('Cooperative Hotline', 'Calling Mr. Fernando (+94 77 123 4567)...')
    );
  };

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
          <Text style={styles.headerTitle}>Farmer Profile</Text>
          
          {/* Settings Button */}
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.8}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Farmer Avatar & Info Card */}
          <View style={styles.profileCard}>
            <Image
              source={require('../../assets/sunil.jpg')} // 👈 LOCAL ASSET
              style={styles.avatar}
            />
            <Text style={styles.farmerName}>Sunil Wickramasinghe</Text>
            <Text style={styles.farmerRole}>🌿 Smallholder Vegetable & Fruit Farmer (Primary Seller)</Text>

            {/* Component 4 Trust & Governance Badge */}
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#1b5e20" />
              <Text style={styles.trustText}>Verified by Kurunegala Agrarian Cooperative</Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#ffa000" />
              <Text style={styles.ratingText}>4.8 / 5.0 (28 Buyer Reviews)</Text>
            </View>
          </View>

          {/* 📊 Shortcut to Business Dashboard */}
          <TouchableOpacity
            style={styles.dashboardBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FarmerDashboard')}
          >
            <View style={styles.rowAlign}>
              <View style={styles.dashIconCircle}>
                <Ionicons name="stats-chart" size={22} color="#fff" />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.dashBannerTitle}>Farm Business Dashboard</Text>
                <Text style={styles.dashBannerSub}>View active listings, orders & monthly sales</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2e7d32" />
          </TouchableOpacity>

          {/* Farm Details Card */}
          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeading}>Farm & Contact Information</Text>
              <TouchableOpacity onPress={handleOpenEdit}>
                <Text style={styles.editText}>Edit All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="home-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Farm Name:</Text>
              <Text style={styles.infoVal}>{farmName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoVal}>{location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoVal}>{phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="bank-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>Payment:</Text>
              <Text style={styles.infoVal}>{paymentMode}</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#c62828" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Log out of account</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Unified Bottom Nav */}
        <BottomNavBar activeTab="Profile" navigation={navigation} />

        {/* Edit Profile Modal (Interactive Payment Selectors) */}
        {editModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              onPress={() => setEditModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Farm Information</Text>

              <Text style={styles.inputLabel}>Farm Name:</Text>
              <TextInput style={styles.input} value={tempFarmName} onChangeText={setTempFarmName} />

              <Text style={styles.inputLabel}>Location / District:</Text>
              <TextInput style={styles.input} value={tempLocation} onChangeText={setTempLocation} />

              <Text style={styles.inputLabel}>Phone Number:</Text>
              <TextInput style={styles.input} keyboardType="phone-pad" value={tempPhone} onChangeText={setTempPhone} />

              {/* Interactive Payment Method Selector */}
              <Text style={styles.inputLabel}>Preferred Payment Mode:</Text>
              <View style={styles.paymentSelectorRow}>
                {PAYMENT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.paymentChip, tempPayment === opt && styles.paymentChipActive]}
                    onPress={() => setTempPayment(opt)}
                  >
                    <Text style={[styles.paymentChipText, tempPayment === opt && styles.paymentChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings Modal (⚙️ Interactive Toggles & Call) */}
        {settingsModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              onPress={() => setSettingsModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.modalTitle}>App Settings</Text>
                <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                  <Ionicons name="close-circle" size={26} color="#333" />
                </TouchableOpacity>
              </View>

              {/* SMS Alert Toggle */}
              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.8}
                onPress={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingName}>SMS Order Alerts</Text>
                  <Text style={styles.settingSub}>Get notified when buyers request crops</Text>
                </View>
                <Text style={[styles.settingBadge, smsAlertsEnabled ? styles.badgeEnabled : styles.badgeDisabled]}>
                  {smsAlertsEnabled ? 'ENABLED' : 'DISABLED'}
                </Text>
              </TouchableOpacity>

              {/* Offline Sync Toggle */}
              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.8}
                onPress={() => setOfflineSyncEnabled(!offlineSyncEnabled)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingName}>Offline Draft Sync</Text>
                  <Text style={styles.settingSub}>Auto-sync listings when back online</Text>
                </View>
                <Text style={[styles.settingBadge, offlineSyncEnabled ? styles.badgeEnabled : styles.badgeDisabled]}>
                  {offlineSyncEnabled ? 'ACTIVE' : 'PAUSED'}
                </Text>
              </TouchableOpacity>

              {/* Call Cooperative Officer */}
              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.8}
                onPress={handleCallCooperative}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingName}>Cooperative Support Hotline</Text>
                  <Text style={styles.settingSub}>Kurunegala Agrarian Officer (Mr. Fernando)</Text>
                </View>
                <Text style={styles.settingCall}>📞 CALL</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>IT3060 HCI Project • Farmer Module v1.0</Text>
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
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eef2f0',
  },
  avatar: { width: 84, height: 84, borderRadius: 42, marginBottom: 12, borderWidth: 3, borderColor: '#c8e6c9' },
  farmerName: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  farmerRole: { fontSize: 11, color: '#666', marginTop: 2, marginBottom: 10, textAlign: 'center' },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  trustText: { fontSize: 11, fontWeight: 'bold', color: '#1b5e20', marginLeft: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#555', marginLeft: 4 },
  dashboardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#81c784',
    elevation: 2,
  },
  dashIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20' },
  dashBannerSub: { fontSize: 11, color: '#388e3c', marginTop: 2 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eef2f0',
    elevation: 2,
  },
  sectionHeading: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  editText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 13, color: '#666', marginLeft: 10, width: 90 },
  infoVal: { fontSize: 13, fontWeight: 'bold', color: '#222', marginLeft: 'auto', textAlign: 'right', flex: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    marginBottom: 10,
  },
  logoutText: { color: '#c62828', fontSize: 14, fontWeight: 'bold' },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', zIndex: 999999 },
  backdropDismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32, elevation: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#222' },
  inputLabel: { fontSize: 13, color: '#555', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, color: '#222', backgroundColor: '#f9f9f9' },
  
  // Interactive Payment Selector Chips
  paymentSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  paymentChip: { backgroundColor: '#f1f1f1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  paymentChipActive: { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
  paymentChipText: { fontSize: 12, fontWeight: '600', color: '#555' },
  paymentChipTextActive: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32' },

  saveBtn: { backgroundColor: '#2e7d32', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: '#777', fontSize: 14 },
  
  // Settings items
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  settingName: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  settingSub: { fontSize: 11, color: '#777', marginTop: 2 },
  settingBadge: { fontSize: 11, fontWeight: 'bold', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  badgeEnabled: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  badgeDisabled: { backgroundColor: '#ffebee', color: '#c62828' },
  settingCall: { fontSize: 12, fontWeight: 'bold', color: '#1976d2', backgroundColor: '#e3f2fd', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  versionText: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 18 },
});