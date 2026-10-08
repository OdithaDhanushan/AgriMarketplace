import React, { useState } from 'react';
import {
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

const produceIllustration = require('../../../assets/onboarding/login-produce.png');

export default function LoginScreen({ navigation, route }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

            <View style={styles.welcome}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to Fresh Vegi</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email or Phone Number</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="person-outline" size={17} color="#68796d" />
                  <TextInput
                    accessibilityLabel="Email or Phone Number"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setIdentifier}
                    placeholder="Enter your email or phone number"
                    placeholderTextColor="#849188"
                    returnKeyType="next"
                    style={styles.input}
                    value={identifier}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="lock-closed-outline" size={17} color="#68796d" />
                  <TextInput
                    accessibilityLabel="Password"
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.replace('MarketPrices')}
                style={styles.signInButton}
              >
                <LinearGradient
                  colors={['#17683a', '#2f9252']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.signInGradient}
                >
                  <Text style={styles.signInText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#f0d15b" />
                </LinearGradient>
              </Pressable>
            </View>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              onPress={() => {}}
              style={styles.googleButton}
            >
              <FontAwesome name="google" size={18} color="#4285f4" />
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.registerPrompt}>
              <Text style={styles.registerText}>Don’t have an account? </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('RoleSelectionScreen', {
                  selectedLanguage: route?.params?.selectedLanguage ?? route?.params?.language ?? 'en',
                })}
                hitSlop={6}
              >
                <Text style={styles.registerLink}>Create Account</Text>
              </Pressable>
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
    backgroundColor: '#f8faf6',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 420,
    paddingBottom: 4,
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    marginTop: 12,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#244e32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 46,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 7,
  },
  brandFresh: {
    color: '#185a34',
  },
  brandVegi: {
    color: '#258443',
  },
  welcome: {
    alignItems: 'center',
    marginTop: 22,
  },
  title: {
    color: '#193d2b',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: '#77847a',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
    textAlign: 'center',
  },
  form: {
    gap: 17,
    marginTop: 26,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#1d3d2d',
    fontSize: 12,
    fontWeight: '600',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: '#f7faf6',
    borderColor: '#dce7dc',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    height: 49,
    paddingHorizontal: 13,
  },
  input: {
    color: '#243a2c',
    flex: 1,
    fontSize: 13,
    marginLeft: 11,
    minWidth: 0,
    paddingVertical: 0,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  forgotText: {
    color: '#188044',
    fontSize: 12,
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: 13,
    elevation: 4,
    marginTop: 1,
    overflow: 'hidden',
    shadowColor: '#1b683a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  signInGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 49,
    justifyContent: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  separatorLine: {
    backgroundColor: '#e1e8df',
    flex: 1,
    height: 1,
  },
  separatorText: {
    color: '#69776c',
    fontSize: 11,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dce7dc',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'center',
    marginTop: 16,
  },
  googleText: {
    color: '#243a2c',
    fontSize: 14,
    marginLeft: 12,
  },
  registerPrompt: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#78857b',
    fontSize: 12,
  },
  registerLink: {
    color: '#188044',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
  produceImage: {
    height: 55,
    width: 140,
  },
  footerText: {
    color: '#839087',
    fontSize: 10,
    marginTop: 3,
  },
});