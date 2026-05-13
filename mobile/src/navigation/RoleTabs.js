import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../auth/AuthContext';
import { USER_ROLES } from '../utils/constants';

/**
 * RoleTabs Component
 * Creates conditional bottom tabs based on user role
 * Each role gets a customized tab navigation experience
 */

const Tab = createBottomTabNavigator();

const RoleTabs = ({
  memberScreens = [],
  workerScreens = [],
  managerScreens = [],
  adminScreens = [],
}) => {
  const { user } = useContext(AuthContext);

  const getScreensForRole = (role) => {
    switch (role) {
      case USER_ROLES.MEMBER:
        return memberScreens;
      case USER_ROLES.WORKER:
        return workerScreens;
      case USER_ROLES.FACILITY_MANAGER:
        return managerScreens;
      case USER_ROLES.ADMIN:
        return adminScreens;
      default:
        return [];
    }
  };

  const screens = getScreensForRole(user?.role);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {screens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: screen.label,
            tabBarIcon: screen.icon,
            title: screen.title,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default RoleTabs;
