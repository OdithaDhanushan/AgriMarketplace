import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductAddedSuccess({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation) navigation.navigate('MarketPrices');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={90} color="#fff" />
      </View>
      <Text style={styles.title}>PRODUCT ADDED !</Text>
      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => navigation && navigation.navigate('MarketPrices')}
      >
        <Text style={styles.doneBtnText}>View Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#4cd964', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '900', color: '#4cd964', letterSpacing: 1, marginBottom: 30 },
  doneBtn: { backgroundColor: '#2e7d32', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});