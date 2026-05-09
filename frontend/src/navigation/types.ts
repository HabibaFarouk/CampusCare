import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// =======================================================================
// Root Navigator: The main navigator that decides between Auth and App
// =======================================================================

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>; // Screens for unauthenticated users
  App: NavigatorScreenParams<AppTabParamList>;   // Screens for authenticated users
  NotFound: undefined;
};

// Prop types for screens in the Root Navigator
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// =======================================================================
// Auth Navigator: Handles login, registration, etc.
// =======================================================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Prop types for screens in the Auth Navigator
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// =======================================================================
// App Stack Navigator: Handles navigation within the main app (post-auth)
// =======================================================================
export type AppStackParamList = {
    Tabs: NavigatorScreenParams<AppTabParamList>; // The main tab navigator
    IssueDetail: { issueId: string }; // Detail screen for a single issue
    CreateIssue: undefined; // Screen to create a new issue
};

// Prop types for screens in the App Tab Navigator
export type AppTabScreenProps<T extends keyof AppTabParamList> =
  NativeStackScreenProps<AppTabParamList, T>;

// =======================================================================
// Combining with global namespace for type safety with useNavigation
// =======================================================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
