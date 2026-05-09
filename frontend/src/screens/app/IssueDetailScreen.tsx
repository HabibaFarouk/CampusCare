import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { styled } from 'nativewind';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useIssueStore } from '../../store/issueStore';
import { useAuthStore } from '../../store/authStore';
import { AppStackParamList } from '../../navigation/types'; // Assuming you'll create this
import { priorityColors, statusColors } from '../../components/issues/IssueListItem'; // Re-use styles

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);

type IssueDetailScreenRouteProp = RouteProp<AppStackParamList, 'IssueDetail'>;

export default function IssueDetailScreen() {
  const route = useRoute<IssueDetailScreenRouteProp>();
  const { issueId } = route.params;

  const { user } = useAuthStore();
  const { selectedIssue, isLoading, error, fetchIssueById } = useIssueStore();

  useEffect(() => {
    fetchIssueById(issueId);
  }, [issueId, fetchIssueById]);

  const onRefresh = () => fetchIssueById(issueId);

  if (isLoading && !selectedIssue) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 justify-center items-center p-4">
        <StyledText className="text-red-500 text-center">{error}</StyledText>
      </StyledView>
    );
  }

  if (!selectedIssue) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <StyledText>Issue not found.</StyledText>
      </StyledView>
    );
  }

  const priorityStyle = priorityColors[selectedIssue.priority];
  const statusStyle = statusColors[selectedIssue.status];

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-50">
      <StyledScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        <StyledView className="bg-white p-5 rounded-lg shadow-md">
          {/* Header */}
          <StyledView className="border-b border-gray-200 pb-4 mb-4">
            <StyledText className="text-2xl font-bold text-gray-900">{selectedIssue.title}</StyledText>
            <StyledText className="text-sm text-gray-500 mt-1">
              Reported by {selectedIssue.author.firstName} {selectedIssue.author.lastName} on {new Date(selectedIssue.createdAt).toLocaleDateString()}
            </StyledText>
          </StyledView>

          {/* Status and Priority */}
          <StyledView className="flex-row justify-start items-center mb-4 space-x-4">
            <StyledView className={`px-3 py-1 rounded-full ${priorityStyle.split(' ')[0]}`}>
              <StyledText className={`font-semibold ${priorityStyle.split(' ')[1]}`}>{selectedIssue.priority}</StyledText>
            </StyledView>
            <StyledView className={`px-3 py-1 rounded-full border ${statusStyle}`}>
                <StyledText className="font-semibold">{selectedIssue.status}</StyledText>
            </StyledView>
          </StyledView>

          {/* Description */}
          <StyledView className="mb-4">
            <StyledText className="text-lg font-semibold text-gray-800 mb-2">Description</StyledText>
            <StyledText className="text-base text-gray-700">{selectedIssue.description}</StyledText>
          </StyledView>

          {/* Location */}
          <StyledView>
            <StyledText className="text-lg font-semibold text-gray-800 mb-2">Location</StyledText>
            <StyledText className="text-base text-gray-700">{selectedIssue.location}</StyledText>
          </StyledView>
        </StyledView>

        {/* Placeholder for actions */}
        <StyledView className="mt-6">
            {/* Role-specific actions will be rendered here */}
        </StyledView>

        {/* Placeholder for comments */}
        <StyledView className="mt-6 bg-white p-5 rounded-lg shadow-md">
            <StyledText className="text-lg font-semibold text-gray-800 mb-2">Comments</StyledText>
            {/* Comments list will be rendered here */}
        </StyledView>

      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
