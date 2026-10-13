import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
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
    profileImage: user?.profileImage || '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);

  const applyProfile = (nextUser) => {
    setProfile(nextUser);
    setForm({
      name: nextUser?.name || '',
      email: nextUser?.email || '',
      phone: nextUser?.phone || '',
      location: nextUser?.location || '',
      farmName: nextUser?.farmName || '',
      paymentMode: nextUser?.paymentMode || '',
      profileImage: nextUser?.profileImage || '',
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

  // Profile Picture Helpers
  const openPhotoPicker = () => {
    setPhotoModalVisible(true);
  };

  const handlePickFromGallery = async () => {
    setPhotoModalVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showMessage('Permission needed', 'Gallery permission is required to choose a profile photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        await handleApplyProfilePhoto(imageUri);
      }
    } catch (e) {
      showMessage('Photo error', e.message || 'Unable to select photo.');
    }
  };

  const handleTakePhoto = async () => {
    setPhotoModalVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showMessage('Permission needed', 'Camera permission is required to take a profile photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        await handleApplyProfilePhoto(imageUri);
      }
    } catch (e) {
      showMessage('Camera error', e.message || 'Unable to capture photo.');
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoModalVisible(false);
    await handleApplyProfilePhoto('');
  };

  const handleApplyProfilePhoto = async (imageUri) => {
    if (editMode) {
      updateField('profileImage', imageUri);
      return;
    }
    setSaving(true);
    try {
      const response = await updateUserProfile({ profileImage: imageUri });
      const nextUser = response.user || response;
      applyProfile(nextUser);
      login({ user: nextUser, token });
      showMessage('Success', imageUri ? 'Profile photo updated!' : 'Profile photo removed.');
    } catch (error) {
      showMessage('Update failed', error.response?.data?.message || 'Unable to update profile photo.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if ([form.name, form.email, form.phone, form.location].some((value) => !value.trim())) {
      showMessage('Update failed', 'Please complete every required profile field before saving.');
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
        profileImage: form.profileImage,
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
    const message = 'This permanently removes your account and its linked listings and orders. This cannot be undone.';
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete account?\n\n${message}`)) deleteAccount();
      return;
    }

    Alert.alert('Delete account', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteAccount },
    ]);
  };

  const handleCallCooperative = () => {
    Linking.openURL('tel:+94771234567').catch(() => {
      showMessage('Cooperative Support', 'Phone calling is unavailable on this device.');
    });
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

  const displayedPhoto = editMode
    ? (form.profileImage !== undefined ? form.profileImage : profile?.profileImage)
    : profile?.profileImage;

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
        <Text style={styles.value}>{profile?.[field] || 'Not set'}</Text>
      )}
    </View>
  );

  const renderSetting = (title, description, enabled, onToggle) => (
    <TouchableOpacity style={styles.settingItem} activeOpacity={0.8} onPress={onToggle}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingName}>{title}</Text>
        <Text style={styles.settingSub}>{description}</Text>
      </View>
      <Text style={[styles.settingBadge, enabled ? styles.badgeEnabled : styles.badgeDisabled]}>
        {enabled ? 'ENABLED' : 'DISABLED'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Header with Safe Area & Phone Camera Clearance */}
      <SafeAreaView style={styles.safeHeaderArea}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.circleBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Farmer Profile</Text>
          <TouchableOpacity
            accessibilityLabel="Profile settings"
            onPress={() => setSettingsVisible(true)}
            style={styles.circleBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color="#1f2937" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1a7a3d" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.body}>
            {/* Farmer Avatar with Click-to-upload */}
            <View style={styles.profileHero}>
              <TouchableOpacity
                onPress={openPhotoPicker}
                activeOpacity={0.85}
                style={styles.avatarTouchable}
                accessibilityLabel="Add or change profile picture"
              >
                <View style={styles.avatarCircle}>
                  {displayedPhoto ? (
                    <Image source={{ uri: displayedPhoto }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{initials || 'F'}</Text>
                  )}
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={13} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.nameText}>{profile?.name || 'Your Name'}</Text>
              <Text style={styles.roleText}>{profile?.role || 'Farmer'}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Farm & contact information</Text>
                {!editMode && (
                  <TouchableOpacity onPress={() => setEditMode(true)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Explicit Option in Edit Panel to Add/Change Profile Photo */}
              {editMode && (
                <TouchableOpacity
                  onPress={openPhotoPicker}
                  style={styles.editPhotoOption}
                  activeOpacity={0.8}
                >
                  <View style={styles.editPhotoLeft}>
                    <Ionicons name="camera-outline" size={20} color="#1d7a3e" />
                    <Text style={styles.editPhotoText}>
                      {displayedPhoto ? 'Change profile picture' : 'Add profile picture'}
                    </Text>
                  </View>
                  {displayedPhoto ? (
                    <TouchableOpacity
                      onPress={handleRemovePhoto}
                      style={styles.removePhotoBadge}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={15} color="#c62828" />
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#888" />
                  )}
                </TouchableOpacity>
              )}

              {renderField('name', 'Name', 'person-outline')}
              {renderField('email', 'Email', 'mail-outline', 'email-address')}
              {renderField('phone', 'Phone', 'call-outline', 'phone-pad')}
              {renderField('location', 'Location', 'location-outline')}
              {renderField('farmName', 'Farm', 'home-outline')}
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Preferred payment</Text>
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
          </View>
        </ScrollView>
      )}

      <BottomNavBar activeTab="Profile" navigation={navigation} />

      {/* Settings In-Screen Bottom Sheet */}
      {settingsVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            accessibilityLabel="Close settings"
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSettingsVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>App settings</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#333" />
              </TouchableOpacity>
            </View>
            {renderSetting('SMS Order Alerts', 'Status alerts when buyers request produce', smsAlertsEnabled, () => setSmsAlertsEnabled((value) => !value))}
            {renderSetting('Offline Draft Sync', 'Sync listing drafts when back online', offlineSyncEnabled, () => setOfflineSyncEnabled((value) => !value))}
            <TouchableOpacity style={styles.settingItem} onPress={handleCallCooperative}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingName}>Cooperative Support</Text>
                <Text style={styles.settingSub}>Call the cooperative hotline</Text>
              </View>
              <Ionicons name="call-outline" size={19} color="#1d7a3e" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* In-Screen Photo Picker Bottom Sheet */}
      {photoModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPhotoModalVisible(false)}
          />
          <View style={styles.photoSheetContent}>
            <View style={styles.photoSheetHeader}>
              <Text style={styles.photoSheetTitle}>Farmer Profile Photo</Text>
              <TouchableOpacity onPress={() => setPhotoModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#555" />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoSheetSub}>
              Take a photo or choose from your gallery to add your profile picture
            </Text>

            <TouchableOpacity style={styles.photoOption} onPress={handleTakePhoto} activeOpacity={0.8}>
              <View style={styles.photoOptionIcon}>
                <Ionicons name="camera" size={22} color="#1d7a3e" />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.photoOptionTitle}>Take Photo</Text>
                <Text style={styles.photoOptionSub}>Use camera to take a new picture</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoOption} onPress={handlePickFromGallery} activeOpacity={0.8}>
              <View style={styles.photoOptionIcon}>
                <Ionicons name="images" size={22} color="#1d7a3e" />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.photoOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.photoOptionSub}>Pick a photo from your device storage</Text>
              </View>
            </TouchableOpacity>

            {displayedPhoto ? (
              <TouchableOpacity style={styles.photoOption} onPress={handleRemovePhoto} activeOpacity={0.8}>
                <View style={[styles.photoOptionIcon, { backgroundColor: '#ffebee' }]}>
                  <Ionicons name="trash" size={22} color="#c62828" />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={[styles.photoOptionTitle, { color: '#c62828' }]}>Remove Photo</Text>
                  <Text style={styles.photoOptionSub}>Delete current profile photo</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.cancelPhotoBtn}
              onPress={() => setPhotoModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelPhotoText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f7', position: 'relative' },
  safeHeaderArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2ee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'web' ? 44 : 14,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1b4d27',
    textAlign: 'center',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f6f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2ece2',
  },
  scrollContent: { paddingBottom: 24 },
  loadingWrap: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#2b4d35', fontSize: 15 },
  body: { padding: 18, paddingTop: 16 },
  profileHero: { alignItems: 'center', marginBottom: 18 },
  avatarTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1d7a3e',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#dcecdb',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d7a3e',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  nameText: { fontSize: 23, fontWeight: '700', color: '#1d2b1d' },
  roleText: { fontSize: 14, color: '#446250', marginTop: 4 },
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

  // Edit Panel Profile Photo Row
  editPhotoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3faf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d2ead6',
  },
  editPhotoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editPhotoText: { fontSize: 14, fontWeight: '700', color: '#1d7a3e' },
  removePhotoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  removePhotoText: { color: '#c62828', fontSize: 12, fontWeight: '700' },

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
  paymentRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2ee' },
  paymentLabel: { color: '#4b5d4d', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  paymentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentOption: { borderWidth: 1, borderColor: '#dfe9e2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  paymentOptionSelected: { backgroundColor: '#e7f4e9', borderColor: '#1a7a3d' },
  paymentOptionText: { color: '#435b48', fontSize: 12 },
  paymentOptionTextSelected: { color: '#145d2d', fontWeight: '700' },
  actionRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  primaryButton: { flex: 1, backgroundColor: '#1a7a3d', borderRadius: 10, padding: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#edf5ee', borderRadius: 10, padding: 12, alignItems: 'center' },
  secondaryButtonText: { color: '#1d3f28', fontWeight: '700' },
  dashboardButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f3faf4', borderRadius: 10, padding: 14, marginTop: 12 },
  dashboardText: { flex: 1, color: '#1d4d2d', fontWeight: '600' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#edf5ee', borderRadius: 10, padding: 14, marginTop: 10 },
  signOutText: { color: '#315b3b', fontWeight: '700' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#c9342b', borderRadius: 10, padding: 14, marginTop: 12 },
  deleteText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: 28 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#edf2ee' },
  settingCopy: { flex: 1, paddingRight: 12 },
  settingName: { fontSize: 14, fontWeight: '700', color: '#1e2d1f' },
  settingSub: { fontSize: 11, color: '#66756a', marginTop: 3 },
  settingBadge: { fontSize: 10, fontWeight: '700', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8, overflow: 'hidden' },
  badgeEnabled: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
  badgeDisabled: { backgroundColor: '#ffebee', color: '#c62828' },

  // Photo Picker Modal Bottom Sheet Styles
  photoSheetContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: 32,
    elevation: 12,
  },
  photoSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoSheetTitle: { fontSize: 18, fontWeight: '800', color: '#1e2d1f' },
  photoSheetSub: { fontSize: 12, color: '#66756a', marginTop: 4, marginBottom: 16 },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f9f6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8efe8',
  },
  photoOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e7f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionTitle: { fontSize: 15, fontWeight: '700', color: '#1e2d1f' },
  photoOptionSub: { fontSize: 11, color: '#66756a', marginTop: 2 },
  cancelPhotoBtn: {
    backgroundColor: '#edf2ed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelPhotoText: { color: '#445b49', fontSize: 14, fontWeight: '700' },
});