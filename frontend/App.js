import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Member 1 (Farmer) Screens
import MarketPricesScreen from './src/screens/MarketPricesScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductAddedSuccess from './src/screens/ProductAddedSuccess';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import OtherProductsScreen from './src/screens/OtherProductsScreen';
import VoiceListingScreen from './src/screens/VoiceListingScreen';
import FarmerProfileScreen from './src/screens/FarmerProfileScreen';
import FarmerDashboardScreen from './src/screens/FarmerDashboardScreen';

// Import Member 2 (Buyer) Screens (Merged from main)
import BuyerHomeScreen from './src/screens/buyer/BuyerHomeScreen';
import ProduceDetailScreen from './src/screens/buyer/ProduceDetailScreen';
import MyFarmersScreen from './src/screens/buyer/MyFarmersScreen';
import CartCheckoutScreen from './src/screens/buyer/CartCheckoutScreen';
import BuyerSearchScreen from './src/screens/buyer/BuyerSearchScreen';
import BuyerProductDetailScreen from './src/screens/buyer/ProductDetailScreen';
import CheckoutScreen from './src/screens/buyer/CheckoutScreen';
import OtpVerificationScreen from './src/screens/buyer/OtpVerificationScreen';
import OrderConfirmedScreen from './src/screens/buyer/OrderConfirmedScreen';
import OnboardingScreen1 from './src/screens/user-management/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/user-management/OnboardingScreen2';
import LanguageSelectionScreen from './src/screens/user-management/LanguageSelectionScreen';
import LoginScreen from './src/screens/user-management/LoginScreen';
import RoleSelectionScreen from './src/screens/user-management/RoleSelectionScreen';
import RegistrationScreen from './src/screens/user-management/RegistrationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.webContainer}>
      <View style={styles.phoneChassis}>
        {isWeb && <View style={styles.dynamicIsland} />}
        
        {/* SINGLE ENCLOSING ROOT TAG FOR NAVIGATION */}
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="OnboardingScreen1">
            {/* Member 1 Farmer Screens */}
            <Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="ProductAddedSuccess" component={ProductAddedSuccess} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="OtherProducts" component={OtherProductsScreen} />
            <Stack.Screen name="VoiceListing" component={VoiceListingScreen} />
            <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
            <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />

            {/* Member 2 Buyer Screens */}
            <Stack.Screen name="BuyerSearch" component={BuyerSearchScreen} />
            <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} />
            <Stack.Screen name="MyFarmers" component={MyFarmersScreen} />
            <Stack.Screen name="CartCheckout" component={CartCheckoutScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />

            {/* User Management Onboarding Screens */}
            <Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
            <Stack.Screen name="OnboardingScreen2" component={OnboardingScreen2} />
            <Stack.Screen name="LanguageSelectionScreen" component={LanguageSelectionScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RoleSelectionScreen" component={RoleSelectionScreen} />
            <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#d8e1ea' : '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    paddingVertical: Platform.OS === 'web' ? 24 : 0,
  },
  phoneChassis: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 412 : '100%',
    maxHeight: Platform.OS === 'web' ? 860 : '100%',
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'web' ? 48 : 0,
    borderWidth: Platform.OS === 'web' ? 10 : 0,
    borderColor: '#111827',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.25 : 0,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 36,
    elevation: 10,
  },
  dynamicIsland: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 110,
    height: 26,
    backgroundColor: '#000',
    borderRadius: 13,
    zIndex: 99999,
  },
});