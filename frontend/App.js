import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import AddProductScreen from './src/screens/AddProductScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8f5e9' }}>
      <StatusBar barStyle="dark-content" />
      <AddProductScreen />
    </SafeAreaView>
  );
}