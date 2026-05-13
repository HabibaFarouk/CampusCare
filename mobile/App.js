import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/auth/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

// Two navigators when the user is logged in:
//   - AppTabs: bottom tabs based on user role
//   - AuthStack: login/register when user is not authenticated

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
