import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNotification } from '../../utils/NotificationContext';

const NotificationDisplay = () => {
  const { notification } = useNotification();
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (notification) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notification]);

  if (!notification) return null;

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'error':
        return '#DC143C';
      case 'success':
        return '#32CD32';
      case 'warning':
        return '#FFA500';
      default:
        return '#007AFF';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Text style={styles.text}>{notification.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default NotificationDisplay;
