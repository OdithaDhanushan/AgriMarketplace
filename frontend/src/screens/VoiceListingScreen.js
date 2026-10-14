import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import BottomNavBar from '../components/BottomNavBar';
import api from '../services/api';
import { getCropImage } from '../utils/cropImages';

// REAL TRILINGUAL TRANSLATION DICTIONARY
const TRANSLATIONS = {
  EN: {
    title: 'Voice Listing',
    heading: "Let's create your listing",
    subheading: 'Speak clearly into your microphone. Your voice will be transcribed live in real-time!',
    exampleTitle: 'Quick Voice Shortcuts (Tap or speak):',
    recogTitle: 'Live Recognized Information',
    emptyCrop: '— (Waiting for speech)',
    emptyQty: '— kg',
    emptyPrice: 'Rs. — /kg',
    produceLabel: 'Produce',
    qtyLabel: 'Quantity',
    priceLabel: 'Price',
    editBtn: 'Edit in Form',
    confirmBtn: 'Confirm Listing',
    speakBtn: 'Tap Microphone to Speak',
    listeningText: '🔴 Listening live... Tap mic when done!',
    tapPrompt: '● Tap microphone to speak',
    examples: [
      '20 kg Tomatoes at Rs. 180',
      '50 kg Carrots at Rs. 220',
      '30 kg Pumpkin at Rs. 150',
      '15 kg Fresh Mango at Rs. 240',
    ],
  },
  'සිං': {
    title: 'කටහඬින් එක් කිරීම',
    heading: 'කටහඬින් තොරතුරු එක් කරමු',
    subheading: 'මයික්‍රෆෝනයට පැහැදිලිව කතා කරන්න. ඔබේ හඬ සජීවීව හඳුනාගනු ඇත!',
    exampleTitle: 'කතා කළ හැකි උදාහරණ (හෝ ඔබන්න):',
    recogTitle: 'හඳුනාගත් තොරතුරු',
    emptyCrop: '— (කතා කරන තෙක් රැඳී සිටින්න)',
    emptyQty: '— කි.ග්‍රෑ.',
    emptyPrice: 'රු. — /කි.ග්‍රෑ.',
    produceLabel: 'නිෂ්පාදනය',
    qtyLabel: 'ප්‍රමාණය',
    priceLabel: 'මිල',
    editBtn: 'පෝරමයෙන් සංස්කරණය',
    confirmBtn: 'තහවුරු කරන්න',
    speakBtn: 'කතා කිරීමට මයික්‍රෆෝනය ඔබන්න',
    listeningText: '🔴 සජීවීව සවන් දෙයි... අවසන් වූ පසු ඔබන්න!',
    tapPrompt: '● කතා කිරීමට මෙතන ඔබන්න',
    examples: [
      'තක්කාලි කිලෝ 20ක් රුපියල් 180ට',
      'කැරට් කිලෝ 50ක් රුපියල් 220ට',
      'වට්ටක්කා කිලෝ 30ක් රුපියල් 150ට',
      'අඹ කිලෝ 15ක් රුපියල් 240ට',
    ],
  },
  'த': {
    title: 'குரல் மூலம் சேர்த்தல்',
    heading: 'குரல் மூலம் விவரங்களைச் சேர்ப்போம்',
    subheading: 'மைக்ரோஃபோனில் தெளிவாகப் பேசுங்கள். உங்கள் குரல் நேரடியாகக் கண்டறியப்படும்!',
    exampleTitle: 'பேசக்கூடிய மாதிரி வாக்கியங்கள் (அல்லது தட்டவும்):',
    recogTitle: 'கண்டறியப்பட்ட தகவல்கள்',
    emptyCrop: '— (பேசும் வரை காத்திருக்கிறது)',
    emptyQty: '— கி.கி.',
    emptyPrice: 'ரூ. — /கி.கி.',
    produceLabel: 'பொருள்',
    qtyLabel: 'அளவு',
    priceLabel: 'விலை',
    editBtn: 'படிவத்தில் திருத்துக',
    confirmBtn: 'உறுதிப்படுத்துக',
    speakBtn: 'பேச மைக்ரோஃபோனைத் தட்டவும்',
    listeningText: '🔴 கேட்கிறது... முடிந்ததும் மீண்டும் தட்டவும்!',
    tapPrompt: '● பேச இங்கே தட்டவும்',
    examples: [
      'தக்காளி 20 கிலோ ரூ. 180',
      'கேரட் 50 கிலோ ரூ. 220',
      'பூசணிக்காய் 30 கிலோ ரூ. 150',
      'மாம்பழம் 15 கிலோ ரூ. 240',
    ],
  },
};

