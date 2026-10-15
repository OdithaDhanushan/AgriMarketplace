import React, { useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductAddedSuccess({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation) navigation.navigate('MarketPrices');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.circle}>
          <Ionicons name="checkmark" size={64} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Produce Listed!</Text>
        <Text style={styles.subTitle}>
          Your harvest is now live on the marketplace for buyers across Sri Lanka.
        </Text>

        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.8}
          onPress={() => navigation && navigation.navigate('MarketPrices')}
        >
          <Text style={styles.doneBtnText}>View Dashboard</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDECEB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 44 : 0,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  circle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B2E1E',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#5A6E5D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
    paddingHorizontal: 8,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});