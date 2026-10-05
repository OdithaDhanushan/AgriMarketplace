import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNavBar({ activeTab = 'Explore', navigation }) {
  return (
    <View style={styles.bottomNav}>
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
          Explore
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="cart-outline" size={20} color="#888" />
        <Text style={styles.navText}>My Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="receipt-outline" size={20} color="#888" />
        <Text style={styles.navText}>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="person-outline" size={20} color="#888" />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 64,
  },
  navItemActive: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  navText: {
    fontSize: 10,
    color: '#888',
    marginTop: 3,
  },
  navTextActive: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: 'bold',
    marginTop: 3,
  },
});