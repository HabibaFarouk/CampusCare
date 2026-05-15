import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import authApi from '../../api/authApi';

const AddWorkerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing Info', 'Please enter name, email, and password.');
      return;
    }

    try {
      setLoading(true);
      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'WORKER',
      });
      Alert.alert('Success', 'Worker added successfully.');
      navigation.goBack();
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to add worker';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Worker</Text>
      <Text style={styles.subtitle}>Create a new worker account.</Text>

      <Input
        label="Full Name"
        placeholder="Worker name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <Input
        label="Email"
        placeholder="worker@campus.edu"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        placeholder="Temporary password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Create Worker" onPress={handleSubmit} loading={loading} />
      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        variant="secondary"
        style={styles.cancelButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f6f1ec',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default AddWorkerScreen;
