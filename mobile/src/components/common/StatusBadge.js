import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, VALID_STATUSES } from '../../utils/constants';

const StatusBadge = ({ status, size = 'md' }) => {
  const backgroundColor = STATUS_COLORS[status] || '#999';
  const sizeStyle = styles[`size_${size}`];

  return (
    <View style={[styles.badge, { backgroundColor }, sizeStyle]}>
      <Text style={[styles.text, styles[`text_${size}`]]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    color: '#fff',
  },
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  size_md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  size_lg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text_sm: {
    fontSize: 12,
  },
  text_md: {
    fontSize: 14,
  },
  text_lg: {
    fontSize: 16,
  },
});

export default StatusBadge;
