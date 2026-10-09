import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  green: '#2E7D32',
  accent: '#4CAF50',
  background: '#F8F9FA',
  dark: '#212121',
  muted: '#68736B',
  line: '#E5EAE6',
  white: '#FFFFFF',
};

export default function ProfileScreen() {
  const { user, updateEmail, updateUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email);
  const [newName, setNewName] = useState(user.name);
  const [newPhone, setNewPhone] = useState(user.phone);

  const handleSave = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    updateUser({
      name: newName.trim() || user.name,
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || user.phone,
    });
    setModalVisible(false);
    Alert.alert('Profile Updated', `Your login email is set to: ${newEmail.trim().toLowerCase()}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color={COLORS.white} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.green} />
            <Text style={styles.badgeText}>Verified Buyer Account</Text>
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Login & Contact Details</Text>
            <TouchableOpacity onPress={() => {
              setNewEmail(user.email);
              setNewName(user.name);
              setNewPhone(user.phone);
              setModalVisible(true);
            }}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* Email Field with OTP Notice */}
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="mail-outline" size={18} color={COLORS.green} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Login Email (OTP Destination)</Text>
                <Text style={styles.rowVal}>{user.email}</Text>
                <Text style={styles.otpNotice}>
                  Order verification OTP codes will be sent to this email address.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Phone */}
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="call-outline" size={18} color={COLORS.green} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Phone Number</Text>
                <Text style={styles.rowVal}>{user.phone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Default Address */}
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="location-outline" size={18} color={COLORS.green} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Delivery Address</Text>
                <Text style={styles.rowVal}>{user.address || 'Colombo 07, Sri Lanka'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security & OTP Info Card */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.green} />
          <Text style={styles.infoText}>
            When confirming an order, a 4-digit One-Time Password (OTP) is automatically dispatched to your email for secure transaction verification.
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Account Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Your name"
            />

            <Text style={styles.inputLabel}>Login Email (where OTP arrives)</Text>
            <TextInput
              style={styles.modalInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="e.g. yourname@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="+94 7X XXX XXXX"
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 18, gap: 18 },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { color: COLORS.dark, fontSize: 20, fontWeight: '800' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    backgroundColor: '#EAF5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  section: { gap: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: { color: COLORS.dark, fontSize: 15, fontWeight: '800' },
  editBtnText: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowContent: { flex: 1 },
  rowLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 2 },
  rowVal: { color: COLORS.dark, fontSize: 15, fontWeight: '700' },
  otpNotice: { color: COLORS.green, fontSize: 11, marginTop: 4, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: 10 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EAF5EB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  infoText: { flex: 1, color: '#1B5E20', fontSize: 12, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.dark },
  inputLabel: { fontSize: 12, fontWeight: '700', color: COLORS.muted, marginBottom: 5, marginTop: 10 },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.dark,
  },
  saveBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
