import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationManager } from '../../utils/NotificationManager';
import { radius, spacing, typography, glassShadow } from '../../theme/colors';

const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected'];

export default function AddJobScreen({ navigation }) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Applied');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!company.trim() || !position.trim()) {
      Alert.alert('Missing fields', 'Company and Position are required.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('job_applications').insert({
        user_id: user.id,
        company: company.trim(),
        position: position.trim(),
        date_applied: new Date().toISOString().split('T')[0],
        url: url.trim() || null,
        notes: notes.trim() || null,
        status,
      });
      if (error) throw error;
      
      await NotificationManager.addNotification(
        user.id,
        'Job Application Added',
        `You added a new application for ${position.trim()} at ${company.trim()}.`
      );

      Alert.alert('Success', 'Application added successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]} keyboardShouldPersistTaps="handled">

        {/* Company & Position — glass card */}
        <View style={[styles.glassCard, shadow]}>
          <View style={[styles.glassCardInner, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Company</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                <Ionicons name="business-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="e.g. Acme Corp"
                  placeholderTextColor={theme.textMuted}
                  value={company}
                  onChangeText={setCompany}
                />
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Position</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                <Ionicons name="briefcase-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="e.g. Frontend Engineer"
                  placeholderTextColor={theme.textMuted}
                  value={position}
                  onChangeText={setPosition}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, marginLeft: spacing.sm }]}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScroll}>
            {STATUSES.map(s => {
              const isSelected = status === s;
              return (
                <TouchableOpacity
                  key={s}
                  activeOpacity={0.75}
                  onPress={() => setStatus(s)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)')
                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.70)'),
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                    isSelected && {
                      shadowColor: theme.primary,
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 4,
                    },
                  ]}
                >
                  
                  <Text style={[
                    styles.statusText,
                    { color: isSelected ? theme.primary : theme.textSecondary },
                    isSelected && { fontWeight: '700' },
                  ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Additional Details — glass card */}
        <View style={[styles.glassCard, shadow]}>
          <View style={[styles.glassCardInner, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Job Post URL (Optional)</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                <Ionicons name="link-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="https://"
                  placeholderTextColor={theme.textMuted}
                  value={url}
                  onChangeText={setUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Notes (Optional)</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border, height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary, height: 80, textAlignVertical: 'top' }]}
                  placeholder="Add any notes here..."
                  placeholderTextColor={theme.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Application</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 140 },

  glassCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  glassCardInner: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.lg,
  },

  fieldGroup: { gap: 8 },
  label: { ...typography.captionBold, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.md, borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, ...typography.body },

  statusScroll: { gap: 8 },
  statusChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusText: { ...typography.bodyBold },

  saveBtn: {
    height: 52, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', ...typography.bodyBold, letterSpacing: 0.3 },
});


