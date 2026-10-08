import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Ionicons name="receipt-outline" size={56} color="#B0BDB1" />
        <Text style={styles.title}>No Orders Yet</Text>
        <Text style={styles.subtitle}>Your order history will appear here once you place an order.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  title: { color: '#212121', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#68736B', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
