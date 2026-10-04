import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarketPricesScreen from './src/screens/MarketPricesScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductAddedSuccess from './src/screens/ProductAddedSuccess';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import OtherProductsScreen from './src/screens/OtherProductsScreen';
import VoiceListingScreen from './src/screens/VoiceListingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MarketPrices">
        <Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="ProductAddedSuccess" component={ProductAddedSuccess} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="OtherProducts" component={OtherProductsScreen} />
        <Stack.Screen name="VoiceListing" component={VoiceListingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}