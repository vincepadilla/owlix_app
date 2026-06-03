import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import CategoryBadge from './CategoryBadge';
import { radius, spacing, typography } from '../theme/colors';

const getFileIcons = (theme) => ({
  'application/pdf': { icon: 'document-text', color: '#EF4444' },
  'image/jpeg': { icon: 'image', color: '#3B82F6' },
  'image/png': { icon: 'image', color: '#3B82F6' },
  default: { icon: 'document', color: theme.primary },
});

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
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const fileIcons = getFileIcons(theme);
  const fileInfo = fileIcons[document.file_type] || fileIcons.default;

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
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} style={styles.arrow} />
    </TouchableOpacity>
  );
}

const createStyles = (theme) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaText: {
    ...typography.caption,
    color: theme.textMuted,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});
