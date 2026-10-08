import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import BuyerSearchScreen from '../screens/buyer/BuyerSearchScreen';
import CartCheckoutScreen from '../screens/buyer/CartCheckoutScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';

const Tab = createBottomTabNavigator();
const CartStack = createNativeStackNavigator();

// Wrap CartCheckout in a stack so it can still navigate to Checkout, etc.
function CartStackNavigator({ navigation: tabNav }) {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="CartCheckoutMain" component={CartCheckoutScreen} />
    </CartStack.Navigator>
  );
}

const COLORS = {
  green: '#2E7D32',
  muted: '#68736B',
  white: '#FFFFFF',
  line: '#E5EAE6',
};

export default function BuyerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.line,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Explore: 'search',
            'My Cart': 'cart-outline',
            Orders: 'receipt-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={BuyerSearchScreen} />
      <Tab.Screen name="My Cart" component={CartStackNavigator} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
