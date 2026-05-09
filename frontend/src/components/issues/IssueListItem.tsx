import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Issue, PriorityLevel, IssueStatus } from '../../types/issue';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface IssueListItemProps {
  issue: Issue;
  onPress: () => void;
}

const priorityColors: { [key in PriorityLevel]: string } = {
  LOW: 'bg-green-200 text-green-800',
  MEDIUM: 'bg-yellow-200 text-yellow-800',
  HIGH: 'bg-orange-200 text-orange-800',
  URGENT: 'bg-red-200 text-red-800',
};

const statusColors: { [key in IssueStatus]: string } = {
  OPEN: 'border-blue-500',
  IN_PROGRESS: 'border-yellow-500',
  RESOLVED: 'border-green-500',
  CLOSED: 'border-gray-500',
  REOPENED: 'border-purple-500',
};

const IssueListItem: React.FC<IssueListItemProps> = ({ issue, onPress }) => {
  const priorityStyle = priorityColors[issue.priority] || 'bg-gray-200 text-gray-800';
  const statusStyle = statusColors[issue.status] || 'border-gray-400';

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className={`bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 ${statusStyle}`}
    >
      <StyledView className="flex-row justify-between items-start">
        <StyledText className="text-lg font-bold text-gray-800 flex-1 mr-2" numberOfLines={1}>
          {issue.title}
        </StyledText>
        <StyledView className={`px-2 py-1 rounded-full ${priorityStyle.split(' ')[0]}`}>
          <StyledText className={`text-xs font-semibold ${priorityStyle.split(' ')[1]}`}>
            {issue.priority}
          </StyledText>
        </StyledView>
      </StyledView>
      <StyledText className="text-gray-600 mt-1" numberOfLines={2}>
        {issue.description}
      </StyledText>
      <StyledView className="flex-row justify-between items-center mt-3">
        <StyledText className="text-sm text-gray-500">
          Reported by: {issue.author.firstName}
        </StyledText>
        <StyledText className="text-sm text-gray-500">
          {new Date(issue.createdAt).toLocaleDateString()}
        </StyledText>
      </StyledView>
    </StyledTouchableOpacity>
  );
};

export default IssueListItem;
