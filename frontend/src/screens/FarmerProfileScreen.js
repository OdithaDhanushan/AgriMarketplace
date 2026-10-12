import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useAuth } from '../context/AuthContext';
import { deleteCurrentUser, getCurrentUser, setAuthToken, updateUserProfile } from '../services/api';

const PAYMENT_OPTIONS = ['Direct Bank Transfer', 'Cash on Pickup / Delivery', 'Mobile Wallet'];

export default function FarmerProfileScreen({ navigation }) {
  const { user, token, login, logout, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    farmName: user?.farmName || '',
    paymentMode: user?.paymentMode || '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applyProfile = (nextUser) => {
    setProfile(nextUser);
    setForm({
      name: nextUser?.name || '',
      email: nextUser?.email || '',
      phone: nextUser?.phone || '',
      location: nextUser?.location || '',
      farmName: nextUser?.farmName || '',
      paymentMode: nextUser?.paymentMode || '',
    });
  };

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return;

      if (!token) {
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        return;
      }

      setAuthToken(token);
      try {
        const response = await getCurrentUser();
        applyProfile(response.user || response);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          setAuthToken(null);
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        } else {
          showMessage('Profile unavailable', error.response?.data?.message || 'Unable to load your profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, token, navigation, logout]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    if ([form.name, form.email, form.phone, form.location].some((value) => !value.trim())) {
      showMessage('Update failed', 'Please complete every profile field before saving.');
      return;
    }

    setSaving(true);
    try {
      const response = await updateUserProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        farmName: form.farmName.trim(),
        paymentMode: form.paymentMode,
      });
      const nextUser = response.user || response;
      applyProfile(nextUser);
      login({ user: nextUser, token });
      setEditMode(false);
      showMessage('Success', 'Your profile has been updated.');
    } catch (error) {
      showMessage('Update failed', error.response?.data?.message || 'Unable to save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteCurrentUser();
      logout();
      setAuthToken(null);
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
      showMessage('Account deleted', 'Your account was removed successfully.');
    } catch (error) {
      showMessage('Delete failed', error.response?.data?.message || 'Unable to delete your account right now.');
    }
  };

  const signOut = () => {
    logout();
    setAuthToken(null);
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const confirmDelete = () => {
    const message = 'This will permanently remove your account and profile data. This action cannot be undone.';
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete account?\n\n${message}`)) deleteAccount();
      return;
    }

    Alert.alert('Delete account', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteAccount },
    ]);
  };

  const cancelEdit = () => {
    applyProfile(profile);
    setEditMode(false);
  };

  const initials = (profile?.name || 'Farmer')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const renderField = (field, label, icon, keyboardType = 'default') => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={19} color="#327044" />
      <Text style={styles.label}>{label}</Text>
      {editMode ? (
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
          keyboardType={keyboardType}
          onChangeText={(value) => updateField(field, value)}
          style={styles.input}
          value={form[field]}
        />
      ) : (
        <Text style={styles.value}>{profile?.[field] || '—'}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#dff3d9', '#edf9e9', '#ffffff']} style={styles.gradient} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={22} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Farmer Profile</Text>
          <TouchableOpacity
            accessibilityLabel={editMode ? 'Cancel editing' : 'Edit profile'}
            onPress={editMode ? cancelEdit : () => setEditMode(true)}
            style={styles.headerButton}
          >
            <Ionicons name={editMode ? 'close-outline' : 'create-outline'} size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#1a7a3d" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.profileHero}>
              <View style={styles.avatarCircle}><Text style={styles.avatarText}>{initials || 'F'}</Text></View>
              <Text style={styles.nameText}>{profile?.name || 'Your Name'}</Text>
              <Text style={styles.roleText}>{profile?.role || 'Farmer'}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Account details</Text>
                {!editMode && (
                  <TouchableOpacity onPress={() => setEditMode(true)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              {renderField('name', 'Name', 'person-outline')}
              {renderField('email', 'Email', 'mail-outline', 'email-address')}
              {renderField('phone', 'Phone', 'call-outline', 'phone-pad')}
              {renderField('location', 'Location', 'location-outline')}
              {renderField('farmName', 'Farm', 'home-outline')}
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment</Text>
                {editMode ? (
                  <View style={styles.paymentOptions}>
                    {PAYMENT_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        accessibilityRole="button"
                        accessibilityState={{ selected: form.paymentMode === option }}
                        onPress={() => updateField('paymentMode', option)}
                        style={[styles.paymentOption, form.paymentMode === option && styles.paymentOptionSelected]}
                      >
                        <Text style={[styles.paymentOptionText, form.paymentMode === option && styles.paymentOptionTextSelected]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.value}>{profile?.paymentMode || 'Not set'}</Text>
                )}
              </View>

              {editMode && (
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={cancelEdit} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={saving} onPress={saveProfile} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save changes'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer tools</Text>
              <TouchableOpacity onPress={() => navigation.navigate('FarmerDashboard')} style={styles.dashboardButton}>
                <Ionicons name="stats-chart-outline" size={19} color="#1d4d2d" />
                <Text style={styles.dashboardText}>Open dashboard</Text>
                <Ionicons name="chevron-forward" size={18} color="#1d4d2d" />
              </TouchableOpacity>
              <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
                <Ionicons name="log-out-outline" size={18} color="#315b3b" />
                <Text style={styles.signOutText}>Sign out</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.deleteText}>Delete account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <BottomNavBar activeTab="Profile" navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f6ee' },
  gradient: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffffcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 21, fontWeight: '700', color: '#1c2a1c' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#2b4d35', fontSize: 15 },
  content: { padding: 18, paddingBottom: 30 },
  profileHero: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#1d7a3e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  nameText: { fontSize: 23, fontWeight: '700', color: '#1d2b1d' },
  roleText: { fontSize: 14, color: '#446250', marginTop: 6 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1e2d1f' },
  editText: { color: '#1d7a3e', fontWeight: '700' },
  infoRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2ee',
    paddingVertical: 8,
  },
  label: { width: 58, color: '#4b5d4d', fontSize: 13, fontWeight: '600' },
  value: { flex: 1, color: '#1f2d1f', fontSize: 14, fontWeight: '600', textAlign: 'right' },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#dfe9e2',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#1f2d1f',
    backgroundColor: '#fff',
  },
  paymentRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2ee',
  },
  paymentLabel: { color: '#4b5d4d', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  paymentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#dfe9e2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  paymentOptionSelected: { backgroundColor: '#e7f4e9', borderColor: '#1a7a3d' },
  paymentOptionText: { color: '#435b48', fontSize: 12 },
  paymentOptionTextSelected: { color: '#145d2d', fontWeight: '700' },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  primaryButton: { flex: 1, backgroundColor: '#1a7a3d', borderRadius: 10, padding: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#edf5ee', borderRadius: 10, padding: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#1d3f28', fontWeight: '700' },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f3faf4',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  dashboardText: { flex: 1, color: '#1d4d2d', fontWeight: '600' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#edf5ee',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  signOutText: { color: '#315b3b', fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#c9342b',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  deleteText: { color: '#fff', fontWeight: '700' },
});