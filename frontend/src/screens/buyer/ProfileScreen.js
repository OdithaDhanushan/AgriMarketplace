import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>Buyer Profile</Text>
        <Text style={styles.subtitle}>Your profile details will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#212121', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#68736B', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
