import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import StatusChip from '../../components/StatusChip';
import { useTheme } from '../../context/ThemeContext';
import { NotificationManager } from '../../utils/NotificationManager';
import { radius, spacing, typography, glassShadow } from '../../theme/colors';

const STATUSES = ['Applied', 'Interview', 'Offered', 'Hired', 'Rejected'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [status, setStatus] = useState(job.status);
  const [notes, setNotes] = useState(job.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === status) return;
    const prev = status;
    setStatus(newStatus); // Optimistic update
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', job.id);
      if (error) throw error;

      await NotificationManager.addNotification(
        user.id,
        'Application Status Updated',
        `Your application for ${job.position} at ${job.company} is now marked as ${newStatus}.`
      );
    } catch (e) {
      setStatus(prev);
      Alert.alert('Error', e.message);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ notes: notes.trim() || null })
        .eq('id', job.id);
      if (error) throw error;
      setEditingNotes(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Application',
      `Remove "${job.position}" at ${job.company}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await supabase
                .from('job_applications')
                .delete()
                .eq('id', job.id);
              if (error) throw error;
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]}>

        {/* Header info */}
        <View style={[styles.glassCard, shadow]}>
          <View style={[styles.glassCardInner, styles.headerCardInner, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={[styles.companyIcon, { backgroundColor: theme.primaryGlow, borderColor: theme.borderGlow }]}>
              <Text style={[styles.companyInitial, { color: theme.primaryLight }]}>{job.company[0].toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.company, { color: theme.textPrimary }]}>{job.company}</Text>
              <Text style={[styles.position, { color: theme.textSecondary }]}>{job.position}</Text>
              <Text style={[styles.date, { color: theme.textMuted }]}>Applied {formatDate(job.date_applied)}</Text>
            </View>
          </View>
        </View>

        {/* Current status */}
        <View style={[styles.glassCard, shadow]}>
          <View style={[styles.glassCardInner, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Current Status</Text>
            <StatusChip status={status} />
          </View>
        </View>

        {/* Update status */}
        <View style={[styles.glassCard, shadow]}>
          <View style={[styles.glassCardInner, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Update Status</Text>
            <View style={styles.statusGrid}>
              {STATUSES.map(s => {
                const isSelected = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.75}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.10)')
                          : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.60)'),
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => handleUpdateStatus(s)}
                  >
                    
                    <StatusChip status={s} />
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={14} color={theme.primary} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.glassCard, shadow]}>
          <View style={[styles.glassCardInner, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notes</Text>
              <TouchableOpacity onPress={() => setEditingNotes(!editingNotes)}>
                <Ionicons name={editingNotes ? 'close' : 'create-outline'} size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
            {editingNotes ? (
              <>
                <View style={[styles.notesInput, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.notesText, { color: theme.textPrimary }]}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={5}
                    placeholder="Add notes..."
                    placeholderTextColor={theme.textMuted}
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.saveNotesBtn, { backgroundColor: theme.primary }, saving && styles.btnDisabled]}
                  onPress={handleSaveNotes}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveNotesBtnText}>Save Notes</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.notesDisplay, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
                <Text style={[styles.notesDisplayText, { color: theme.textMuted }]}>
                  {notes || 'No notes added yet. Tap the edit icon to add notes.'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.dangerBtn, { backgroundColor: theme.dangerBg, borderColor: theme.danger }, deleting && styles.btnDisabled]}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting
            ? <ActivityIndicator color={theme.danger} />
            : (
              <>
                <Ionicons name="trash-outline" size={18} color={theme.danger} style={{ marginRight: 6 }} />
                <Text style={[styles.dangerBtnText, { color: theme.danger }]}>Delete Application</Text>
              </>
            )
          }
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
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  headerCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  // Header card specifics
  companyIcon: {
    width: 54, height: 54, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  companyInitial: { fontSize: 22, fontWeight: '800' },
  headerInfo: { flex: 1, gap: 3 },
  company: { ...typography.h3 },
  position: { ...typography.body },
  date: { ...typography.caption },

  // Reused across cards
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.captionBold, textTransform: 'uppercase', letterSpacing: 0.5 },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    padding: 6, borderRadius: radius.md,
    borderWidth: 1, overflow: 'hidden',
  },
  checkIcon: { marginLeft: 2 },

  notesInput: {
    borderRadius: radius.md,
    borderWidth: 1, padding: spacing.md,
    minHeight: 100,
  },
  notesText: { ...typography.body },
  notesDisplay: {
    borderRadius: radius.md,
    padding: spacing.md, minHeight: 60,
    borderWidth: 1,
  },
  notesDisplayText: { ...typography.body },

  saveNotesBtn: {
    borderRadius: radius.md,
    height: 40, alignItems: 'center', justifyContent: 'center',
  },
  saveNotesBtnText: { color: '#fff', ...typography.bodyBold },

  dangerBtn: {
    borderWidth: 1,
    borderRadius: radius.md, height: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  dangerBtnText: { ...typography.bodyBold },
  btnDisabled: { opacity: 0.6 },
});


