import React from 'react';
import { FlatList, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { Issue } from '../../types/issue';
import IssueListItem from './IssueListItem';

const StyledView = styled(View);
const StyledText = styled(Text);

interface IssueListProps {
  issues: Issue[];
  isLoading: boolean;
  onRefresh: () => void;
  onPressItem: (issue: Issue) => void;
}

const IssueList: React.FC<IssueListProps> = ({
  issues,
  isLoading,
  onRefresh,
  onPressItem,
}) => {
  if (isLoading && issues.length === 0) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  if (issues.length === 0) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <StyledText className="text-gray-500">No issues found.</StyledText>
      </StyledView>
    );
  }

  return (
    <FlatList
      data={issues}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <IssueListItem issue={item} onPress={() => onPressItem(item)} />
      )}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    />
  );
};

export default IssueList;
