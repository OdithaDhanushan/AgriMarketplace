import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const farmHeader = require('../../../assets/onboarding/role-farm-header.png');

export default function RoleSelectionScreen({ navigation, route }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const { width } = useWindowDimensions();
  const headerHeight = Math.min(width * 0.45, 190);
  const selectedLanguage = route?.params?.selectedLanguage ?? route?.params?.language ?? 'en';

  const continueToRegistration = () => {
    if (!selectedRole) return;

    navigation.navigate('RegistrationScreen', {
      selectedLanguage,
      selectedRole,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Image
            source={farmHeader}
            resizeMode="cover"
            accessibilityLabel="Fresh Vegi farmers harvesting vegetables"
            style={[styles.headerImage, { height: headerHeight }]}
          />

          <LinearGradient
            colors={['#81ee50', '#4edb48']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.panel}
          >
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Choose your role</Text>
              <Text style={styles.subtitle}>How will you use Fresh Vegi?</Text>
            </View>

            <View style={styles.roleChoices}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedRole === 'Farmer' }}
                onPress={() => setSelectedRole('Farmer')}
                style={[styles.roleCard, selectedRole === 'Farmer' && styles.roleCardSelected]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    selectedRole === 'Farmer' && styles.iconCircleSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="sprout"
                    size={27}
                    color={selectedRole === 'Farmer' ? '#fff' : '#28743a'}
                  />
                </View>
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === 'Farmer' && styles.roleLabelSelected,
                  ]}
                >
                  Farmer
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    selectedRole === 'Farmer' && styles.roleDescriptionSelected,
                  ]}
                >
                  Sell your produce
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedRole === 'Buyer' }}
                onPress={() => setSelectedRole('Buyer')}
                style={[styles.roleCard, selectedRole === 'Buyer' && styles.roleCardSelected]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    selectedRole === 'Buyer' && styles.iconCircleSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="basket-outline"
                    size={27}
                    color={selectedRole === 'Buyer' ? '#fff' : '#28743a'}
                  />
                </View>
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === 'Buyer' && styles.roleLabelSelected,
                  ]}
                >
                  Buyer
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    selectedRole === 'Buyer' && styles.roleDescriptionSelected,
                  ]}
                >
                  Shop fresh produce
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: selectedRole === null }}
              disabled={selectedRole === null}
              onPress={continueToRegistration}
              style={[styles.continueButton, selectedRole === null && styles.continueButtonDisabled]}
            >
              <Text style={styles.continueText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f1fae9',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
  },
  panel: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flex: 1,
    marginTop: -8,
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 23,
  },
  heading: {
    color: '#1d5d2a',
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#39703c',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  roleChoices: {
    flexDirection: 'row',
    gap: 14,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(40, 116, 58, 0.24)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 142,
    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  roleCardSelected: {
    backgroundColor: '#28743a',
    borderColor: '#1e612e',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#1c522a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#e5f6dc',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  roleLabel: {
    color: '#1d5d2a',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 9,
  },
  roleLabelSelected: {
    color: '#fff',
  },
  roleDescription: {
    color: '#648167',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  roleDescriptionSelected: {
    color: '#e4f5df',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#28743a',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 23,
    minHeight: 52,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(40, 116, 58, 0.52)',
  },
  continueText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});