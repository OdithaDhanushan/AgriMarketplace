import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser } from '../../services/api';

const COPY = {
  en: {
    title: 'Create Your Account',
    subtitle: 'Join our thriving agriculture community.',
    profile: 'Select Your Profile',
    farmer: 'Farmer',
    buyer: 'Buyer',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    location: 'Location',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    haveAccount: 'Already have an account?',
    login: 'Log In',
    required: 'Please fill in all fields.',
    invalidEmail: 'Enter a valid email address.',
    shortPassword: 'Password must be at least 8 characters.',
    mismatch: 'Passwords do not match.',
    duplicateEmail: 'An account with this email already exists.',
    backendUnavailable: 'Cannot reach the server. Check your connection and try again.',
    registrationFailed: 'Unable to create your account right now. Please try again.',
    success: 'Your account has been created.',
    continue: 'Continue',
  },
  si: {
    title: 'ඔබගේ ගිණුම සාදන්න',
    subtitle: 'අපගේ කෘෂිකාර්මික ප්‍රජාවට එක්වන්න.',
    profile: 'ඔබගේ පැතිකඩ තෝරන්න',
    farmer: 'ගොවියා',
    buyer: 'ගැනුම්කරු',
    fullName: 'සම්පූර්ණ නම',
    email: 'ඊමේල් ලිපිනය',
    phone: 'දුරකථන අංකය',
    location: 'ස්ථානය',
    password: 'මුරපදය',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    createAccount: 'ගිණුම සාදන්න',
    haveAccount: 'දැනටමත් ගිණුමක් තිබේද?',
    login: 'පිවිසෙන්න',
    required: 'කරුණාකර සියලුම ක්ෂේත්‍ර පුරවන්න.',
    invalidEmail: 'වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.',
    shortPassword: 'මුරපදය අවම වශයෙන් අක්ෂර 8ක් විය යුතුය.',
    mismatch: 'මුරපද ගැළපෙන්නේ නැත.',
    duplicateEmail: 'මෙම ඊමේල් ලිපිනයෙන් දැනටමත් ගිණුමක් ඇත.',
    backendUnavailable: 'සේවාදායකයට සම්බන්ධ විය නොහැක. නැවත උත්සාහ කරන්න.',
    registrationFailed: 'ගිණුම සෑදිය නොහැක. නැවත උත්සාහ කරන්න.',
    success: 'ඔබගේ ගිණුම සාදා ඇත.',
    continue: 'ඉදිරියට',
  },
  ta: {
    title: 'உங்கள் கணக்கை உருவாக்கவும்',
    subtitle: 'எங்கள் விவசாய சமூகத்தில் இணையுங்கள்.',
    profile: 'உங்கள் சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்',
    farmer: 'விவசாயி',
    buyer: 'வாங்குபவர்',
    fullName: 'முழுப் பெயர்',
    email: 'மின்னஞ்சல் முகவரி',
    phone: 'தொலைபேசி எண்',
    location: 'இடம்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    createAccount: 'கணக்கை உருவாக்கு',
    haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    login: 'உள்நுழைக',
    required: 'அனைத்து புலங்களையும் நிரப்பவும்.',
    invalidEmail: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
    shortPassword: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.',
    mismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
    duplicateEmail: 'இந்த மின்னஞ்சலில் ஏற்கனவே கணக்கு உள்ளது.',
    backendUnavailable: 'சேவையகத்தை அணுக முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    registrationFailed: 'கணக்கை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    success: 'உங்கள் கணக்கு உருவாக்கப்பட்டது.',
    continue: 'தொடரவும்',
  },
};

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  location: '',
};

