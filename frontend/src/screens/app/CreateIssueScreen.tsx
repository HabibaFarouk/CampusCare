import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { styled } from 'nativewind';
import { useIssueStore } from '../../store/issueStore';
import { CreateIssueData, PriorityLevel } from '../../types/issue';
// A picker component might be needed. For now, using simple buttons.
// import { Picker } from '@react-native-picker/picker';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export default function CreateIssueScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const { createIssue, isLoading } = useIssueStore();

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    const issueData: CreateIssueData = {
      title,
      description,
      location,
      priority,
    };

    try {
      await createIssue(issueData);
      Alert.alert('Success', 'Issue has been reported successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to report issue.');
    }
  };

  const PriorityButton = ({ level }: { level: PriorityLevel }) => (
    <StyledTouchableOpacity
      className={`px-4 py-2 rounded-full border-2 ${
        priority === level ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
      }`}
      onPress={() => setPriority(level)}
    >
      <StyledText className={`${priority === level ? 'text-white' : 'text-gray-700'}`}>
        {level}
      </StyledText>
    </StyledTouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <StyledScrollView contentContainerStyle={{ padding: 16 }}>
        <StyledText className="text-3xl font-bold text-gray-800 mb-6">Report a New Issue</StyledText>

        <StyledText className="text-lg font-semibold text-gray-700 mb-2">Title</StyledText>
        <StyledTextInput
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-lg"
          placeholder="e.g., Leaky faucet in restroom"
          value={title}
          onChangeText={setTitle}
        />

        <StyledText className="text-lg font-semibold text-gray-700 mb-2">Description</StyledText>
        <StyledTextInput
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-4 text-lg h-24"
          placeholder="Provide a detailed description of the issue."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <StyledText className="text-lg font-semibold text-gray-700 mb-2">Location</StyledText>
        <StyledTextInput
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 mb-6 text-lg"
          placeholder="e.g., 2nd floor, men's room"
          value={location}
          onChangeText={setLocation}
        />

        <StyledText className="text-lg font-semibold text-gray-700 mb-3">Priority</StyledText>
        <StyledView className="flex-row justify-around mb-8">
          <PriorityButton level="LOW" />
          <PriorityButton level="MEDIUM" />
          <PriorityButton level="HIGH" />
          <PriorityButton level="URGENT" />
        </StyledView>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : (
          <StyledTouchableOpacity
            className="w-full bg-blue-600 rounded-lg py-4"
            onPress={handleSubmit}
          >
            <StyledText className="text-center text-white font-bold text-lg">
              Submit Issue
            </StyledText>
          </StyledTouchableOpacity>
        )}
         <StyledTouchableOpacity
            className="w-full bg-gray-200 rounded-lg py-4 mt-4"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-center text-gray-700 font-bold text-lg">
              Cancel
            </StyledText>
          </StyledTouchableOpacity>
      </StyledScrollView>
    </KeyboardAvoidingView>
  );
}
