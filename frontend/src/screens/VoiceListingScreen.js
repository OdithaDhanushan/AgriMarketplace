import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function VoiceListingScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulated Voice Recognition Results
  const [recognizedData, setRecognizedData] = useState({
    cropName: 'Tomatoes',
    quantityKg: 10,
    sellingPricePerKg: 180,
  });

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  // Submit Voice-recognized crop directly to MongoDB Atlas
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/produce', {
        cropName: recognizedData.cropName,
        category: 'Vegetables',
        quantityKg: recognizedData.quantityKg,
        sellingPricePerKg: recognizedData.sellingPricePerKg,
        marketPricePerKg: 180,
        harvestDate: '17 September 2026',
        location: 'Kurunegala',
        photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
        description: 'Added via voice listing by farmer Sunil.',
      });
      setLoading(false);
      navigation.navigate('ProductAddedSuccess');
    } catch (err) {
      setLoading(false);
      console.log(err);
      navigation.navigate('ProductAddedSuccess');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#bfe3b4', '#d8eed1', '#f6f8f7', '#ffffff']} style={styles.gradientHeader} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Decorative Leaves & Mic Icon */}
          <View style={styles.topIconRow}>
            <MaterialCommunityIcons name="leaf" size={28} color="#7cb342" style={{ transform: [{ rotate: '-20deg' }] }} />
            <View style={styles.greenCircleMic}>
              <Ionicons name="mic" size={24} color="#fff" />
            </View>
            <MaterialCommunityIcons name="leaf" size={28} color="#7cb342" style={{ transform: [{ rotate: '40deg' }] }} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Let's create your listing</Text>
          <Text style={styles.subtitle}>
            You can speak naturally. The app will recognize your produce details.
          </Text>

          {/* Example Prompt Box */}
          <View style={styles.exampleBox}>
            <Ionicons name="bulb-outline" size={20} color="#e6a100" style={{ marginTop: 2 }} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.exampleTitle}>Example</Text>
              <Text style={styles.exampleText}>
                "I have a 10 kilos of tomatoes at 180 rupees per kilo."
              </Text>
            </View>
          </View>

          {/* Voice Waveform & Microphone Listening Box */}
          <View style={styles.waveformCard}>
            <View style={styles.waveformRow}>
              {/* Left Sound Wave Mockup */}
              <View style={styles.waveBarGroup}>
                <View style={[styles.bar, { height: 16 }]} />
                <View style={[styles.bar, { height: 28 }]} />
                <View style={[styles.bar, { height: 42 }]} />
                <View style={[styles.bar, { height: 22 }]} />
              </View>

              {/* Red Mic Pulse Button */}
              <TouchableOpacity
                style={[styles.recordBtn, isListening && styles.recordBtnActive]}
                onPress={toggleListening}
              >
                <Ionicons name="mic" size={32} color="#fff" />
              </TouchableOpacity>

              {/* Right Sound Wave Mockup */}
              <View style={styles.waveBarGroup}>
                <View style={[styles.bar, { height: 22 }]} />
                <View style={[styles.bar, { height: 42 }]} />
                <View style={[styles.bar, { height: 28 }]} />
                <View style={[styles.bar, { height: 16 }]} />
              </View>
            </View>

            {/* Listening / Stop Button */}
            <TouchableOpacity style={styles.statusPill} onPress={toggleListening}>
              <View style={[styles.redDot, isListening && { backgroundColor: '#4caf50' }]} />
              <Text style={styles.statusText}>{isListening ? 'Listening...' : '■ Stop'}</Text>
            </TouchableOpacity>
          </View>

          {/* Recognized Information Card (Screen #66) */}
          <View style={styles.recognizedCard}>
            <View style={styles.recognizedHeader}>
              <Ionicons name="eye-outline" size={18} color="#2e7d32" />
              <Text style={styles.recognizedTitle}>Recognize information</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="sprout" size={18} color="#555" />
              <Text style={styles.infoLabel}>Produce</Text>
              <Text style={styles.infoValue}>{recognizedData.cropName}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant-closed" size={18} color="#555" />
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>{recognizedData.quantityKg}kg</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="sack" size={18} color="#e6a100" />
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>Rs. {recognizedData.sellingPricePerKg} /kg</Text>
            </View>
          </View>

          {/* Action Buttons: Edit & Confirm */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Speak Again Button */}
          <TouchableOpacity style={styles.speakAgainBtn} onPress={toggleListening}>
            <Text style={styles.speakAgainText}>Speak again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="search" size={20} color="#2e7d32" />
          <Text style={styles.navTextActive}>Explore</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  gradientHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f5223' },
  content: { paddingHorizontal: 22, paddingTop: 10 },
  topIconRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  greenCircleMic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  exampleBox: {
    flexDirection: 'row',
    backgroundColor: '#f1f8e9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c5e1a5',
    marginBottom: 16,
  },
  exampleTitle: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32' },
  exampleText: { fontSize: 13, color: '#333', fontStyle: 'italic', marginTop: 2 },
  waveformCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  waveformRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 12 },
  waveBarGroup: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 18 },
  bar: { width: 4, backgroundColor: '#c8e6c9', borderRadius: 2, marginHorizontal: 3 },
  recordBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  recordBtnActive: { backgroundColor: '#43a047' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e53935', marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  recognizedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  recognizedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  recognizedTitle: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginLeft: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: '#666', marginLeft: 8, width: 80 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#222', marginLeft: 'auto' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  editBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#2e7d32',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  editBtnText: { color: '#2e7d32', fontSize: 15, fontWeight: 'bold' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#2e7d32',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  speakAgainBtn: {
    backgroundColor: '#237330',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  speakAgainText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: { alignItems: 'center' },
  navItemActive: { backgroundColor: '#e8f5e9', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  navText: { fontSize: 10, color: '#888', marginTop: 3 },
  navTextActive: { fontSize: 10, color: '#2e7d32', fontWeight: 'bold', marginTop: 3 },
});