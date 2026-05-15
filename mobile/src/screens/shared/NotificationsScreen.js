import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import notificationApi from '../../api/notificationApi';
import { colors, spacing, radius, shadow, type } from '../../theme';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const syncBadge = useCallback(() => {
    navigation.setParams({ unreadCount });
  }, [navigation, unreadCount]);

  useEffect(() => {
    syncBadge();
  }, [syncBadge]);

  const loadNotifications = async ({ silent } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await notificationApi.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotifications([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const refreshNotifications = async () => {
    try {
      setRefreshing(true);
      await loadNotifications({ silent: true });
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      // noop
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      // noop
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}>
      <View style={styles.cardHeader}>
        <Text style={styles.message}>{item.message}</Text>
        {!item.isRead && (
          <TouchableOpacity onPress={() => handleMarkRead(item.id)}>
            <Text style={styles.markRead}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.timestamp}>
        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          style={[styles.actionButton, unreadCount === 0 && styles.actionButtonDisabled]}
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Text style={styles.actionButtonText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshNotifications} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  actionButtonDisabled: {
    backgroundColor: colors.border,
  },
  actionButtonText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 12,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardUnread: {
    borderColor: colors.primary,
  },
  cardRead: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  message: {
    flex: 1,
    paddingRight: spacing.sm,
    ...type.body,
  },
  markRead: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  timestamp: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...type.bodyMuted,
  },
});

export default NotificationsScreen;
