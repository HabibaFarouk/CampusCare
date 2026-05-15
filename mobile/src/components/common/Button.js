import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  ...props
}) => {
  const getStyles = () => {
    const baseStyle = [styles.button, styles[variant], styles[`size_${size}`]];
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, styles[`text_${variant}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#e6dac3', // theme primary
  },
  action: {
    backgroundColor: '#9b483e', // theme action
  },
  secondary: {
    backgroundColor: '#f0ece7', // theme surfaceAlt
  },
  danger: {
    backgroundColor: '#ef4444',
  },
  success: {
    backgroundColor: '#10b981',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  text_primary: {
    color: '#3a3532', // theme primaryText
  },
  text_action: {
    color: '#ffffff', // theme actionText
  },
  text_secondary: {
    color: '#1d1d1b', // theme text
  },
  text_danger: {
    color: '#fff',
  },
  text_success: {
    color: '#fff',
  },
});

export default Button;
