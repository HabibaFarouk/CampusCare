import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiGet } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import MemoryCard from '../components/MemoryCard';
import { colors, spacing, radius, type } from '../theme';

export default function HomeScreen({ navigation }) {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setError(null);
      const data = await apiGet('/journals');
      setMemories(data.journals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // useFocusEffect runs the effect every time the screen comes into focus —
  // i.e. also after we pop back from CreateMemory or MemoryDetail. Much nicer
  // than useEffect, which only runs on mount and would miss those cases.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const count = memories.length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={styles.headerTitle}>Your memories</Text>
          <Text style={styles.headerSubtitle}>
            {count === 0
              ? 'Nothing saved yet'
              : `${count} ${count === 1 ? 'memory' : 'memories'}`}
          </Text>
        </View>
        <Pressable
          onPress={logout}
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemoryCard
            memory={item}
            onPress={() => navigation.navigate('MemoryDetail', { id: item.id })}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          count === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconEmoji}>📸</Text>
            </View>
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptySubtitle}>
              Use the New tab below to save your first one.
            </Text>
          </View>
        }
        ListHeaderComponent={
          error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...type.title },
  headerSubtitle: { ...type.small, marginTop: 2 },
  logout: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { ...type.small, color: colors.text, fontWeight: '600' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  listContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconEmoji: { fontSize: 40 },
  emptyTitle: { ...type.heading, marginBottom: spacing.xs },
  emptySubtitle: { ...type.bodyMuted, textAlign: 'center' },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 14 },
});
