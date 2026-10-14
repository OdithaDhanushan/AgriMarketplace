import React from 'react';
import {
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
    backgroundColor: '#f3f8f1',
    flex: 1,
  },
  scrollContent: {
    alignSelf: 'center',
    maxWidth: 480,
    padding: 22,
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 12,
  },
  brandName: {
    color: '#174b31',
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    color: '#173e29',
    fontSize: 27,
    fontWeight: '700',
    marginTop: 30,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#dcefd9',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  name: {
    color: '#183d29',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#e2f1df',
    borderRadius: 20,
    color: '#28743a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    overflow: 'hidden',
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  details: {
    backgroundColor: '#fff',
    borderColor: '#e1ebe0',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  detailRow: {
    alignItems: 'center',
    borderBottomColor: '#edf2ec',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 13,
    minHeight: 74,
    paddingVertical: 11,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: '#eff7ed',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  detailText: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    color: '#718076',
    fontSize: 12,
  },
  detailValue: {
    color: '#203b2a',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 3,
  },
});