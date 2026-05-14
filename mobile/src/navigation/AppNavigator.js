import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import RoleGate from '../auth/RoleGate';

// Shared screens
import LoginScreen from '../screens/shared/LoginScreen';
import RegisterScreen from '../screens/shared/RegisterScreen';
import IssueDetailScreen from '../screens/shared/IssueDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import ForgotPasswordScreen from '../screens/shared/ForgotPasswordScreen';

// Member screens
import MyIssuesScreen from '../screens/member/MyIssuesScreen';
import ReportIssueScreen from '../screens/member/ReportIssueScreen';

// Worker screens
import AssignedTasksScreen from '../screens/worker/AssignedTasksScreen';

// Manager screens
import FMDashboard from '../screens/manager/FMDashboard';
import WorkerMgmtScreen from '../screens/manager/WorkerMgmtScreen';
import AddWorkerScreen from '../screens/manager/AddWorkerScreen';
import IssueListScreen from '../screens/manager/IssueListScreen';
import ReportsScreen from '../screens/manager/ReportsScreen';
import WorkerDetailScreen from '../screens/manager/WorkerDetailScreen';

// Admin screens
import UserMgmtScreen from '../screens/admin/UserMgmtScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Member Tab Navigation
const MemberTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
      },
    }}
  >
    <Tab.Screen
      name="MyIssuesTab"
      component={MyIssuesScreen}
      options={{
        title: 'My Issues',
        tabBarLabel: 'Issues',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📋</Text>,
      }}
    />
    <Tab.Screen
      name="ReportIssueTab"
      component={ReportIssueScreen}
      options={{
        title: 'Report Issue',
        tabBarLabel: 'Report',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>➕</Text>,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const MemberStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="MemberTabs"
      component={MemberTabs}
    />
    <Stack.Screen
      name="IssueDetail"
      component={IssueDetailScreen}
      options={{ headerShown: true, title: 'Issue Details' }}
    />
  </Stack.Navigator>
);

// Worker Tab Navigation
const WorkerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
      },
    }}
  >
    <Tab.Screen
      name="AssignedTasksTab"
      component={AssignedTasksScreen}
      options={{
        title: 'Assigned Tasks',
        tabBarLabel: 'Tasks',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🔧</Text>,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const WorkerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="WorkerTabs"
      component={WorkerTabs}
    />
    <Stack.Screen
      name="IssueDetail"
      component={IssueDetailScreen}
      options={{ headerShown: true, title: 'Task Details' }}
    />
  </Stack.Navigator>
);

// Manager Tab Navigation
const ManagerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
      },
    }}
  >
    <Tab.Screen
      name="FMDashboardTab"
      component={FMDashboard}
      options={{
        title: 'Dashboard',
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📊</Text>,
      }}
    />
    <Tab.Screen
      name="WorkerMgmtTab"
      component={WorkerMgmtScreen}
      options={{
        title: 'Worker Management',
        tabBarLabel: 'Workers',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👷</Text>,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const ManagerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="ManagerTabs"
      component={ManagerTabs}
    />
    <Stack.Screen
      name="AddWorker"
      component={AddWorkerScreen}
      options={{ headerShown: true, title: 'Add Worker' }}
    />
    <Stack.Screen
      name="IssueDetail"
      component={IssueDetailScreen}
      options={{ headerShown: true, title: 'Issue Details' }}
    />
    <Stack.Screen
      name="IssueList"
      component={IssueListScreen}
      options={{ headerShown: true, title: 'Issue List' }}
    />
    <Stack.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ headerShown: true, title: 'Reports' }}
    />
    <Stack.Screen
      name="WorkerDetail"
      component={WorkerDetailScreen}
      options={{ headerShown: true, title: 'Worker Details' }}
    />
  </Stack.Navigator>
);

// Admin Tab Navigation
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
      },
    }}
  >
    <Tab.Screen
      name="UserMgmtTab"
      component={UserMgmtScreen}
      options={{
        title: 'User Management',
        tabBarLabel: 'Users',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👥</Text>,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="AdminTabs"
      component={AdminTabs}
    />
  </Stack.Navigator>
);

const AppStack = ({ user }) => {
  if (user?.role === 'MEMBER') {
    return <MemberStack />;
  }
  if (user?.role === 'WORKER') {
    return <WorkerStack />;
  }
  if (user?.role === 'FACILITY_MANAGER') {
    return <ManagerStack />;
  }
  if (user?.role === 'ADMIN') {
    return <AdminStack />;
  }
  return null;
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
