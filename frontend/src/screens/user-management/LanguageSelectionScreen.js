import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGES = [
  { code: 'si', label: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇱🇰' },
];

export default function LanguageSelectionScreen({ navigation }) {
  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'si');

  const isSinhala = selectedLanguage === 'si';

  const headingText = isSinhala ? 'ඔබගේ භාෂාව තෝරන්න' : 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்';
  const subtitleText = isSinhala
    ? 'භාෂාව තෝරා ඉදිරියට යන්න'
    : 'தொடர மொழியைத் தேர்ந்தெடுக்கவும்';
  const continueText = isSinhala ? 'ඉදිරියට යන්න' : 'தொடரவும்';

  const handleContinue = () => {
    setLanguage(selectedLanguage);
    navigation.navigate('LoginScreen', { selectedLanguage });
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Decorative subtle ambient glass glow */}
        <View style={styles.ambientGlow} />

        <View style={styles.content}>
          <View style={styles.glassHeaderCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="globe-outline" size={26} color="#2E7D32" />
            </View>
            <Text style={styles.heading}>{headingText}</Text>
            <Text style={styles.subtitle}>{subtitleText}</Text>
          </View>

          <View style={styles.options}>
            {LANGUAGES.map((langItem) => {
              const isSelected = selectedLanguage === langItem.code;

              return (
                <Pressable
                  key={langItem.code}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => {
                    setSelectedLanguage(langItem.code);
                    setLanguage(langItem.code);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.flagBox}>
                    <Text style={styles.flagText}>{langItem.flag}</Text>
                  </View>
                  <View style={styles.labelsCol}>
                    <Text style={[styles.languageLabel, isSelected && styles.languageLabelSelected]}>
                      {langItem.label}
                    </Text>
                    <Text style={styles.nativeName}>{langItem.nativeName}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#2E7D32" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue to sign in"
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.continueText}>{continueText}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#EDECEB',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(129, 199, 132, 0.16)',
    filter: 'blur(60px)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 48 : 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  glassHeaderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(20px)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.22)',
  },
  heading: {
    color: '#1B3820',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#65746A',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  options: {
    gap: 12,
  },
  option: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    backdropFilter: 'blur(16px)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  optionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: '#2E7D32',
    borderWidth: 2,
    shadowOpacity: 0.08,
  },
  optionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  radio: {
    alignItems: 'center',
    borderColor: '#9EAA9F',
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    marginRight: 12,
    width: 22,
  },
  radioSelected: {
    borderColor: '#2E7D32',
  },
  radioDot: {
    backgroundColor: '#2E7D32',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  flagBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagText: {
    fontSize: 18,
  },
  labelsCol: {
    flex: 1,
  },
  languageLabel: {
    color: '#243D2A',
    fontSize: 15,
    fontWeight: '700',
  },
  languageLabelSelected: {
    color: '#1B3820',
  },
  nativeName: {
    color: '#65746A',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'web' ? 24 : 14,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});