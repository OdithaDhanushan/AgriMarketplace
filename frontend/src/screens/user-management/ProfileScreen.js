import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGE_LABELS = {
  en: 'English',
  si: 'Sinhala',
  ta: 'Tamil',
};

export default function ProfileScreen({ route }) {
  const user = route?.params?.user ?? {};
  const details = [
    { label: 'Email', value: user.email, icon: 'email-outline' },
    { label: 'Phone', value: user.phone, icon: 'phone-outline' },
    { label: 'Role', value: user.role, icon: user.role === 'Farmer' ? 'sprout' : 'cart-outline' },
    { label: 'Language', value: LANGUAGE_LABELS[user.language] ?? user.language, icon: 'translate' },
    { label: 'Location', value: user.location, icon: 'map-marker-outline' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brand}>
          <MaterialCommunityIcons name="sprout" size={28} color="#318b4a" />
          <Text style={styles.brandName}>Fresh Vegi</Text>
        </View>

        <Text style={styles.title}>Profile</Text>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={38} color="#28743a" />
          </View>
          <Text style={styles.name}>{user.name || 'AgriMarketplace user'}</Text>
          <Text style={styles.roleBadge}>{user.role || 'Member'}</Text>
        </View>

        <View style={styles.details}>
          {details.map((detail) => (
            <View key={detail.label} style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <MaterialCommunityIcons name={detail.icon} size={21} color="#28743a" />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text selectable style={styles.detailValue}>{detail.value || 'Not provided'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EDECEB',
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 44 : 10,
  },
  scrollContent: {
    alignSelf: 'center',
    maxWidth: 440,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 4,
  },
  brandName: {
    color: '#1B5E20',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  title: {
    color: '#173e29',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  name: {
    color: '#183d29',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    borderRadius: 20,
    color: '#28743a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.25)',
  },
  details: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  detailRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 68,
    paddingVertical: 10,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  detailText: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    color: '#718076',
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    color: '#203b2a',
    fontSize: 14.5,
    fontWeight: '700',
    marginTop: 2,
  },
});