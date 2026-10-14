import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const produceIllustration = require('../../../assets/onboarding/produce-illustration.png');

export default function OnboardingScreen2({ navigation }) {
  const { width, height } = useWindowDimensions();
  const illustrationSize = Math.min(width * 0.76, height * 0.38);

  return (
    <LinearGradient
      colors={['#d1e5d3', '#a2d09d', '#69b65a', '#399b32']}
      locations={[0, 0.32, 0.68, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.content, { paddingTop: Math.min(height * 0.07, 48) }]}>
          <Image
            source={produceIllustration}
            resizeMode="contain"
            accessibilityLabel="A bowl of fresh vegetables and leafy greens"
            style={{ width: illustrationSize, height: illustrationSize * 0.94 }}
          />
          <Text style={styles.heading}>Welcome</Text>
          <Text style={styles.tagline}>
            Fresh from Farmers,{ '\n' }Direct to You
          </Text>
          <Text style={styles.description}>
            Buy fresh, quality produce directly from{'\n'}
            local farmers — no middlemen, no{'\n'}
            unnecessary steps.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to AgriMarketplace"
          hitSlop={12}
          onPress={() => navigation.navigate('LanguageSelectionScreen')}
          style={styles.nextButton}
        >
          <View style={styles.nextIcon}>
            <View style={styles.playTriangle} />
            <View style={styles.playBar} />
          </View>
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
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    color: '#28743a',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 46,
    marginTop: 20,
    textAlign: 'center',
  },
  tagline: {
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'casual',
      default: 'cursive',
    }),
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  description: {
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'casual',
      default: 'cursive',
    }),
    fontSize: 14,
    lineHeight: 18,
    marginTop: 12,
    maxWidth: 330,
    textAlign: 'center',
  },
  nextButton: {
    alignItems: 'center',
    bottom: 12,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    alignSelf: 'center',
    width: 72,
  },
  nextIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  playTriangle: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 13,
    borderLeftColor: '#f0ff35',
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderTopWidth: 13,
    height: 0,
    width: 0,
  },
  playBar: {
    backgroundColor: '#f0ff35',
    height: 25,
    width: 5,
  },
});