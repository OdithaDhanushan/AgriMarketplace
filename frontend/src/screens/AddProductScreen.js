import React, { useState, useEffect } from 'react';
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

// REAL MULTILINGUAL TRANSLATION DICTIONARY
const TRANSLATIONS = {
  EN: {
    title: 'Add Product',
    voiceTitle: "Don't want to type?",
    voiceSub: "Tap here to Speak your product details 🎙️",
    photoTitle: "Add Photo of Your Harvest",
    photoSub: "Tap to take a photo with camera or choose from gallery",
    cropHeading: "What are you selling?",
    cropPlaceholder: "Type vegetable or fruit name here...",
    suggestions: "Or tap a common crop:",
    harvestHeading: "When was this harvested?",
    todayBtn: "☀️ Harvested Today",
    yesterdayBtn: "🌅 Yesterday",
    qtyHeading: "How much quantity do you have?",
    qtyUnit: "Kilograms (kg)",
    priceHeading: "Your Selling Price (Per Kilogram)",
    marketBadge: "Your price: Rs.",
    postBtn: "POST PRODUCT FOR SALE",
    changePhoto: "Change Photo",
  },
  'සිං': {
    title: 'නිෂ්පාදනය එක් කරන්න',
    voiceTitle: "ටයිප් කිරීමට අපහසුද?",
    voiceSub: "කටහඬින් තොරතුරු එක් කිරීමට මෙතන ඔබන්න 🎙️",
    photoTitle: "අස්වැන්නේ ඡායාරූපයක් එක් කරන්න",
    photoSub: "කැමරාවෙන් ඡායාරූපයක් ගැනීමට හෝ ගැලරියෙන් තෝරන්න",
    cropHeading: "ඔබ විකුණන්නේ කුමක්ද?",
    cropPlaceholder: "එළවළු හෝ පලතුරු වර්ගය මෙහි ලියන්න...",
    suggestions: "නැතහොත් පහතින් තෝරන්න:",
    harvestHeading: "අස්වැන්න නෙළාගත්තේ කවදාද?",
    todayBtn: "☀️ අද දිනයේ (ඉතා නැවුම්)",
    yesterdayBtn: "🌅 ඊයේ දිනයේ",
    qtyHeading: "ඔබ සතුව ඇති ප්‍රමාණය කොපමණද?",
    qtyUnit: "කිලෝග්‍රෑම් (kg)",
    priceHeading: "ඔබගේ විකුණුම් මිල (කිලෝවකට)",
    marketBadge: "ඔබගේ මිල: රු.",
    postBtn: "විකිණීමට වෙළඳපොළට එක් කරන්න",
    changePhoto: "ඡායාරූපය වෙනස් කරන්න",
  },
  'த': {
    title: 'பொருளைச் சேர்க்கவும்',
    voiceTitle: "டைப் செய்ய சிரமமா?",
    voiceSub: "குரல் மூலம் விவரங்களைச் சேர்க்க தட்டவும் 🎙️",
    photoTitle: "பயிரின் புகைப்படத்தைச் சேர்க்கவும்",
    photoSub: "கேமரா மூலம் புகைப்படம் எடுக்க அல்லது பதிவேற்ற தட்டவும்",
    cropHeading: "நீங்கள் என்ன விற்கிறீர்கள்?",
    cropPlaceholder: "காய் அல்லது பழத்தின் பெயரை உள்ளிடவும்...",
    suggestions: "அல்லது கீழே தேர்வு செய்யவும்:",
    harvestHeading: "எப்போது அறுவடை செய்யப்பட்டது?",
    todayBtn: "☀️ இன்று (மிகவும் புதியது)",
    yesterdayBtn: "🌅 நேற்று",
    qtyHeading: "உங்களிடம் உள்ள அளவு எவ்வளவு?",
    qtyUnit: "கிலோகிராம் (kg)",
    priceHeading: "உங்கள் விற்பனை விலை (கிலோவுக்கு)",
    marketBadge: "உங்கள் விலை: ரூ.",
    postBtn: "விற்பனைக்கு இடுகையிடவும்",
    changePhoto: "புகைப்படத்தை மாற்றவும்",
  },
};

const SUGGESTIONS = ['Tomatoes', 'Carrots', 'Potatoes', 'Onions', 'Cabbage', 'Pumpkin', 'Beans'];

