import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from './AuthContext';

/**
 * RoleGate Component
 * Restricts UI elements based on user role
 * Usage: <RoleGate roles={['MEMBER', 'FACILITY_MANAGER']}>
 *          <MyComponent />
 *        </RoleGate>
 */
const RoleGate = ({ children, roles, fallback = null }) => {
  const { user } = useContext(AuthContext);

  if (!user || !roles.includes(user.role)) {
    return fallback || null;
  }

  return <>{children}</>;
};

export default RoleGate;
