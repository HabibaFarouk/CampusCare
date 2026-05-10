import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateMemoryScreen from './src/screens/CreateMemoryScreen';
import MemoryDetailScreen from './src/screens/MemoryDetailScreen';
import { colors } from './src/theme';

// Two navigators when the user is logged in:
//   - AppTabs: bottom tabs (Home, Create)
//   - HomeStack: nested stack inside the Home tab, so tapping a card can push
//     the MemoryDetail screen while keeping Home's state behind it.
// MemoryDetail is NOT a tab — it's a detail view you reach from the list.
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="MemoryDetail"
        component={MemoryDetailScreen}
        options={{ title: 'Memory' }}
      />
    </HomeStack.Navigator>
  );
}

// Hide the tab bar when we're on the detail screen — it's a focused reading
// view and looks cleaner full-height. On the list screen, tabs stay visible.
function hideTabsOnDetail(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  if (routeName === 'MemoryDetail') return { display: 'none' };
  return undefined;
}

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => ({
          title: 'Memories',
          tabBarStyle: hideTabsOnDetail(route) ?? {
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            height: 64,
            paddingTop: 6,
            paddingBottom: 10,
          },
          tabBarIcon: ({ focused }) => <TabIcon emoji="📔" focused={focused} />,
        })}
      />
      <Tabs.Screen
        name="CreateTab"
        component={CreateMemoryScreen}
        options={{
          title: 'New',
          headerShown: true,
          headerTitle: 'New Memory',
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  // Before we know whether there's a saved token, show a spinner so we don't
  // flash the Login screen to an already-logged-in user.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) return <AppTabs />;

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
