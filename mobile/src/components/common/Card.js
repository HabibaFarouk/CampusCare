import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const Card = ({
  children,
  onPress,
  style,
  elevated = false,
  variant = 'default',
  ...props
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fcfaf8',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
  },
  default: {
    borderWidth: 1,
    borderColor: '#e6dac3',
  },
  elevated: {
    shadowColor: '#1d1d1b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default Card;
