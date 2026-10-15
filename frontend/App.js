import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarketPricesScreen from './src/screens/MarketPricesScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductAddedSuccess from './src/screens/ProductAddedSuccess';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import OtherProductsScreen from './src/screens/OtherProductsScreen';
import VoiceListingScreen from './src/screens/VoiceListingScreen';
import FarmerProfileScreen from './src/screens/FarmerProfileScreen';
import FarmerDashboardScreen from './src/screens/FarmerDashboardScreen';

import BuyerHomeScreen from './src/screens/buyer/BuyerHomeScreen';
import ProduceDetailScreen from './src/screens/buyer/ProduceDetailScreen';
import MyFarmersScreen from './src/screens/buyer/MyFarmersScreen';
import CartCheckoutScreen from './src/screens/buyer/CartCheckoutScreen';
import BuyerSearchScreen from './src/screens/buyer/BuyerSearchScreen';
import CheckoutScreen from './src/screens/buyer/CheckoutScreen';
import OtpVerificationScreen from './src/screens/buyer/OtpVerificationScreen';
import OrderConfirmedScreen from './src/screens/buyer/OrderConfirmedScreen';
import TrackOrderScreen from './src/screens/buyer/TrackOrderScreen';
import DeliveryJobScreen from './src/screens/buyer/DeliveryJobScreen';
import PickupScreen from './src/screens/buyer/PickupScreen';
import NavigationScreen from './src/screens/buyer/NavigationScreen';
import OfflineNavigationScreen from './src/screens/buyer/OfflineNavigationScreen';
import CompleteDeliveryScreen from './src/screens/buyer/CompleteDeliveryScreen';
import DriverHomeScreen from './src/screens/buyer/DriverHomeScreen';
import BuyerTabNavigator from './src/navigation/BuyerTabNavigator';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import OnboardingScreen1 from './src/screens/user-management/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/user-management/OnboardingScreen2';
import LanguageSelectionScreen from './src/screens/user-management/LanguageSelectionScreen';
import LoginScreen from './src/screens/user-management/LoginScreen';
import RoleSelectionScreen from './src/screens/user-management/RoleSelectionScreen';
import RegistrationScreen from './src/screens/user-management/RegistrationScreen';
import ProfileScreen from './src/screens/user-management/ProfileScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <AuthProvider>
      <CartProvider>
        <View style={styles.webContainer}>
          <View style={styles.phoneChassis}>
            {isWeb && <View style={styles.dynamicIsland} />}
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="OnboardingScreen1">
                <Stack.Screen name="BuyerTabs" component={BuyerTabNavigator} />
                <Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
                <Stack.Screen name="AddProduct" component={AddProductScreen} />
                <Stack.Screen name="ProductAddedSuccess" component={ProductAddedSuccess} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="SellerProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="OtherProducts" component={OtherProductsScreen} />
                <Stack.Screen name="VoiceListing" component={VoiceListingScreen} />
                <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
                <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />

                <Stack.Screen name="BuyerSearch" component={BuyerSearchScreen} />
                <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} />
                <Stack.Screen name="ProduceDetail" component={ProduceDetailScreen} />
                <Stack.Screen name="MyFarmers" component={MyFarmersScreen} />
                <Stack.Screen name="CartCheckout" component={CartCheckoutScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
                <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
                <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
                <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
                <Stack.Screen name="DeliveryJob" component={DeliveryJobScreen} />
                <Stack.Screen name="Pickup" component={PickupScreen} />
                <Stack.Screen name="Navigation" component={NavigationScreen} />
                <Stack.Screen name="OfflineNavigation" component={OfflineNavigationScreen} />
                <Stack.Screen name="CompleteDelivery" component={CompleteDeliveryScreen} />
                <Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
                <Stack.Screen name="OnboardingScreen2" component={OnboardingScreen2} />
                <Stack.Screen name="LanguageSelectionScreen" component={LanguageSelectionScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="RoleSelectionScreen" component={RoleSelectionScreen} />
                <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </View>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#C9C8C5' : '#EDECEB',
    alignItems: 'center',
    justifyContent: 'center',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    paddingVertical: Platform.OS === 'web' ? 18 : 0,
  },
  phoneChassis: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 420 : '100%',
    maxHeight: Platform.OS === 'web' ? 890 : '100%',
    backgroundColor: '#EDECEB',
    borderRadius: Platform.OS === 'web' ? 52 : 0,
    borderWidth: Platform.OS === 'web' ? 9 : 0,
    borderColor: '#1D1E20',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.28 : 0,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    elevation: 12,
  },
  dynamicIsland: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    width: 126,
    height: 30,
    backgroundColor: '#000000',
    borderRadius: 15,
    zIndex: 99999,
  },
});