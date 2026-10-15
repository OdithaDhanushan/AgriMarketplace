import React, { useState } from 'react';
import {
  Alert,
  Linking,
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

export default function OfflineNavigationScreen({ route, navigation }) {
  const order = route?.params?.order || {
    id: 'SK1024',
    itemName: 'Fresh Tomatoes',
    quantity: 10,
    unit: 'kg',
  };

  const [routeSaved, setRouteSaved] = useState(false);

  const handleStartNavigation = () => {
    navigation.navigate('CompleteDelivery', { order });
  };

  const handleSaveRoute = () => {
    setRouteSaved(true);
    Alert.alert('Offline Navigation', 'Route successfully saved to local device cache for offline navigation.');
  };

  const handleCallFarmer = () => {
    Linking.openURL('tel:+94772345678').catch(() => {
      Alert.alert('Call Farmer', 'Calling Sunil Perera (+94 77 234 5678)...');
    });
  };

  const handleSendSMS = () => {
    Linking.openURL('sms:+94772345678?body=Hello Sunil, I am delivering order ' + (order.id || '#SK1024')).catch(() => {
      Alert.alert('Send SMS', 'Sending SMS to Sunil Perera (+94 77 234 5678)');
    });
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
        {/* Red Low Network Banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertHeaderRow}>
            <Ionicons name="warning" size={20} color="#D32F2F" />
            <Text style={styles.alertTitle}>Low Network</Text>
          </View>
        </View>

        <Text style={styles.alertDescription}>
          Your connections is weak.{"\n"}Offline route is available.
        </Text>

        {/* Cached Offline Map Card */}
        <View style={styles.offlineMapCard}>
          <SriLankaMapView height={240} showControls={false} isOffline={true} />

          {/* Map Footer: Last updated & Save route */}
          <View style={styles.mapFooterRow}>
            <Text style={styles.lastUpdatedText}>Last updated : 2.42 PM</Text>
            <TouchableOpacity
              onPress={handleSaveRoute}
              style={[styles.saveRouteBtn, routeSaved && styles.saveRouteBtnDone]}
              activeOpacity={0.8}
            >
              <Text style={styles.saveRouteText}>
                {routeSaved ? 'Route saved ✓' : 'Save route'}
              </Text>
            </TouchableOpacity>
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

        {/* Call Farmer & Send SMS Green Buttons */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity onPress={handleCallFarmer} style={styles.farmerBtn}>
            <Text style={styles.btnText}>Call farmer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendSMS} style={styles.farmerBtn}>
            <Text style={styles.btnText}>Send SMS</Text>
          </TouchableOpacity>
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
  alertBanner: {
    backgroundColor: 'rgba(255, 205, 210, 0.8)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#EF9A9A',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '800',
  },
  alertDescription: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2E1C',
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  offlineMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2EBE2',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  mapFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 6,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#455A64',
    fontWeight: '600',
  },
  saveRouteBtn: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  saveRouteBtnDone: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  saveRouteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#263238',
  },
  startNavBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  farmerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
