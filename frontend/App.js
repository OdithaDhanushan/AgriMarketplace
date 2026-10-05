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

const Stack = createNativeStackNavigator();

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.webContainer}>
      <View style={styles.phoneChassis}>
        {isWeb && <View style={styles.dynamicIsland} />}
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MarketPrices">
            <Stack.Screen name="MarketPrices" component={MarketPricesScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="ProductAddedSuccess" component={ProductAddedSuccess} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="OtherProducts" component={OtherProductsScreen} />
            <Stack.Screen name="VoiceListing" component={VoiceListingScreen} />
            <Stack.Screen name="FarmerProfile" component={FarmerProfileScreen} />
            <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />
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