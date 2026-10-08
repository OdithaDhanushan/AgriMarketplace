import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'si', label: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
];

export default function LanguageSelectionScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  return (
    <LinearGradient
      colors={['#d1e5d3', '#a2d09d', '#69b65a', '#399b32']}
      locations={[0, 0.32, 0.68, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Choose your language</Text>
            <Text style={styles.subtitle}>භාෂාව තෝරන්න · மொழியைத் தேர்ந்தெடுக்கவும்</Text>
          </View>

          <View style={styles.options}>
            {LANGUAGES.map((language) => {
              const isSelected = selectedLanguage === language.code;

              return (
                <Pressable
                  key={language.code}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => setSelectedLanguage(language.code)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.languageLabel}>{language.label}</Text>
                  <Text style={styles.nativeName}>{language.nativeName}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to sign in"
          accessibilityState={{ disabled: selectedLanguage === null }}
          disabled={selectedLanguage === null}
          onPress={() => navigation.navigate('LoginScreen', { selectedLanguage })}
          style={[styles.continueButton, selectedLanguage === null && styles.continueDisabled]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headingBlock: {
    marginBottom: 30,
  },
  heading: {
    color: '#28743a',
    fontFamily: 'serif',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    textAlign: 'center',
  },
  options: {
    gap: 12,
  },
  option: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(40, 116, 58, 0.18)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: '#fff',
    borderColor: '#28743a',
    borderWidth: 2,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#56845c',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    marginRight: 13,
    width: 20,
  },
  radioSelected: {
    borderColor: '#28743a',
  },
  radioDot: {
    backgroundColor: '#28743a',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  languageLabel: {
    color: '#245d31',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  nativeName: {
    color: '#49744f',
    fontSize: 16,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#28743a',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
  },
  continueDisabled: {
    backgroundColor: 'rgba(40, 116, 58, 0.48)',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});