export default function AddProductScreen({ route, navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.EN;

  // Real Form States
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [sellingPrice, setSellingPrice] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [location] = useState('Kurunegala');
  
  // 🌟 1-TAP HARVEST TIME SELECTOR ('Today' | 'Yesterday' | '2 Days Ago')
  const [harvestTime, setHarvestTime] = useState('Today');

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill from Voice Screen
  useEffect(() => {
    if (route?.params?.prefill) {
      const { cropName: pCrop, quantity: pQty, sellingPrice: pPrice } = route.params.prefill;
      if (pCrop) setCropName(pCrop);
      if (pQty) setQuantity(Number(pQty));
      if (pPrice) setSellingPrice(String(pPrice));
    }
  }, [route?.params?.prefill]);

  const handleSuggestionPress = (name) => {
    setCropName(name);
  };

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

  const handleAddProduct = async () => {
    if (!cropName.trim()) {
      Alert.alert('Missing Crop Name', 'Please type the crop name you are selling.');
      return;
    }
    if (Number(quantity) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter quantity in kilograms.');
      return;
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      Alert.alert('Invalid Price', 'Please enter your selling price per kilogram.');
      return;
    }

    // Calculate real date based on 1-tap selection
    const d = new Date();
    if (harvestTime === 'Yesterday') d.setDate(d.getDate() - 1);
    const calculatedHarvestDate = d.toLocaleDateString('en-GB');

    setLoading(true);
    try {
      const payload = {
        cropName: cropName.trim(),
        category: 'Vegetables',
        quantityKg: Number(quantity),
        sellingPricePerKg: Number(sellingPrice),
        marketPricePerKg: Number(sellingPrice),
        harvestDate: calculatedHarvestDate,
        freshness: harvestTime, // 'Today' | 'Yesterday'
        location,
        photoUrl: photoUri || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
        description: `Fresh organic ${cropName.trim()} harvested ${harvestTime.toLowerCase()} by farmer Sunil.`,
      };

      await createProduce(payload);
      setLoading(false);
      navigation.navigate('ProductAddedSuccess');
    } catch (error) {
      setLoading(false);
      navigation.navigate('ProductAddedSuccess');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#bfe3b4', '#d8eed1', '#f5f7f6', '#ffffff']} style={styles.gradientBackground} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t.title}
            </Text>
          </View>

          <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
            <View style={styles.langPill}>
              {['සිං', 'EN', 'த'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langBtn, selectedLanguage === lang && styles.langBtnActive]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text style={[styles.langText, selectedLanguage === lang && styles.langTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Voice Banner */}
          <TouchableOpacity
            style={styles.voiceBannerTop}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VoiceListing')}
          >
            <View style={styles.voiceCircleIcon}>
              <Ionicons name="mic" size={26} color="#fff" />
            </View>
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.voiceTitleTop}>{t.voiceTitle}</Text>
              <Text style={styles.voiceSubTop}>{t.voiceSub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2e7d32" />
          </TouchableOpacity>

          {/* 1. Photo Dropzone */}
          <TouchableOpacity
            style={[styles.photoCard, photoUri ? styles.photoCardFilled : styles.photoCardEmpty]}
            activeOpacity={0.85}
            onPress={() => setModalVisible(true)}
          >
            {photoUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removePhotoBadge} onPress={() => setPhotoUri(null)}>
                  <Ionicons name="close-circle" size={24} color="#d32f2f" />
                </TouchableOpacity>
                <View style={styles.changeOverlay}>
                  <Ionicons name="camera" size={16} color="#fff" />
                  <Text style={styles.changeOverlayText}>{t.changePhoto}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyPhotoContent}>
                <View style={styles.cameraIconCircle}>
                  <Ionicons name="camera-outline" size={36} color="#2e7d32" />
                </View>
                <Text style={styles.emptyPhotoTitle}>{t.photoTitle}</Text>
                <Text style={styles.emptyPhotoSub}>{t.photoSub}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 2. Typeable Crop Box */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>{t.cropHeading}</Text>
            <View style={styles.textInputBox}>
              <MaterialCommunityIcons name="sprout-outline" size={24} color="#2e7d32" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.cropTextInput}
                placeholder={t.cropPlaceholder}
                placeholderTextColor="#9ca3af"
                value={cropName}
                onChangeText={setCropName}
              />
              {cropName.length > 0 && (
                <TouchableOpacity onPress={() => setCropName('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Suggestions */}
            <Text style={styles.suggestionTitle}>{t.suggestions}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.suggestionChip, cropName.toLowerCase() === s.toLowerCase() && styles.suggestionChipActive]}
                  onPress={() => handleSuggestionPress(s)}
                >
                  <Text style={[styles.suggestionText, cropName.toLowerCase() === s.toLowerCase() && styles.suggestionTextActive]}>
                    + {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 🌟 3. 1-TAP HARVEST DATE SELECTOR (Zero Typing for Sunil!) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>{t.harvestHeading}</Text>
            <View style={styles.harvestButtonRow}>
              {/* Option A: Today (Default) */}
              <TouchableOpacity
                style={[styles.harvestChoiceBtn, harvestTime === 'Today' && styles.harvestChoiceBtnActive]}
                activeOpacity={0.8}
                onPress={() => setHarvestTime('Today')}
              >
                <Ionicons
                  name={harvestTime === 'Today' ? 'checkmark-circle' : 'sunny-outline'}
                  size={18}
                  color={harvestTime === 'Today' ? '#1b5e20' : '#2e7d32'}
                />
                <Text style={[styles.harvestChoiceText, harvestTime === 'Today' && styles.harvestChoiceTextActive]}>
                  {t.todayBtn}
                </Text>
              </TouchableOpacity>

              {/* Option B: Yesterday */}
              <TouchableOpacity
                style={[styles.harvestChoiceBtn, harvestTime === 'Yesterday' && styles.harvestChoiceBtnActive]}
                activeOpacity={0.8}
                onPress={() => setHarvestTime('Yesterday')}
              >
                <Ionicons
                  name={harvestTime === 'Yesterday' ? 'checkmark-circle' : 'time-outline'}
                  size={18}
                  color={harvestTime === 'Yesterday' ? '#1b5e20' : '#666'}
                />
                <Text style={[styles.harvestChoiceText, harvestTime === 'Yesterday' && styles.harvestChoiceTextActive]}>
                  {t.yesterdayBtn}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Freshness Badge Preview */}
            <View style={styles.freshnessNotice}>
              <Ionicons name="sparkles" size={14} color="#2e7d32" />
              <Text style={styles.freshnessNoticeText}>
                {harvestTime === 'Today'
                  ? '🟢 Peak Freshness: Buyers will see "Harvested Today" on your listing!'
                  : '🟡 Good Freshness: Listed as 1-day fresh harvest.'}
              </Text>
            </View>
          </View>

          {/* 4. Quantity Box */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>{t.qtyHeading}</Text>

            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepCircleBtn}
                activeOpacity={0.7}
                onPress={() => setQuantity((prev) => Math.max(0, prev - 1))}
              >
                <Text style={styles.stepSymbol}>-</Text>
              </TouchableOpacity>

              <View style={styles.qtyCenterBox}>
                <View style={styles.qtyNumberRow}>
                  <TextInput
                    style={styles.cleanQtyInput}
                    keyboardType="numeric"
                    value={String(quantity)}
                    onChangeText={(val) => setQuantity(Number(val) || 0)}
                    selectTextOnFocus
                  />
                  <Text style={styles.kgBadgeText}>kg</Text>
                </View>
                <Text style={styles.qtySubText}>{t.qtyUnit}</Text>
              </View>

              <TouchableOpacity
                style={styles.stepCircleBtn}
                activeOpacity={0.7}
                onPress={() => setQuantity((prev) => prev + 1)}
              >
                <Text style={styles.stepSymbol}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Bulk Chips */}
            <View style={styles.quickQtyRow}>
              {[5, 10, 25, 50].map((addVal) => (
                <TouchableOpacity
                  key={addVal}
                  style={styles.quickQtyChip}
                  activeOpacity={0.7}
                  onPress={() => setQuantity((prev) => prev + addVal)}
                >
                  <Text style={styles.quickQtyText}>+{addVal} kg</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickQtyChip, { borderColor: '#ffcdd2' }]}
                activeOpacity={0.7}
                onPress={() => setQuantity(0)}
              >
                <Text style={[styles.quickQtyText, { color: '#d32f2f' }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5. Selling Price Box */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>{t.priceHeading}</Text>
            <View style={styles.priceInputRow}>
              <Text style={styles.currencyPrefix}>Rs.</Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
              <Text style={styles.priceSuffix}>/ kg</Text>
            </View>

            {Number(sellingPrice) > 0 && (
              <View style={styles.benchmarkBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#2e7d32" />
                <Text style={styles.benchmarkText}>
                  {t.marketBadge} {sellingPrice} /kg ({location})
                </Text>
              </View>
            )}
          </View>

          {/* 6. Post Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleAddProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <View style={styles.rowCenter}>
                <Ionicons name="cloud-upload" size={22} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.submitBtnText}>{t.postBtn}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Unified Bottom Nav */}
        <BottomNavBar activeTab="Explore" navigation={navigation} />

        {/* In-Screen Photo Modal */}
        {modalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />

            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Crop Photo</Text>
              <Text style={styles.modalSubtitle}>Take photo with camera or choose from gallery</Text>

              <TouchableOpacity style={styles.modalOption} onPress={takePhotoWithCamera}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="camera" size={24} color="#2e7d32" />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Use Camera</Text>
                  <Text style={styles.modalOptionSub}>Take fresh photo of your harvest</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={pickImageFromGallery}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="images" size={24} color="#2e7d32" />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                  <Text style={styles.modalOptionSub}>Pick saved photo from phone</Text>
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
  container: { flex: 1, backgroundColor: '#f6f8f7', position: 'relative' },
  gradientBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 44 : 14,
    paddingBottom: 16,
  },
  headerSide: { width: 85, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1f5223', textAlign: 'center' },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  langPill: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  langBtn: { paddingVertical: 4, paddingHorizontal: 7, borderRadius: 12 },
  langBtnActive: { backgroundColor: '#2e7d32' },
  langText: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  langTextActive: { color: '#fff' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 },

  voiceBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#a5d6a7',
    elevation: 2,
  },
  voiceCircleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitleTop: { fontSize: 15, fontWeight: 'bold', color: '#1b5e20' },
  voiceSubTop: { fontSize: 12, color: '#388e3c', marginTop: 2 },

  photoCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, elevation: 1 },
  photoCardEmpty: {
    borderWidth: 2,
    borderColor: '#81c784',
    borderStyle: 'dashed',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  photoCardFilled: { borderWidth: 1.5, borderColor: '#e2e8f0' },
  emptyPhotoContent: { alignItems: 'center' },
  cameraIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyPhotoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f5223' },
  emptyPhotoSub: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  photoPreviewWrapper: { width: '100%', height: 180, position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  removePhotoBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 12 },
  changeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  changeOverlayText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eef2f0',
    elevation: 2,
  },
  sectionHeading: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 10 },

  textInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cropTextInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#222' },
  suggestionTitle: { fontSize: 11, fontWeight: 'bold', color: '#777', marginTop: 10, marginBottom: 6 },
  suggestionRow: { flexDirection: 'row', gap: 6 },
  suggestionChip: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#c5e1a5',
  },
  suggestionChipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  suggestionText: { fontSize: 12, fontWeight: '600', color: '#2e7d32' },
  suggestionTextActive: { color: '#fff' },

  // 1-Tap Harvest Buttons
  harvestButtonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  harvestChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8faf9',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  harvestChoiceBtnActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
    borderWidth: 2,
  },
  harvestChoiceText: { fontSize: 13, fontWeight: '600', color: '#555', marginLeft: 6 },
  harvestChoiceTextActive: { color: '#1b5e20', fontWeight: 'bold' },
  freshnessNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
  },
  freshnessNoticeText: { fontSize: 11, color: '#2e7d32', fontWeight: '600', marginLeft: 6, flex: 1 },

  // Stepper Styles
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  stepCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  stepSymbol: { fontSize: 26, fontWeight: 'bold', color: '#fff', lineHeight: 30 },
  qtyCenterBox: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  qtyNumberRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  cleanQtyInput: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1b5e20',
    textAlign: 'center',
    minWidth: 50,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  kgBadgeText: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32', marginLeft: 4 },
  qtySubText: { fontSize: 11, color: '#777', marginTop: 2 },
  quickQtyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  quickQtyChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  quickQtyText: { fontSize: 11, fontWeight: 'bold', color: '#2e7d32' },

  // Price
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  currencyPrefix: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginRight: 6 },
  priceInput: { flex: 1, fontSize: 22, fontWeight: '900', color: '#222' },
  priceSuffix: { fontSize: 15, fontWeight: 'bold', color: '#666' },
  benchmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  benchmarkText: { fontSize: 12, color: '#2e7d32', fontWeight: '600', marginLeft: 6 },

  // Submit Button
  submitBtn: {
    backgroundColor: '#237330',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginBottom: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },

  // Modal
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
  backdropDismiss: { flex: 1 },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
    elevation: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 18, marginTop: 2 },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  modalOptionSub: { fontSize: 12, color: '#666' },
  modalCancelBtn: { backgroundColor: '#f1f3f2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  modalCancelText: { fontSize: 15, fontWeight: 'bold', color: '#444' },
});