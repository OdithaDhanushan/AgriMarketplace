import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import BuyerHomeScreen from '../screens/buyer/BuyerHomeScreen';
import CartCheckoutScreen from '../screens/buyer/CartCheckoutScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

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
  muted: '#7A867E',
  glass: 'rgba(255, 255, 255, 0.84)',
  border: 'rgba(255, 255, 255, 0.95)',
};

export default function BuyerTabNavigator() {
  const { totalCount } = useCart();
  const { strings } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarBadge: route.name === 'CartTab' && totalCount > 0 ? totalCount : undefined,
        tabBarStyle: {
          position: 'absolute',
          bottom: 14,
          left: 16,
          right: 16,
          backgroundColor: COLORS.glass,
          backdropFilter: 'blur(24px)',
          borderRadius: 26,
          borderWidth: 1.5,
          borderColor: COLORS.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            ExploreTab: focused ? 'search' : 'search-outline',
            CartTab: focused ? 'cart' : 'cart-outline',
            OrdersTab: focused ? 'receipt' : 'receipt-outline',
            ProfileTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ExploreTab"
        component={BuyerHomeScreen}
        options={{ tabBarLabel: strings.home }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{ tabBarLabel: strings.cart }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ tabBarLabel: strings.orders }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: strings.profile }}
      />
    </Tab.Navigator>
  );
}
