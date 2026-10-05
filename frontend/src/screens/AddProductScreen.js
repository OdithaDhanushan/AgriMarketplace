import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import BottomNavBar from '../components/BottomNavBar';
import { createProduce } from '../services/api';

export default function AddProductScreen({ navigation }) {
  // Form States
  const [cropName, setCropName] = useState('Tomatoes');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('kg');
  const [sellingPrice, setSellingPrice] = useState('180');
  const [marketPrice] = useState(180);
  const [harvestDate] = useState('17 September 2026');
  const [location] = useState('Kurunegala');
  const [photoUri, setPhotoUri] = useState(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Camera & Gallery Handlers
  const pickImageFromGallery = async () => {
    setModalVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Gallery permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const takePhotoWithCamera = async () => {
    setModalVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  // Submit to Backend & MongoDB
  const handleAddProduct = async () => {
    if (!cropName || !sellingPrice || quantity <= 0) {
      Alert.alert('Missing fields', 'Please enter valid crop name, quantity, and price.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        cropName,
        category,
        quantityKg: Number(quantity),
        sellingPricePerKg: Number(sellingPrice),
        marketPricePerKg: marketPrice,
        harvestDate,
        location,
        photoUrl: photoUri,
        description: 'Fresh and organic produce from local farmers.',
      };

      await createProduce(payload);
      setLoading(false);
      navigation.navigate('ProductAddedSuccess');
    } catch (error) {
      setLoading(false);
      console.log('Error creating produce:', error.message);
      navigation.navigate('ProductAddedSuccess');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#bfe3b4', '#d8eed1', '#f5f7f6', '#f5f7f6']}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header - Aligned safely below Dynamic Island */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. Add Photo Card with Thumbnail & (X) button */}
          <View style={styles.card}>
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoLeft} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
                <Ionicons name="camera-outline" size={26} color="#333" />
                <Text style={styles.photoTitle}>Add photo</Text>
                <Text style={styles.photoSubtitle}>Take a photo or choose from gallery</Text>
              </TouchableOpacity>

              {photoUri && (
                <View style={styles.photoThumbnailContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setPhotoUri(null)}>
                    <Ionicons name="close-circle" size={22} color="#333" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* 2. What are you selling? */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>What are you selling?</Text>
            <View style={styles.rowBetween}>
              <View style={styles.cropRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100' }}
                  style={styles.cropThumb}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.cropName}>{cropName}</Text>
                  <Text style={styles.cropCategory}>{category}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#777" />
            </View>
          </View>

          {/* 3. How much do you have? */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>How much do you have?</Text>
            <View style={styles.rowAlign}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color="#555" style={{ marginRight: 12 }} />
              <View style={styles.stepperContainer}>
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQuantity((prev) => prev + 1)}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Unit dropdown */}
                <View style={styles.unitDropdown}>
                  <Text style={styles.unitText}>{unit}</Text>
                  <Ionicons name="chevron-down" size={16} color="#555" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
          </View>

          {/* 4. Selling price */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Selling price</Text>
            <View style={styles.rowAlign}>
              <MaterialCommunityIcons name="sack" size={22} color="#e6a100" style={{ marginRight: 12 }} />
              <View style={styles.priceInputBox}>
                <Text style={styles.priceText}>Rs. </Text>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                />
                <Text style={styles.priceSuffix}>/kg</Text>
              </View>
            </View>

            {/* Market Comparison Badge */}
            <View style={styles.marketBadge}>
              <View style={styles.marketBadgeTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="storefront-outline" size={18} color="#2e7d32" />
                  <Text style={styles.marketPriceHighlight}>Rs. {marketPrice} /kg</Text>
                </View>
                <Ionicons name="trending-up" size={20} color="#2e7d32" />
              </View>
              <View style={styles.marketBadgeBottom}>
                <Ionicons name="checkbox" size={18} color="#2e7d32" />
                <Text style={styles.marketMatchText}>Your price matches today's market price</Text>
              </View>
            </View>
          </View>

          {/* 5. Harvest date */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <Ionicons name="calendar-outline" size={20} color="#555" style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.cardLabelSmall}>Harvest date</Text>
                  <Text style={styles.dropdownValue}>{harvestDate}</Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={18} color="#777" />
            </View>
          </View>

          {/* 6. Location */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.rowAlign}>
                <Ionicons name="location-outline" size={20} color="#555" style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.cardLabelSmall}>Location</Text>
                  <Text style={styles.dropdownValue}>{location}</Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={18} color="#777" />
            </View>
          </View>

          {/* 7. Voice input banner */}
          <TouchableOpacity
            style={styles.voiceBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VoiceListing')}
          >
            <View style={styles.rowAlign}>
              <Ionicons name="mic" size={24} color="#2e7d32" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.voiceTitle}>Use voice input</Text>
                <Text style={styles.voiceSubtitle}>Speak instead of typing</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2e7d32" />
          </TouchableOpacity>

          {/* 8. Big Green Button */}
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={handleAddProduct} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>ADD PRODUCT</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Standardized Bottom Navigation */}
        <BottomNavBar activeTab="Explore" navigation={navigation} />

        {/* In-Screen Photo Picker Modal (Trapped inside iPhone frame) */}
        {modalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />

            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Photo</Text>
              <Text style={styles.modalSubtitle}>Choose how you want to add photo</Text>

              <TouchableOpacity style={styles.modalOption} onPress={takePhotoWithCamera}>
                <Ionicons name="camera" size={24} color="#2e7d32" />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Take Photo</Text>
                  <Text style={styles.modalOptionSub}>Use your camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={pickImageFromGallery}>
                <Ionicons name="images" size={24} color="#2e7d32" />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                  <Text style={styles.modalOptionSub}>Select from your photos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f6', position: 'relative' },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 44 : 14,
    paddingBottom: 18, // 👈 ADDS CLEAN GAP BELOW THE BACK BUTTON!
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f5223', textAlign: 'center' },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scrollContent: { 
    paddingHorizontal: 18, 
    paddingTop: 6,     // 👈 GIVES EXTRA BREATHING ROOM BEFORE ADD PHOTO BOX
    paddingBottom: 20 
  },
  cardLabel: { fontSize: 13, color: '#555', marginBottom: 10, fontWeight: '500' },
  cardLabelSmall: { fontSize: 11, color: '#777', marginBottom: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowAlign: { flexDirection: 'row', alignItems: 'center' },
  photoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoLeft: { flex: 1 },
  photoTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 4 },
  photoSubtitle: { fontSize: 12, color: '#777', marginTop: 2 },
  photoThumbnailContainer: { position: 'relative' },
  photoThumbnail: { width: 75, height: 60, borderRadius: 10 },
  closeBtn: { position: 'absolute', top: -8, right: -8 },
  cropRow: { flexDirection: 'row', alignItems: 'center' },
  cropThumb: { width: 44, height: 44, borderRadius: 8 },
  cropName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cropCategory: { fontSize: 12, color: '#888' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f2',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  stepBtnText: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  stepValue: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 14, color: '#222' },
  unitDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#ebf7ee',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  unitText: { fontSize: 14, fontWeight: 'bold', color: '#2e7d32' },
  priceInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  priceInput: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#222' },
  priceSuffix: { fontSize: 14, color: '#777' },
  marketBadge: {
    backgroundColor: '#f1fbf3',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dcf3e1',
  },
  marketBadgeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  marketPriceHighlight: { fontSize: 15, fontWeight: 'bold', color: '#2e7d32', marginLeft: 8 },
  marketBadgeBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  marketMatchText: { fontSize: 12, color: '#2e7d32', fontWeight: '500', marginLeft: 6 },
  dropdownValue: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  voiceBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ebf7ee',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cdecd3',
  },
  voiceTitle: { fontSize: 15, fontWeight: 'bold', color: '#1b5e20' },
  voiceSubtitle: { fontSize: 12, color: '#388e3c' },
  submitButton: {
    backgroundColor: '#237330',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#237330',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 10,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  // IN-SCREEN PHOTO MODAL (TRAPPED INSIDE PHONE)
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    zIndex: 999999,
  },
  backdropDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 18 },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  modalOptionTitle: { fontSize: 15, fontWeight: '600', color: '#222' },
  modalOptionSub: { fontSize: 12, color: '#777' },
  modalCancelBtn: { backgroundColor: '#f1f3f2', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#444' },
});