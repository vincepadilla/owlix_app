import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography } from '../theme/colors';

export default function SummaryCard({ title, value, icon, accentColor }) {
  const { theme } = useTheme();
  const accent = accentColor || theme.primary;
  
  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderTopWidth: 3,
      marginHorizontal: 4,
    },
    icon: {
      fontSize: 22,
      marginBottom: 6,
    },
    value: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -1,
    },
    title: {
      ...typography.caption,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
  });

  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      {!!icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
