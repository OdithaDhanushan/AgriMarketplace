import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarketPricesScreen from './src/screens/MarketPricesScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductAddedSuccess from './src/screens/ProductAddedSuccess';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import OtherProductsScreen from './src/screens/OtherProductsScreen';
import VoiceListingScreen from './src/screens/VoiceListingScreen';
import BuyerHomeScreen from './src/screens/buyer/BuyerHomeScreen';
import ProduceDetailScreen from './src/screens/buyer/ProduceDetailScreen';
import MyFarmersScreen from './src/screens/buyer/MyFarmersScreen';
import CartCheckoutScreen from './src/screens/buyer/CartCheckoutScreen';
import BuyerSearchScreen from './src/screens/buyer/BuyerSearchScreen';
import BuyerProductDetailScreen from './src/screens/buyer/ProductDetailScreen';
import CheckoutScreen from './src/screens/buyer/CheckoutScreen';
import OtpVerificationScreen from './src/screens/buyer/OtpVerificationScreen';
import OrderConfirmedScreen from './src/screens/buyer/OrderConfirmedScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="BuyerSearch">
        <Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="ProductAddedSuccess" component={ProductAddedSuccess} />
        <Stack.Screen name="SellerProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="OtherProducts" component={OtherProductsScreen} />
        <Stack.Screen name="VoiceListing" component={VoiceListingScreen} />
        <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} />
        <Stack.Screen name="ProduceDetail" component={ProduceDetailScreen} />
        <Stack.Screen name="MyFarmers" component={MyFarmersScreen} />
        <Stack.Screen name="CartCheckout" component={CartCheckoutScreen} />
        <Stack.Screen name="BuyerSearch" component={BuyerSearchScreen} />
        <Stack.Screen name="ProductDetail" component={BuyerProductDetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}