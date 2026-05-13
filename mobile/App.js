import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/auth/AuthContext';
import { NotificationProvider } from './src/utils/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationDisplay from './src/components/common/NotificationDisplay';
import { colors } from './src/theme';

// Two navigators when the user is logged in:
//   - AppTabs: bottom tabs based on user role
//   - AuthStack: login/register when user is not authenticated

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar style="auto" />
        <AppNavigator />
        <NotificationDisplay />
      </NotificationProvider>
    </AuthProvider>
  );
}
