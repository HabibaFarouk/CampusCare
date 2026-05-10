import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';

import { apiGet, apiDelete } from '../api/client';
import { colors, spacing, radius, type, shadow } from '../theme';

export default function MemoryDetailScreen({ route, navigation }) {
  // Route params are how we pass data between screens. Here we only pass the
  // id — we refetch the full record so we always see the freshest data.
  const { id } = route.params;

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet(`/journals/${id}`);
        setMemory(data.journal);
      } catch (err) {
        Alert.alert('Could not load memory', err.message, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function confirmDelete() {
    Alert.alert(
      'Delete this memory?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]
    );
  }

  async function doDelete() {
    try {
      setDeleting(true);
      await apiDelete(`/journals/${id}`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Delete failed', err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!memory) return null;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Image source={{ uri: memory.image_url }} style={styles.image} />

      <View style={styles.card}>
        <Text style={styles.title}>{memory.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.dot} />
          <Text style={styles.date}>{formatDateTime(memory.created_at)}</Text>
        </View>

        {memory.description ? (
          <Text style={styles.description}>{memory.description}</Text>
        ) : (
          <Text style={styles.descriptionEmpty}>No description.</Text>
        )}
      </View>

      <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && { opacity: 0.85 },
          deleting && { opacity: 0.6 },
        ]}
      >
        {deleting ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <Text style={styles.deleteButtonText}>Delete memory</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  container: { padding: spacing.xl, paddingBottom: 60 },
  image: {
    width: '100%',
    height: 300,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  title: { ...type.title, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  date: { ...type.small },
  description: { ...type.body, color: colors.text, lineHeight: 22 },
  descriptionEmpty: { ...type.bodyMuted, fontStyle: 'italic' },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  deleteButtonText: { color: colors.danger, fontSize: 16, fontWeight: '600' },
});
