import React from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const produceIllustration = require('../../../assets/onboarding/produce-illustration.png');

export default function OnboardingScreen1({ navigation }) {
  const { width, height } = useWindowDimensions();
  const illustrationSize = Math.min(width * 0.68, height * 0.32);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Decorative subtle ambient glass glow */}
        <View style={styles.ambientGlow} />

        <View style={styles.content}>
          {/* Glass Card */}
          <View style={styles.glassCard}>
            <View style={styles.illustrationWrapper}>
              <Image
                source={produceIllustration}
                resizeMode="contain"
                accessibilityLabel="A bowl of fresh vegetables and leafy greens"
                style={{ width: illustrationSize, height: illustrationSize * 0.88 }}
              />
            </View>

            <View style={styles.badgePill}>
              <Ionicons name="leaf-outline" size={13} color="#2E7D32" />
              <Text style={styles.badgeText}>100% Direct From Farmers</Text>
            </View>

            <Text style={styles.heading}>Fresh Produce,{'\n'}Pure Quality</Text>
            <Text style={styles.tagline}>Harvest to doorstep in hours</Text>
            <Text style={styles.description}>
              Buy fresh, verified harvest directly from Sri Lankan farmers with fair transparent pricing and live delivery.
            </Text>

            {/* Stepper dots */}
            <View style={styles.dotsRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

        {/* Bottom Glass Action Bar */}
        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue to next onboarding screen"
            onPress={() => navigation.navigate('OnboardingScreen2')}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.nextButtonText}>Explore Market</Text>
            <View style={styles.nextIconCircle}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
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
    top: -60,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(129, 199, 132, 0.18)',
    filter: 'blur(60px)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'web' ? 44 : 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(24px)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
    gap: 5,
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heading: {
    color: '#1B3820',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 33,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  tagline: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#5C6B61',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 290,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(46, 125, 50, 0.22)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#2E7D32',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'web' ? 24 : 14,
  },
  nextButton: {
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
    gap: 12,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  nextIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});