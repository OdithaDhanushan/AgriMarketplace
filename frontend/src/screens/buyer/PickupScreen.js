import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const TOMATO_IMG = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';

export default function PickupScreen({ route, navigation }) {
  const order = route?.params?.order || {
    id: 'SK1024',
    itemName: 'Fresh Tomatoes',
    quantity: 10,
    unit: 'kg',
  };

  const orderId = order.id ? (String(order.id).startsWith('#') ? order.id : `#${order.id}`) : '#SK1024';
  const itemName = order.itemName || (order.items?.[0]?.name) || 'Fresh Tomatoes';
  const quantity = order.quantity || (order.items?.[0]?.quantity) || 10;
  const unit = order.unit || (order.items?.[0]?.unit) || 'kg';

  const [pickupPhoto, setPickupPhoto] = useState(null);
  const [produceReceived, setProduceReceived] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        // Fall back to image library if camera permissions not granted
        const libRes = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
        if (!libRes.canceled && libRes.assets?.[0]?.uri) {
          setPickupPhoto(libRes.assets[0].uri);
        }
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setPickupPhoto(res.assets[0].uri);
      }
    } catch (err) {
      console.log('Error opening camera:', err);
      // Fallback demo photo
      setPickupPhoto(TOMATO_IMG);
      Alert.alert('Photo Captured', 'Pickup confirmation photo added.');
    }
  };

  const handleConfirmPickup = async () => {
    if (!produceReceived) {
      Alert.alert('Produce Received', 'Please confirm that the produce has been received before continuing.');
      return;
    }

    try {
      const orderKey = order._id || order.id || order.orderNumber || 'SK1024';
      await api.patch(`/orders/${orderKey}/confirm-pickup`, { pickupPhoto });
    } catch (e) {
      // Continue navigation even if offline
    }

    navigation.navigate('Navigation', {
      order: {
        ...order,
        pickupPhoto,
        status: 'Out for delivery',
      },
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
            <Text style={styles.headerTitle}>Pickup</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Produce Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: TOMATO_IMG }} style={styles.productThumb} />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{itemName}</Text>
            <Text style={styles.productQty}>{quantity} {unit}</Text>
            <Text style={styles.orderIdText}>Order {orderId}</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>Pick-up from</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={22} color="#212121" />
            <View style={styles.locationTextWrap}>
              <Text style={styles.locationName}>{"Sunil's farm"}</Text>
              <Text style={styles.locationCity}>Dambadeniya</Text>
            </View>
          </View>
        </View>

        {/* Add Pick-up Photo Box */}
        <Text style={styles.sectionHeading}>Add pick-up photo</Text>
        <TouchableOpacity
          onPress={handleTakePhoto}
          style={styles.cameraBox}
          activeOpacity={0.8}
        >
          {pickupPhoto ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: pickupPhoto }} style={styles.photoPreview} />
              <View style={styles.retakeOverlay}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.retakeText}>Tap to retake photo</Text>
              </View>
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera-outline" size={44} color="#37474F" />
              <Text style={styles.cameraText}>Tap to take a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Produce Received Checkbox */}
        <TouchableOpacity
          onPress={() => setProduceReceived((prev) => !prev)}
          style={styles.checkboxRow}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, produceReceived && styles.checkboxActive]}>
            {produceReceived && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Produce received</Text>
        </TouchableOpacity>

        {/* Confirm Pickup Button */}
        <TouchableOpacity
          onPress={handleConfirmPickup}
          style={[styles.confirmBtn, !produceReceived && styles.confirmBtnDisabled]}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm pickup</Text>
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
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  },
  productThumb: {
    width: 110,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E0EAE0',
  },
  productInfo: {
    marginLeft: 16,
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2E1C',
  },
  productQty: {
    fontSize: 14,
    color: '#455A64',
    marginTop: 2,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#263238',
    marginTop: 4,
  },
  locationSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  locationLabel: {
    fontSize: 13,
    color: '#78909C',
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2E1C',
  },
  locationCity: {
    fontSize: 14,
    color: '#546E7A',
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2E1C',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cameraBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    overflow: 'hidden',
    marginBottom: 24,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cameraText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
  },
  photoPreviewWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#2E7D32',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  confirmBtn: {
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
  confirmBtnDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
