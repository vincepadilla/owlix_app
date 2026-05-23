import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusChip from './StatusChip';
import { colors, radius, spacing, typography } from '../theme/colors';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function JobCard({ job, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: colors.status[job.status]?.dot || colors.primary }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.company} numberOfLines={1}>{job.company}</Text>
          <StatusChip status={job.status} />
        </View>
        <Text style={styles.position} numberOfLines={1}>{job.position}</Text>
        <View style={styles.bottomRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={styles.date}> Applied {formatDate(job.date_applied)}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: 5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  company: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  position: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
