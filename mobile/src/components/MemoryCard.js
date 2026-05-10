import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

import { colors, spacing, radius, type, shadow } from '../theme';

// A single row in the memories list. Stays dumb — receives data + onPress
// via props. No data fetching, no state. That's the React rule: small,
// composable, predictable components.
export default function MemoryCard({ memory, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {memory.image_url ? (
        <Image source={{ uri: memory.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderEmoji}>🖼️</Text>
        </View>
      )}
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {memory.title}
        </Text>
        {memory.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {memory.description}
          </Text>
        ) : null}
        <Text style={styles.date}>{formatDate(memory.created_at)}</Text>
      </View>
    </Pressable>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    // Shadows look different on iOS vs Android. RN gives us both knobs.
    ...shadow.card,
  },
  image: { width: 104, height: 104 },
  placeholder: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 28, opacity: 0.6 },
  text: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  title: { ...type.heading, marginBottom: spacing.xs },
  description: { ...type.small, color: colors.textMuted, marginBottom: spacing.xs, lineHeight: 18 },
  date: { ...type.tiny },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
