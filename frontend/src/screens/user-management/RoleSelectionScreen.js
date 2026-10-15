import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';

const farmHeader = require('../../../assets/onboarding/role-farm-header.png');

export default function RoleSelectionScreen({ navigation, route }) {
  const { language, strings, setLanguage } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('Buyer');
  const { width } = useWindowDimensions();
  const headerHeight = Math.min(width * 0.42, 175);

  React.useEffect(() => {
    if (route?.params?.selectedLanguage && (route.params.selectedLanguage === 'en' || route.params.selectedLanguage === 'si' || route.params.selectedLanguage === 'ta')) {
      setLanguage(route.params.selectedLanguage);
    }
  }, [route?.params?.selectedLanguage]);

  const activeLang = route?.params?.selectedLanguage || language || 'si';

  const continueToRegistration = () => {
    if (!selectedRole) return;

    navigation.navigate('RegistrationScreen', {
      selectedLanguage: activeLang,
      selectedRole,
    });
  };

  const ROLES = [
    {
      id: 'Farmer',
      title: strings.farmerTitle,
      desc: strings.farmerDesc,
      icon: 'sprout',
    },
    {
      id: 'Buyer',
      title: strings.buyerTitle,
      desc: strings.buyerDesc,
      icon: 'basket-outline',
    },
    {
      id: 'Driver',
      title: strings.driverTitle,
      desc: strings.driverDesc,
      icon: 'moped',
    },
  ];

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Subtle ambient light glow */}
        <View style={styles.ambientGlow} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header Card */}
          <View style={styles.headerWrapper}>
            <Image
              source={farmHeader}
              resizeMode="cover"
              accessibilityLabel="Fresh Vegi farmers harvesting vegetables"
              style={[styles.headerImage, { height: headerHeight }]}
            />
            <View style={styles.headerOverlay} />
            <View style={styles.topNavPill}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={20} color="#1B3820" />
              </Pressable>
              <Text style={styles.topNavTitle}>AgriMarketplace</Text>
              <View style={{ width: 36 }} />
            </View>
          </View>

          {/* Main Glass Panel */}
          <View style={styles.glassPanel}>
            <View style={styles.headingBlock}>
              <View style={styles.pillBadge}>
                <Ionicons name="sparkles" size={13} color="#2E7D32" />
                <Text style={styles.pillBadgeText}>{strings.personalize}</Text>
              </View>
              <Text style={styles.heading}>{strings.chooseRole}</Text>
              <Text style={styles.subtitle}>{strings.chooseRoleSub}</Text>
            </View>

            <View style={styles.roleChoices}>
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <Pressable
                    key={r.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => setSelectedRole(r.id)}
                    style={({ pressed }) => [
                      styles.roleCard,
                      isSelected && styles.roleCardSelected,
                      pressed && styles.roleCardPressed,
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.selectedCheckBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={r.icon}
                        size={28}
                        color={isSelected ? '#2E7D32' : '#5E6D62'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleLabel,
                        isSelected && styles.roleLabelSelected,
                      ]}
                    >
                      {r.title}
                    </Text>
                    <Text
                      style={[
                        styles.roleDescription,
                        isSelected && styles.roleDescriptionSelected,
                      ]}
                    >
                      {r.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: selectedRole === null }}
              disabled={selectedRole === null}
              onPress={continueToRegistration}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.continueText}>
                {selectedRole === 'Farmer'
                  ? strings.continueAsFarmer
                  : (selectedRole === 'Buyer' ? strings.continueAsBuyer : strings.continueAsDriver)}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#EDECEB',
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
    paddingTop: Platform.OS === 'web' ? 44 : 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerWrapper: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  headerImage: {
    width: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 40, 25, 0.22)',
  },
  topNavPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(16px)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  topNavTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  glassPanel: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(24px)',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    gap: 4,
  },
  pillBadgeText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  heading: {
    color: '#1B3820',
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#65746A',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  roleChoices: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
    minHeight: 140,
    paddingHorizontal: 6,
    paddingVertical: 14,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  roleCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#2E7D32',
    borderWidth: 2,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  roleCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
    marginBottom: 8,
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
  },
  roleLabel: {
    color: '#34453A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  roleLabelSelected: {
    color: '#1B3820',
  },
  roleDescription: {
    color: '#76857B',
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 14,
  },
  roleDescriptionSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 26,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});