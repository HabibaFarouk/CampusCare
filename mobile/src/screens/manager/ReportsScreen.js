import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Button from '../../components/common/Button';

const ReportsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Reports</Text>
    <Text style={styles.subtitle}>
      This screen will show manager reports and analytics.
    </Text>
    <Button title="Back" onPress={() => navigation.goBack()} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ReportsScreen;
