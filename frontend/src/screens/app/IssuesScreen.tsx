import React, { useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';
import { useIssueStore } from '../../store/issueStore';
import { useAuthStore } from '../../store/authStore';
import IssueList from '../../components/issues/IssueList';
import { useFocusEffect } from '@react-navigation/native';
import { Issue } from '../../types/issue';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function IssuesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const {
    issues,
    userIssues,
    assignedIssues,
    isLoading,
    error,
    fetchIssues,
  } = useIssueStore();

  const loadIssues = useCallback(() => {
    if (user?.role) {
      fetchIssues(user.role);
    }
  }, [user, fetchIssues]);

  // useFocusEffect to re-fetch issues when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadIssues();
    }, [loadIssues])
  );

  const getIssuesForRole = () => {
    switch (user?.role) {
      case 'ADMIN':
      case 'FACILITY_MANAGER':
        return issues;
      case 'COMMUNITY_MEMBER':
        return userIssues;
      case 'WORKER':
        return assignedIssues;
      default:
        return [];
    }
  };

  const handlePressItem = (issue: Issue) => {
    navigation.navigate('IssueDetail', { issueId: issue.id });
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-100">
      <StyledView className="p-4 border-b border-gray-200 bg-white">
        <StyledText className="text-2xl font-bold text-center">Issues</StyledText>
      </StyledView>
      {error && (
        <StyledView className="p-4 bg-red-100">
          <StyledText className="text-red-700">{error}</StyledText>
        </StyledView>
      )}
      <IssueList
        issues={getIssuesForRole()}
        isLoading={isLoading}
        onRefresh={loadIssues}
        onPressItem={handlePressItem}
      />
    </StyledSafeAreaView>
  );
}
