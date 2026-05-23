import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryBadge from './CategoryBadge';
import { colors, radius, spacing, typography } from '../theme/colors';

const FILE_ICONS = {
  'application/pdf': { icon: 'document-text', color: '#EF4444' },
  'image/jpeg': { icon: 'image', color: '#3B82F6' },
  'image/png': { icon: 'image', color: '#3B82F6' },
  default: { icon: 'document', color: colors.primary },
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DocumentCard({ document, onPress }) {
  const fileInfo = FILE_ICONS[document.file_type] || FILE_ICONS.default;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Icon area */}
      <View style={[styles.iconWrap, { backgroundColor: `${fileInfo.color}22` }]}>
        <Ionicons name={fileInfo.icon} size={28} color={fileInfo.color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{document.name}</Text>
        <CategoryBadge category={document.category} />
        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDate(document.created_at)}</Text>
          {!!document.size && (
            <Text style={styles.metaText}>  ·  {formatBytes(document.size)}</Text>
          )}
        </View>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.arrow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});