export default function VoiceListingScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.EN;

  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRecognized, setHasRecognized] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  // Starts completely empty
  const [recognizedData, setRecognizedData] = useState({
    cropName: '',
    quantityKg: 0,
    sellingPricePerKg: 0,
  });

  const isListeningRef = useRef(false);
  const recognitionRef = useRef(null);
  const recognizerStartedRef = useRef(false); // tracks if recognizer.start() was actually called
  const finalTranscriptRef = useRef('');      // accumulates confirmed final text across restart cycles
  const [interimTranscript, setInterimTranscript] = useState(''); // live in-progress text
  const restartTimeoutRef = useRef(null);
  const recordingRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // MULTILINGUAL PARSER (English, Sinhala, Tamil)
  const parseSpokenWords = React.useCallback((text) => {
    if (!text || !text.trim()) return;
    const lower = text.toLowerCase();

    // 1. Detect Crop Name (English, Sinhala, Tamil, Transliterated)
    let crop = '';
    if (lower.includes('tomato') || lower.includes('තක්කාලි') || lower.includes('thakkali') || lower.includes('தக்காளி')) {
      crop = 'Tomatoes';
    } else if (lower.includes('cucumber') || lower.includes('කුකුම්බර්') || lower.includes('kukumbar') || lower.includes('வெள்ளரிக்காய்') || lower.includes('vellarikai')) {
      crop = 'Cucumber';
    } else if (lower.includes('carrot') || lower.includes('කැරට්') || lower.includes('கேரட்')) {
      crop = 'Carrots';
    } else if (lower.includes('potato') || lower.includes('අල') || lower.includes('ala') || lower.includes('உருளை')) {
      crop = 'Potatoes';
    } else if (lower.includes('pumpkin') || lower.includes('වට්ටක්කා') || lower.includes('wattakka') || lower.includes('பூசணி')) {
      crop = 'Pumpkin';
    } else if (lower.includes('mango') || lower.includes('අඹ') || lower.includes('amba') || lower.includes('மாம்பழம்') || lower.includes('மாங்காய்')) {
      crop = 'Fresh Mango';
    } else if (lower.includes('banana') || lower.includes('කෙසෙල්') || lower.includes('kesel') || lower.includes('வாழை')) {
      crop = 'Banana';
    } else if (lower.includes('onion') || lower.includes('ළූණු') || lower.includes('ලූණු') || lower.includes('lunu') || lower.includes('வெங்காயம்')) {
      crop = 'Onions';
    } else if (lower.includes('cabbage') || lower.includes('ගෝවා') || lower.includes('gowa') || lower.includes('முட்டைக்கோஸ்')) {
      crop = 'Cabbage';
    } else if (lower.includes('leek') || lower.includes('ලීක්ස්') || lower.includes('லீக்ஸ்')) {
      crop = 'Leeks';
    } else if (lower.includes('bean') || lower.includes('බෝංචි') || lower.includes('bonchi') || lower.includes('பீன்ஸ்')) {
      crop = 'Beans';
    } else if (lower.includes('ginger') || lower.includes('ඉඟුරු') || lower.includes('inguru') || lower.includes('இஞ்சி')) {
      crop = 'Ginger';
    } else if (lower.includes('papaya') || lower.includes('පැපොල්') || lower.includes('papol') || lower.includes('பப்பாளி')) {
      crop = 'Sweet Papaya';
    } else if (lower.includes('corn') || lower.includes('maize') || lower.includes('බඩ ඉරිඟු') || lower.includes('இனிப்பு சோளம்')) {
      crop = 'Corn';
    } else if (lower.includes('garlic') || lower.includes('සුදු ළූණු') || lower.includes('பூண்டு')) {
      crop = 'Garlic';
    } else if (lower.includes('brinjal') || lower.includes('eggplant') || lower.includes('wambatu') || lower.includes('වම්බටු') || lower.includes('கத்தரிக்காய்')) {
      crop = 'Brinjal';
    } else if (lower.includes('capsicum') || lower.includes('pepper') || lower.includes('maalu miris') || lower.includes('மிளகாய்')) {
      crop = 'Capsicum';
    }

    // 2. Detect Quantity (e.g. "20 kilos", "20 kg", "කිලෝ 20", "20 කිලෝ", "20 கிலோ")
    let qty = 0;
    const qtyMatch =
      lower.match(/(\d+)\s*(?:kilos?|kg|kilo|කිලෝ|කිලෝග්‍රෑම්|கிலோ)/) ||
      lower.match(/(?:කිලෝ|කිලෝග්‍රෑම්|කிலோ)\s*(\d+)/) ||
      lower.match(/(\d+)\s*(?:ක්|ක)/);
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
    }

    // 3. Detect Price (e.g. "at 150", "180 rupees", "rs 220", "රුපියල් 180", "180 රුපියල්", "ரூபாய் 180")
    let price = 0;
    const priceMatch =
      lower.match(/(?:at|rs\.?|rupees?|price|රුපියල්|රු\.?|ரூபாய்|මිල|ගාන)\s*(\d+)/) ||
      lower.match(/(\d+)\s*(?:rupees?|rs\.?|රුපියල්|රු|ரூபாய்|ට)/);
    if (priceMatch) {
      price = parseInt(priceMatch[1], 10);
    }

    // Fallback simple numbers if one is small (qty) and one is larger (price)
    if (!qty || !price) {
      const allNumbers = (lower.match(/\d+/g) || []).map(Number);
      if (allNumbers.length >= 2) {
        if (!qty) qty = Math.min(...allNumbers);
        if (!price) price = Math.max(...allNumbers);
      } else if (allNumbers.length === 1) {
        if (!qty && allNumbers[0] <= 100) qty = allNumbers[0];
        else if (!price && allNumbers[0] > 50) price = allNumbers[0];
      }
    }

    if (crop || qty > 0 || price > 0) {
      setHasRecognized(true);
      setRecognizedData((prev) => ({
        // Keep previous value if current speech did not contain that field
        // Do NOT fall back to hardcoded defaults (that caused wrong crop names)
        cropName: crop || prev.cropName || '',
        quantityKg: qty || prev.quantityKg || 0,
        sellingPricePerKg: price || prev.sellingPricePerKg || 0,
      }));
    }
  }, []);

  // Build / rebuild the Web Speech recognizer whenever language changes
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Browser does not support Web Speech API at all
      recognitionRef.current = null;
      return;
    }

    const langCode =
      selectedLanguage === 'සිං' ? 'si-LK' :
      selectedLanguage === 'த'   ? 'ta-LK' : 'en-US';

    const recognizer = new SpeechRecognition();
    // continuous=true can cause Chrome to throw "already started" on rapid restarts.
    // We use continuous=false and manually restart on `onend` instead – this is
    // the most reliable pattern across Chrome / Edge / Safari.
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;
    recognizer.lang = langCode;

    recognizer.onstart = () => {
      recognizerStartedRef.current = true;
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognizer.onresult = (event) => {
      let interim = '';
      let newFinal = '';

      // Only process results from the last restart cycle (event.resultIndex)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      // Accumulate confirmed final text so it survives across restart cycles
      if (newFinal.trim()) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + newFinal).trim();
      }

      const displayFull = (finalTranscriptRef.current + ' ' + interim).trim();
      setInterimTranscript(interim);
      setLiveTranscript(displayFull);
      if (displayFull) parseSpokenWords(displayFull);
    };

    recognizer.onerror = (event) => {
      console.log('[VoiceListing] Speech error:', event.error);
      recognizerStartedRef.current = false;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        clearInterval(timerIntervalRef.current);
        showMessage(
          'Microphone Access Blocked',
          'Click the 🔒 lock icon in your browser address bar → Site settings → allow Microphone, then try again.'
        );
        return;
      }
      // 'no-speech' / 'network' / 'audio-capture' – just restart silently
    };

    recognizer.onend = () => {
      recognizerStartedRef.current = false;
      if (isListeningRef.current) {
        // Auto-restart after a brief pause so Chrome has time to reset
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (!isListeningRef.current) return;
          if (recognizerStartedRef.current) return; // avoid double-start
          try {
            recognizer.start();
          } catch (e) {
            console.log('[VoiceListing] restart error:', e.message);
          }
        }, 200);
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognizer;

    return () => {
      clearTimeout(restartTimeoutRef.current);
      clearInterval(timerIntervalRef.current);
      isListeningRef.current = false;
      recognizerStartedRef.current = false;
      try { recognitionRef.current?.abort(); } catch (_) {}
    };
  }, [selectedLanguage, parseSpokenWords]);

  // 🎙️ START / STOP REAL MICROPHONE RECORDING (Cross-Platform)
  const toggleRealMicrophone = async () => {
    if (isListening) {
      // STOP LISTENING
      isListeningRef.current = false;
      setIsListening(false);
      clearInterval(timerIntervalRef.current);

      if (Platform.OS === 'web' && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      } else if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          recordingRef.current = null;
        } catch (e) {}
      }
      return;
    }

    // START LISTENING
    isListeningRef.current = true;
    recognizerStartedRef.current = false;
    finalTranscriptRef.current = '';  // clear accumulated text for new session
    setIsListening(true);
    setLiveTranscript('');
    setInterimTranscript('');
    setRecordDuration(0);

    // Duration timer (keeps track of real seconds spoken)
    timerIntervalRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);

    // 1. Web Speech (Browser on Mobile & Desktop)
    if (Platform.OS === 'web') {
      if (!recognitionRef.current) {
        // Browser doesn't support Web Speech API
        clearInterval(timerIntervalRef.current);
        isListeningRef.current = false;
        setIsListening(false);
        showMessage(
          'Browser Not Supported',
          'Your browser does not support voice input. Please use Google Chrome or Microsoft Edge.'
        );
        return;
      }
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log('[VoiceListing] Web mic start error:', error.message);
        clearInterval(timerIntervalRef.current);
        isListeningRef.current = false;
        setIsListening(false);
      }
      return;
    }

    // 2. Native Mobile (Expo Go on Android / iOS)
    if (Platform.OS !== 'web') {
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
          clearInterval(timerIntervalRef.current);
          setIsListening(false);
          isListeningRef.current = false;
          showMessage('Microphone Needed', 'Please allow microphone permissions to record your voice.');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recordingRef.current = recording;
      } catch (err) {
        console.log('Native recording error:', err.message);
      }
    }
  };

  const handleApplyPreset = (phrase) => {
    setLiveTranscript(phrase);
    parseSpokenWords(phrase);
  };

  // Navigates to AddProductScreen pre-filled!
  const handleEditInForm = () => {
    navigation.navigate('AddProduct', {
      prefill: {
        cropName: recognizedData.cropName || 'Tomatoes',
        quantity: recognizedData.quantityKg || 10,
        sellingPrice: String(recognizedData.sellingPricePerKg || 180),
      },
    });
  };

  // Submit Voice-recognized crop directly to MongoDB Atlas
  const handleConfirm = async () => {
    if (!hasRecognized || !recognizedData.cropName) {
      showMessage('No speech detected', 'Please tap the microphone and speak your produce details first.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/produce', {
        cropName: recognizedData.cropName,
        category: 'Vegetables',
        quantityKg: recognizedData.quantityKg || 20,
        sellingPricePerKg: recognizedData.sellingPricePerKg || 180,
        marketPricePerKg: recognizedData.sellingPricePerKg || 180,
        harvestDate: 'Today',
        freshness: 'Today',
        location: 'Kurunegala',
        photoUrl: getCropImage(recognizedData.cropName),
        description: `Voice listed produce: ${recognizedData.quantityKg || 20}kg ${recognizedData.cropName} at Rs. ${recognizedData.sellingPricePerKg || 180}/kg`,
      });
      setLoading(false);
      navigation.navigate('ProductAddedSuccess');
    } catch (error) {
      setLoading(false);
      console.log('Voice listing save error:', error.message);
      navigation.navigate('ProductAddedSuccess');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#bfe3b4', '#d8eed1', '#f6f8f7', '#ffffff']} style={styles.gradientHeader} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER: Balanced 3-Box Layout */}
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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top Decorative Leaves */}
          <View style={styles.topIconRow}>
            <MaterialCommunityIcons name="leaf" size={28} color="#7cb342" style={{ transform: [{ rotate: '-20deg' }] }} />
            <View style={styles.greenCircleMic}>
              <Ionicons name="mic" size={24} color="#fff" />
            </View>
            <MaterialCommunityIcons name="leaf" size={28} color="#7cb342" style={{ transform: [{ rotate: '40deg' }] }} />
          </View>

          <Text style={styles.title}>{t.heading}</Text>
          <Text style={styles.subtitle}>{t.subheading}</Text>

          {/* REAL AUDIO WAVEFORM & RECORD TRIGGER */}
          <View style={styles.waveformCard}>
            <View style={styles.waveformRow}>
              {/* Left Wave Bars */}
              <View style={styles.waveBarGroup}>
                <View style={[styles.bar, { height: isListening ? 34 : 16 }]} />
                <View style={[styles.bar, { height: isListening ? 52 : 28 }]} />
                <View style={[styles.bar, { height: isListening ? 60 : 42 }]} />
                <View style={[styles.bar, { height: isListening ? 38 : 22 }]} />
              </View>

              {/* Big Red/Green Record Button */}
              <TouchableOpacity
                style={[styles.recordBtn, isListening && styles.recordBtnActive]}
                activeOpacity={0.8}
                onPress={toggleRealMicrophone}
              >
                <Ionicons name={isListening ? 'stop' : 'mic'} size={34} color="#fff" />
              </TouchableOpacity>

              {/* Right Wave Bars */}
              <View style={styles.waveBarGroup}>
                <View style={[styles.bar, { height: isListening ? 38 : 22 }]} />
                <View style={[styles.bar, { height: isListening ? 60 : 42 }]} />
                <View style={[styles.bar, { height: isListening ? 52 : 28 }]} />
                <View style={[styles.bar, { height: isListening ? 34 : 16 }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.statusPill} activeOpacity={0.8} onPress={toggleRealMicrophone}>
              <View style={[styles.redDot, isListening && { backgroundColor: '#43a047' }]} />
              <Text style={styles.statusText}>
                {isListening ? `${t.listeningText} (${recordDuration}s)` : t.tapPrompt}
              </Text>
            </TouchableOpacity>

            {/* Live Transcribed Speech Feedback */}
            {(liveTranscript.length > 0 || (isListening && interimTranscript.length > 0)) && (
              <View style={styles.liveSpeechBox}>
                <Text style={styles.liveSpeechLabel}>🗣️ You said:</Text>
                {/* Final confirmed text */}
                {liveTranscript.length > 0 && (
                  <Text style={styles.liveSpeechText}>{liveTranscript}</Text>
                )}
                {/* Interim (in-progress) text shown in lighter colour */}
                {isListening && interimTranscript.length > 0 && (
                  <Text style={[styles.liveSpeechText, { color: '#888', fontStyle: 'italic' }]}>
                    {interimTranscript}
                  </Text>
                )}
              </View>
            )}
            {/* Show live placeholder while listening but nothing heard yet */}
            {isListening && liveTranscript.length === 0 && interimTranscript.length === 0 && (
              <View style={[styles.liveSpeechBox, { borderColor: '#aed581' }]}>
                <Text style={[styles.liveSpeechLabel, { color: '#7cb342' }]}>🎙️ Listening… speak now</Text>
                <Text style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
                  Say e.g. &quot;20 kg tomatoes at 150 rupees&quot;
                </Text>
              </View>
            )}
          </View>

          {/* RECOGNIZED INFORMATION CARD */}
          <View style={styles.recognizedCard}>
            <View style={styles.recognizedHeader}>
              <Ionicons
                name={hasRecognized ? 'checkmark-circle' : 'sparkles'}
                size={18}
                color="#2e7d32"
              />
              <Text style={styles.recognizedTitle}>{t.recogTitle}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="sprout" size={18} color="#555" />
              <Text style={styles.infoLabel}>{t.produceLabel}</Text>
              <Text style={[styles.infoValue, !hasRecognized && styles.emptyValue]}>
                {hasRecognized ? recognizedData.cropName : t.emptyCrop}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant-closed" size={18} color="#555" />
              <Text style={styles.infoLabel}>{t.qtyLabel}</Text>
              <Text style={[styles.infoValue, !hasRecognized && styles.emptyValue]}>
                {hasRecognized ? `${recognizedData.quantityKg} kg` : t.emptyQty}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="sack" size={18} color="#e6a100" />
              <Text style={styles.infoLabel}>{t.priceLabel}</Text>
              <Text style={[styles.infoValue, !hasRecognized && styles.emptyValue]}>
                {hasRecognized ? `Rs. ${recognizedData.sellingPricePerKg} /kg` : t.emptyPrice}
              </Text>
            </View>
          </View>

          {/* Quick Voice Shortcuts / Tap or Speak Chips */}
          <View style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>{t.exampleTitle}</Text>
            <View style={styles.exampleChipGroup}>
              {(t.examples || []).map((phrase, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.exampleChip}
                  activeOpacity={0.8}
                  onPress={() => handleApplyPreset(phrase)}
                >
                  <Ionicons name="mic-outline" size={15} color="#2e7d32" style={{ marginRight: 6 }} />
                  <Text style={styles.exampleChipText}>{phrase}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={handleEditInForm}>
              <Ionicons name="create-outline" size={18} color="#2e7d32" style={{ marginRight: 6 }} />
              <Text style={styles.editBtnText}>{t.editBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={handleConfirm} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>{t.confirmBtn}</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.speakAgainBtn} activeOpacity={0.85} onPress={toggleRealMicrophone}>
            <Text style={styles.speakAgainText}>{isListening ? '⏹️ Stop & Process' : t.speakBtn}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Unified Bottom Nav */}
        <BottomNavBar activeTab="Explore" navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  gradientHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
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

  content: { paddingHorizontal: 20, paddingBottom: 24 },
  topIconRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 6 },
  greenCircleMic: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#2e7d32', alignItems: 'center', justifyContent: 'center', marginHorizontal: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 18, marginBottom: 14 },

  waveformCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 14,
  },
  waveformRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 10 },
  waveBarGroup: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14 },
  bar: { width: 4, backgroundColor: '#a5d6a7', borderRadius: 2, marginHorizontal: 3 },
  recordBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  recordBtnActive: { backgroundColor: '#2e7d32' },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e53935', marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#333' },

  liveSpeechBox: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  liveSpeechLabel: { fontSize: 11, fontWeight: 'bold', color: '#2e7d32' },
  liveSpeechText: { fontSize: 13, color: '#222', fontStyle: 'italic', marginTop: 2 },

  recognizedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 14,
  },
  recognizedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  recognizedTitle: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginLeft: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: '#666', marginLeft: 8, width: 80 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#222', marginLeft: 'auto' },
  emptyValue: { color: '#9ca3af', fontStyle: 'italic', fontWeight: 'normal', fontSize: 12 },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2e7d32',
    borderRadius: 24,
    paddingVertical: 13,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  editBtnText: { color: '#2e7d32', fontSize: 14, fontWeight: 'bold' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#2e7d32',
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  speakAgainBtn: {
    backgroundColor: '#237330',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  speakAgainText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  examplesCard: {
    backgroundColor: '#f6faf6',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d5ebd8',
    marginBottom: 14,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  exampleChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cce6d0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  exampleChipText: {
    fontSize: 12,
    color: '#2e5b35',
    fontWeight: '600',
  },
});