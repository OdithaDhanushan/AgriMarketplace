import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'freshvegi_language';

const readStoredLanguage = async () => {
  try {
    const raw = Platform.OS === 'web'
      ? (typeof window !== 'undefined' ? window.sessionStorage?.getItem(STORAGE_KEY) : null)
      : await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw === 'en' || raw === 'si' || raw === 'ta') {
      return raw;
    }
    return 'en'; // Default to English
  } catch (error) {
    console.warn('Language storage read failed:', error.message);
    return 'en';
  }
};

const persistLanguage = async (lang) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(STORAGE_KEY, lang);
      }
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, lang);
  } catch (error) {
    console.warn('Language storage write failed:', error.message);
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    readStoredLanguage().then((savedLang) => {
      if (isMounted) {
        setLanguageState(savedLang);
        setIsLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'si' || newLang === 'ta') {
      setLanguageState(newLang);
      persistLanguage(newLang);
    }
  };

  const t = (key, fallback = '') => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    return fallback || key;
  };

  const strings = TRANSLATIONS[language] || TRANSLATIONS.en;

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    strings,
    isEnglish: language === 'en',
    isSinhala: language === 'si',
    isTamil: language === 'ta',
    languages: SUPPORTED_LANGUAGES,
    isLoaded,
  }), [language, isLoaded]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback = '') => {
        const dict = TRANSLATIONS.en;
        return dict[key] || fallback || key;
      },
      strings: TRANSLATIONS.en,
      isEnglish: true,
      isSinhala: false,
      isTamil: false,
      languages: SUPPORTED_LANGUAGES,
      isLoaded: true,
    };
  }
  return context;
}
