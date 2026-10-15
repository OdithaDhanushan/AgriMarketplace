import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { loginUser } from '../../services/api';

const produceIllustration = require('../../../assets/onboarding/login-produce.png');

export default function LoginScreen({ navigation, route }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { language, strings, setLanguage } = useLanguage();

  React.useEffect(() => {
    if (route?.params?.selectedLanguage && (route.params.selectedLanguage === 'si' || route.params.selectedLanguage === 'ta')) {
      setLanguage(route.params.selectedLanguage);
    }
  }, [route?.params?.selectedLanguage]);

  const showMessage = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showMessage(strings.signIn, strings.loginRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({
        identifier: identifier.trim(),
        password,
      });

      if (!result?.user || !result?.token) {
        throw new Error('Invalid login response.');
      }

      login({ user: result.user, token: result.token });

      const targetScreen = result.user.role === 'Admin'
        ? 'AdminDashboard'
        : (result.user.role === 'Farmer'
          ? 'FarmerProfile'
          : (result.user.role === 'Driver' ? 'DriverHome' : 'BuyerTabs'));
      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen }],
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to sign in. Please try again.';
      showMessage('Sign in failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setIdentifier('admin@agri.com');
    setPassword('Admin@12345');
    setIsSubmitting(true);
    try {
      const result = await loginUser({
        identifier: 'admin@agri.com',
        password: 'Admin@12345',
      });

      if (!result?.user || !result?.token) {
        throw new Error('Invalid login response.');
      }

      login({ user: result.user, token: result.token });

      navigation.reset({
        index: 0,
        routes: [{ name: 'AdminDashboard' }],
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to sign in as admin.';
      showMessage('Admin Sign in failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoDriverLogin = async () => {
    setIdentifier('driver@agri.com');
    setPassword('Driver@12345');
    setIsSubmitting(true);
    try {
      const result = await loginUser({
        identifier: 'driver@agri.com',
        password: 'Driver@12345',
      });

      if (!result?.user || !result?.token) {
        throw new Error('Invalid login response.');
      }

      login({ user: result.user, token: result.token });

      navigation.reset({
        index: 0,
        routes: [{ name: 'DriverHome' }],
      });
    } catch (error) {
      // If offline or first launch, allow direct navigation
      navigation.reset({
        index: 0,
        routes: [{ name: 'DriverHome' }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <MaterialCommunityIcons name="sprout" size={30} color="#238343" />
              </View>
              <Text style={styles.brandName}>
                <Text style={styles.brandFresh}>Fresh </Text>
                <Text style={styles.brandVegi}>Vegi</Text>
              </Text>
            </View>

            <View style={styles.glassCard}>
              <View style={styles.welcome}>
                <Text style={styles.title}>{strings.welcomeBack}</Text>
                <Text style={styles.subtitle}>{strings.signInSub}</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{strings.emailOrPhone}</Text>
                  <View style={styles.inputShell}>
                    <Ionicons name="person-outline" size={17} color="#68796d" />
                    <TextInput
                      accessibilityLabel={strings.emailOrPhone}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={setIdentifier}
                      placeholder={strings.emailOrPhonePlaceholder}
                      placeholderTextColor="#849188"
                      returnKeyType="next"
                      style={styles.input}
                      value={identifier}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{strings.password}</Text>
                  <View style={styles.inputShell}>
                    <Ionicons name="lock-closed-outline" size={17} color="#68796d" />
                    <TextInput
                      accessibilityLabel={strings.password}
                      onChangeText={setPassword}
                      placeholder={strings.passwordPlaceholder}
                      placeholderTextColor="#849188"
                      returnKeyType="done"
                      secureTextEntry={!isPasswordVisible}
                      style={styles.input}
                      value={password}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                      onPress={() => setIsPasswordVisible((visible) => !visible)}
                      hitSlop={10}
                    >
                      <Ionicons
                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={19}
                        color="#68796d"
                      />
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {}}
                    style={styles.forgotButton}
                  >
                    <Text style={styles.forgotText}>{strings.forgotPassword}</Text>
                  </Pressable>
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={handleLogin}
                  style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
                >
                  <LinearGradient
                    colors={['#17683a', '#2f9252']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.signInGradient}
                  >
                    <Text style={styles.signInText}>{isSubmitting ? strings.signingIn : strings.signIn}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#f0d15b" />
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>{strings.or}</Text>
                <View style={styles.separatorLine} />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.googleSignIn}
                onPress={() => {}}
                style={styles.googleButton}
              >
                <FontAwesome name="google" size={18} color="#4285f4" />
                <Text style={styles.googleText}>{strings.googleSignIn}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.adminDemo}
                onPress={handleDemoAdminLogin}
                style={styles.adminDemoButton}
              >
                <Ionicons name="shield-checkmark" size={17} color="#15803D" />
                <Text style={styles.adminDemoText}>{strings.adminDemo}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.driverDemo}
                onPress={handleDemoDriverLogin}
                style={[styles.adminDemoButton, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7', marginTop: 8 }]}
              >
                <Ionicons name="bicycle" size={17} color="#2E7D32" />
                <Text style={[styles.adminDemoText, { color: '#1B5E20' }]}>
                  {strings.driverDemo}
                </Text>
              </Pressable>

              <View style={styles.registerPrompt}>
                <Text style={styles.registerText}>{strings.noAccount} </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('RoleSelectionScreen', {
                    selectedLanguage: language,
                  })}
                  hitSlop={6}
                >
                  <Text style={styles.registerLink}>{strings.createAccount}</Text>
                </Pressable>
              </View>
            </View>

          <View style={styles.footer}>
              <Image
                source={produceIllustration}
                resizeMode="contain"
                accessibilityLabel="Fresh vegetables"
                style={styles.produceImage}
              />
              <Text style={styles.footerText}>Fresh from the farm. Closer to you.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EDECEB',
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 36 : 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 420,
    width: '100%',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    backdropFilter: 'blur(24px)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  brand: {
    alignItems: 'center',
    marginTop: 4,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    width: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  brandFresh: {
    color: '#1B5E20',
  },
  brandVegi: {
    color: '#2E7D32',
  },
  welcome: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  title: {
    color: '#193322',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#637367',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    gap: 14,
    marginTop: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#243D2C',
    fontSize: 12,
    fontWeight: '700',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 14,
  },
  input: {
    color: '#1F3325',
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    minWidth: 0,
    paddingVertical: 0,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  forgotText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  signInButton: {
    borderRadius: 25,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.65,
  },
  signInGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    gap: 8,
  },
  signInText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  separator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  separatorLine: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flex: 1,
    height: 1,
  },
  separatorText: {
    color: '#7B8B80',
    fontSize: 11,
    fontWeight: '600',
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(16px)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  googleText: {
    color: '#243a2c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  adminDemoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(240, 253, 244, 0.75)',
    backdropFilter: 'blur(16px)',
    borderColor: 'rgba(134, 239, 172, 0.6)',
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  adminDemoText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '700',
  },
  registerPrompt: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerText: {
    color: '#6D7C72',
    fontSize: 13,
  },
  registerLink: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  produceImage: {
    height: 48,
    width: 120,
  },
  footerText: {
    color: '#7D8C81',
    fontSize: 11,
    marginTop: 2,
  },
});