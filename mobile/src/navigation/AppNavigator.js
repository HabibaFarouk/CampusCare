import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import RoleGate from '../auth/RoleGate';

// Shared screens
import LoginScreen from '../screens/shared/LoginScreen';
import RegisterScreen from '../screens/shared/RegisterScreen';
import IssueDetailScreen from '../screens/shared/IssueDetailScreen';

// Member screens
import MyIssuesScreen from '../screens/member/MyIssuesScreen';
import ReportIssueScreen from '../screens/member/ReportIssueScreen';

// Worker screens
import AssignedTasksScreen from '../screens/worker/AssignedTasksScreen';

// Manager screens
import FMDashboard from '../screens/manager/FMDashboard';
import WorkerMgmtScreen from '../screens/manager/WorkerMgmtScreen';

// Admin screens
import UserMgmtScreen from '../screens/admin/UserMgmtScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MemberStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MyIssues"
      component={MyIssuesScreen}
      options={{ title: 'My Issues' }}
    />
    <Stack.Screen
      name="ReportIssue"
      component={ReportIssueScreen}
      options={{ title: 'Report Issue' }}
    />
    <Stack.Screen
      name="IssueDetail"
      component={IssueDetailScreen}
      options={{ title: 'Issue Details' }}
    />
  </Stack.Navigator>
);

const WorkerStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AssignedTasks"
      component={AssignedTasksScreen}
      options={{ title: 'Assigned Tasks' }}
    />
    <Stack.Screen
      name="IssueDetail"
      component={IssueDetailScreen}
      options={{ title: 'Task Details' }}
    />
  </Stack.Navigator>
);

const ManagerStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="FMDashboard"
      component={FMDashboard}
      options={{ title: 'Dashboard' }}
    />
    <Stack.Screen
      name="WorkerMgmt"
      component={WorkerMgmtScreen}
      options={{ title: 'Worker Management' }}
    />
    <Stack.Screen
      name="IssueDetail"
      component={IssueDetailScreen}
      options={{ title: 'Issue Details' }}
    />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="UserMgmt"
      component={UserMgmtScreen}
      options={{ title: 'User Management' }}
    />
  </Stack.Navigator>
);

const AppStack = ({ user }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {user?.role === 'MEMBER' && (
        <Stack.Screen
          name="MemberApp"
          component={MemberStack}
          options={{ headerShown: false }}
        />
      )}
      {user?.role === 'WORKER' && (
        <Stack.Screen
          name="WorkerApp"
          component={WorkerStack}
          options={{ headerShown: false }}
        />
      )}
      {user?.role === 'FACILITY_MANAGER' && (
        <Stack.Screen
          name="ManagerApp"
          component={ManagerStack}
          options={{ headerShown: false }}
        />
      )}
      {user?.role === 'ADMIN' && (
        <Stack.Screen
          name="AdminApp"
          component={AdminStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStack user={user} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
