import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNavBar({ activeTab = 'Explore', navigation }) {
  const { strings } = useLanguage();

  return (
    <View style={styles.bottomNav}>
      {/* 1. Explore (Home / Dashboard) */}
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'Explore' && styles.navItemActive]}
        onPress={() => navigation && navigation.navigate('MarketPrices')}
      >
        <Ionicons
          name={activeTab === 'Explore' ? 'search' : 'search-outline'}
          size={20}
          color={activeTab === 'Explore' ? '#2e7d32' : '#888'}
        />
        <Text style={activeTab === 'Explore' ? styles.navTextActive : styles.navText}>
          {strings.home}
        </Text>
      </TouchableOpacity>

      {/* 2. My Cart */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation && navigation.navigate('CartCheckout')}
      >
        <Ionicons name="cart-outline" size={20} color="#888" />
        <Text style={styles.navText}>{strings.cart}</Text>
      </TouchableOpacity>

      {/* 3. Orders */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation && navigation.navigate('Orders')}
      >
        <Ionicons name="receipt-outline" size={20} color="#888" />
        <Text style={styles.navText}>{strings.orders}</Text>
      </TouchableOpacity>

      {/* 4. Profile */}
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'Profile' && styles.navItemActive]}
        onPress={() => navigation && navigation.navigate('FarmerProfile')}
      >
        <Ionicons
          name={activeTab === 'Profile' ? 'person' : 'person-outline'}
          size={20}
          color={activeTab === 'Profile' ? '#2e7d32' : '#888'}
        />
        <Text style={activeTab === 'Profile' ? styles.navTextActive : styles.navText}>
          {strings.profile}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(24px)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingBottom: 12,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 64,
  },
  navItemActive: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.25)',
  },
  navText: {
    fontSize: 10,
    color: '#7A867E',
    marginTop: 3,
    fontWeight: '500',
  },
  navTextActive: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '700',
    marginTop: 3,
  },
});