export default function RegistrationScreen({ navigation, route }) {
  const [selectedRole, setSelectedRole] = useState(route?.params?.selectedRole ?? 'Farmer');
  const [selectedLanguage] = useState(route?.params?.selectedLanguage ?? 'en');
  const [form, setForm] = useState(INITIAL_FORM);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = COPY[selectedLanguage] ?? COPY.en;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const showMessage = (title, message, onContinue) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      onContinue?.();
      return;
    }
    Alert.alert(title, message, onContinue ? [{ text: copy.continue, onPress: onContinue }] : undefined);
  };

  const submitForm = async () => {
    if (isSubmitting) return;

    if (Object.values(form).some((value) => !value.trim())) {
      showMessage(copy.createAccount, copy.required);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showMessage(copy.createAccount, copy.invalidEmail);
      return;
    }

    if (form.password.length < 8) {
      showMessage(copy.createAccount, copy.shortPassword);
      return;
    }

    if (form.password !== form.confirmPassword) {
      showMessage(copy.confirmPassword, copy.mismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: selectedRole,
        language: selectedLanguage,
        location: form.location.trim(),
      });
      const responseUser = result.user ?? result;
      const safeUser = {
        id: responseUser.id ?? responseUser._id,
        name: responseUser.name,
        email: responseUser.email,
        phone: responseUser.phone,
        role: responseUser.role,
        language: responseUser.language,
        location: responseUser.location,
      };
      showMessage(copy.createAccount, copy.success, () =>
        navigation.replace('ProfileScreen', { user: safeUser })
      );
    } catch (error) {
      const status = error.response?.status;
      let message = copy.registrationFailed;
      if (status === 409 || error.response?.data?.code === 'EMAIL_EXISTS') {
        message = copy.duplicateEmail;
      } else if (status === 400) {
        message = error.response.data.message || copy.required;
      } else if (!error.response) {
        message = copy.backendUnavailable;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
      showMessage(copy.createAccount, message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = ({
    field,
    icon,
    label,
    keyboardType = 'default',
    secure = false,
    visible,
    onToggleVisibility,
    autoComplete,
    textContentType,
  }) => (
    <View style={styles.inputShell}>
      <MaterialCommunityIcons name={icon} size={23} color="#16492f" />
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        autoComplete={autoComplete}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={(value) => updateField(field, value)}
        placeholder={label}
        placeholderTextColor="#385848"
        secureTextEntry={secure && !visible}
        style={styles.input}
        textContentType={textContentType}
        value={form[field]}
      />
      {secure && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={10}
          onPress={onToggleVisibility}
        >
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#16492f"
          />
        </Pressable>
      )}
    </View>
  );

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
              <MaterialCommunityIcons name="sprout" size={32} color="#318b4a" />
              <Text style={styles.brandName}>Fresh Vegi</Text>
            </View>

            <View style={styles.headingBlock}>
              <Text style={styles.heading}>{copy.title}</Text>
              <Text style={styles.subtitle}>{copy.subtitle}</Text>
            </View>

            <Text style={styles.profileLabel}>{copy.profile}</Text>
            <View style={styles.roleSelector}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedRole === 'Farmer' }}
                onPress={() => setSelectedRole('Farmer')}
                style={[styles.roleOption, selectedRole === 'Farmer' && styles.roleOptionSelected]}
              >
                <MaterialCommunityIcons
                  name="tractor"
                  size={22}
                  color={selectedRole === 'Farmer' ? '#fff' : '#174b31'}
                />
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'Farmer' && styles.roleTextSelected,
                  ]}
                >
                  {copy.farmer}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedRole === 'Buyer' }}
                onPress={() => setSelectedRole('Buyer')}
                style={[styles.roleOption, selectedRole === 'Buyer' && styles.roleOptionSelected]}
              >
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={22}
                  color={selectedRole === 'Buyer' ? '#fff' : '#174b31'}
                />
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'Buyer' && styles.roleTextSelected,
                  ]}
                >
                  {copy.buyer}
                </Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              {renderField({
                field: 'fullName',
                icon: 'account-outline',
                label: copy.fullName,
                autoComplete: 'name',
                textContentType: 'name',
              })}
              {renderField({
                field: 'email',
                icon: 'email-outline',
                label: copy.email,
                keyboardType: 'email-address',
                autoComplete: 'email',
                textContentType: 'emailAddress',
              })}
              {renderField({
                field: 'phone',
                icon: 'phone-outline',
                label: copy.phone,
                keyboardType: 'phone-pad',
                autoComplete: 'tel',
                textContentType: 'telephoneNumber',
              })}
              {renderField({
                field: 'location',
                icon: 'map-marker-outline',
                label: copy.location,
                autoComplete: 'street-address',
                textContentType: 'fullStreetAddress',
              })}
              {renderField({
                field: 'password',
                icon: 'lock-outline',
                label: copy.password,
                secure: true,
                visible: passwordVisible,
                onToggleVisibility: () => setPasswordVisible((visible) => !visible),
                autoComplete: 'new-password',
                textContentType: 'newPassword',
              })}
              {renderField({
                field: 'confirmPassword',
                icon: 'lock-outline',
                label: copy.confirmPassword,
                secure: true,
                visible: confirmPasswordVisible,
                onToggleVisibility: () => setConfirmPasswordVisible((visible) => !visible),
                autoComplete: 'new-password',
                textContentType: 'newPassword',
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              onPress={submitForm}
              style={[styles.createButton, isSubmitting && styles.createButtonDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>{copy.createAccount}</Text>
              )}
            </Pressable>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>{copy.haveAccount} </Text>
              <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>{copy.login}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f2faef',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  content: {
    alignSelf: 'center',
    maxWidth: 480,
    paddingBottom: 20,
    paddingTop: 12,
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
  },
  brandName: {
    color: '#174b31',
    fontSize: 21,
    fontWeight: '700',
  },
  headingBlock: {
    alignItems: 'center',
    marginTop: 17,
  },
  heading: {
    color: '#123e28',
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: '#234936',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
  profileLabel: {
    color: '#183e2b',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 22,
    textAlign: 'center',
  },
  roleSelector: {
    alignSelf: 'center',
    backgroundColor: '#e9f4e9',
    borderColor: '#bfd6c0',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    maxWidth: 420,
    minHeight: 48,
    padding: 4,
    width: '100%',
  },
  roleOption: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 8,
  },
  roleOptionSelected: {
    backgroundColor: '#399e4e',
    elevation: 2,
    shadowColor: '#236c38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  roleText: {
    color: '#174b31',
    fontSize: 14,
    fontWeight: '600',
  },
  roleTextSelected: {
    color: '#fff',
  },
  form: {
    gap: 12,
    marginTop: 24,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(229, 243, 230, 0.62)',
    borderColor: '#5e9e6a',
    borderRadius: 28,
    borderWidth: 1.2,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 15,
  },
  input: {
    color: '#193c2b',
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    minWidth: 0,
    paddingVertical: 10,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#399e4e',
    borderRadius: 28,
    elevation: 4,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 56,
    shadowColor: '#1e6733',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  createButtonDisabled: {
    opacity: 0.75,
  },
  loginPrompt: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 17,
  },
  loginPromptText: {
    color: '#1e3225',
    fontSize: 13,
  },
  loginLink: {
    color: '#174b31',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});