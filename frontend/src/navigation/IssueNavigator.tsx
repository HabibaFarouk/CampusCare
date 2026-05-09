import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IssuesScreen from '../screens/app/IssuesScreen';
import IssueDetailScreen from '../screens/app/IssueDetailScreen';

// This defines the parameters for the screens within this specific stack.
export type IssueStackParamList = {
  IssueList: undefined;
  IssueDetail: { issueId: string };
};

const Stack = createNativeStackNavigator<IssueStackParamList>();

/**
 * A stack navigator for the Issues feature.
 * It includes the list of issues and the detail view for a single issue.
 * This allows users to navigate from the list to a detail view and back.
 */
export function IssueNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We will use custom headers in screens
      }}
    >
      <Stack.Screen name="IssueList" component={IssuesScreen} />
      <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
    </Stack.Navigator>
  );
}
