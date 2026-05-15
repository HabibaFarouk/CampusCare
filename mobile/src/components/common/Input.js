import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  // ViewPropTypes is removed from here
} from 'react-native';
// Removed the prop-types import

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1d1d1b', // theme text
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6dac3', // theme border
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1d1d1b', // theme text
    backgroundColor: '#fcfaf8', // theme surface
  },
  inputError: {
    borderColor: '#ef4444', // theme danger
    backgroundColor: '#fee2e2', // theme dangerSoft
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

// Removed the Input.propTypes block entirely

export default Input;