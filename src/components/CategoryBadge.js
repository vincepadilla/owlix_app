import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing, typography } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function CategoryBadge({ category }) {
  const { theme } = useTheme();
  const palette = theme.category[category] || theme.category.Other;
  const icons = { Certificate: '🏅', Resume: '📄', ID: '🪪', Other: '📎' };
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={styles.icon}>{icons[category] || '📎'}</Text>
      <Text style={[styles.label, { color: palette.text }]}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  icon: { fontSize: 11 },
  label: { ...typography.captionBold },
});
