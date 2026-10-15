import React from 'react';
import {
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

export default function NavigationScreen({ route, navigation }) {
  const order = route?.params?.order || {
    id: 'SK1024',
    itemName: 'Fresh Tomatoes',
    quantity: 10,
    unit: 'kg',
  };

  const handleStartNavigation = () => {
    navigation.navigate('CompleteDelivery', { order });
  };

  const handleContinueOffline = () => {
    navigation.navigate('OfflineNavigation', { order });
  };

  return (
    <View style={styles.container}>
      {/* Top Green Gradient Header */}
      <LinearGradient
        colors={['#43A047', '#7CB342', '#F4F7F4']}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color="#1E3821" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Navigation</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Real Sri Lankan Interactive Map */}
        <View style={styles.mapCard}>
          <SriLankaMapView height={310} showControls={true} isOffline={false} />

          {/* Floating ETA & Distance Card */}
          <View style={styles.etaCard}>
            <View style={styles.etaIconCircle}>
              <Ionicons name="navigate-outline" size={22} color="#1E3821" />
            </View>
            <View style={styles.etaDetails}>
              <Text style={styles.distanceText}>8.4 km</Text>
              <Text style={styles.etaText}>ETA : 22min</Text>
            </View>
          </View>
        </View>

        {/* Start Navigation Green Button */}
        <TouchableOpacity
          onPress={handleStartNavigation}
          style={styles.startNavBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Start navigation</Text>
        </TouchableOpacity>

        {/* Low Network Alert Pill */}
        <TouchableOpacity
          onPress={handleContinueOffline}
          style={styles.lowNetworkBadge}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={16} color="#D32F2F" />
          <Text style={styles.lowNetworkBadgeText}>LOW NETWORK</Text>
        </TouchableOpacity>

        {/* Continue Offline Green Button */}
        <TouchableOpacity
          onPress={handleContinueOffline}
          style={styles.offlineBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Continue offline</Text>
        </TouchableOpacity>
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
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  safeArea: {
    paddingTop: Platform.OS === 'web' ? 24 : 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  mapCard: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  etaCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  etaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaDetails: {
    marginLeft: 12,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  etaText: {
    fontSize: 13,
    color: '#546E7A',
    fontWeight: '600',
    marginTop: 1,
  },
  startNavBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  lowNetworkBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFCDD2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  lowNetworkBadgeText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offlineBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
