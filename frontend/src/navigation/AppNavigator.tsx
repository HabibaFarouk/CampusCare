import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from './types';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './types';
import { useAuthStore } from '../store/authStore';

import DashboardScreen from '../screens/app/DashboardScreen';
import { IssueNavigator } from './IssueNavigator';
import ProfileScreen from '../screens/app/ProfileScreen';
import AdminScreen from '../screens/app/AdminScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Bottom tab navigator for the main application.
 * This is the primary navigation for authenticated users.
 * It conditionally renders the Admin tab based on the user's role.
 */
export function AppNavigator() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Issues" component={IssueNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {user?.role === 'ADMIN' && (
        <Tab.Screen name="Admin" component={AdminScreen} />
      )}
    </Tab.Navigator>
  );
}
