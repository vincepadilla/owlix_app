import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationManager } from '../../utils/NotificationManager';
import { radius, spacing, typography, glassShadow } from '../../theme/colors';

const CATEGORIES = ['Certificate', 'Resume', 'ID', 'Other'];

export default function UploadDocumentScreen({ navigation }) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('');
  const [customName, setCustomName] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(asset);
        if (!customName) setCustomName(asset.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick file. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { Alert.alert('No file selected', 'Please pick a file first.'); return; }
    if (!category) { Alert.alert('No category', 'Please select a category.'); return; }
    if (!customName.trim()) { Alert.alert('No name', 'Please enter a document name.'); return; }

    setUploading(true);
    try {
      const ext = selectedFile.name.split('.').pop();
      const storagePath = `${user.id}/${Date.now()}_${customName.trim().replace(/\s+/g, '_')}.${ext}`;

      // Read file as Base64 and decode to ArrayBuffer for reliable upload in React Native
      const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, { encoding: 'base64' });
      const fileData = decode(base64);

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(storagePath, fileData, {
          contentType: selectedFile.mimeType || 'application/octet-stream',
          upsert: false,
        });
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        name: customName.trim(),
        category,
        file_path: storagePath,
        file_type: selectedFile.mimeType,
        size: selectedFile.size,
      });
      if (dbError) throw dbError;

      await NotificationManager.addNotification(
        user.id,
        'Document Uploaded',
        `You uploaded ${customName.trim()} to the ${category} category.`
      );

      Alert.alert('Success', 'Document uploaded successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]} keyboardShouldPersistTaps="handled">

        {/* File picker area — glass dashed drop zone */}
        <TouchableOpacity
          style={[styles.dropZoneWrap, shadow]}
          onPress={pickDocument}
          activeOpacity={0.78}
        >
          <View style={[styles.dropZone, {
            backgroundColor: theme.bgCard,
            borderColor: selectedFile ? theme.primary : theme.border,
          }]}>
            {selectedFile ? (
              <View style={styles.fileSelected}>
                <Ionicons
                  name={selectedFile.mimeType?.startsWith('image') ? 'image' : 'document-text'}
                  size={40}
                  color={theme.primary}
                />
                <Text style={[styles.fileName, { color: theme.textPrimary }]} numberOfLines={2}>{selectedFile.name}</Text>
                <Text style={[styles.fileSize, { color: theme.textMuted }]}>
                  {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                </Text>
              </View>
            ) : (
              <View style={styles.dropHint}>
                <View style={[styles.uploadIconWrap, { backgroundColor: theme.primaryGlow }]}>
                  <Ionicons name="cloud-upload-outline" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.dropTitle, { color: theme.textPrimary }]}>Tap to select file</Text>
                <Text style={[styles.dropSubtitle, { color: theme.textMuted }]}>PDF or Image (JPG, PNG)</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Document Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Document Name</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="e.g. My Resume 2024"
              placeholderTextColor={theme.textMuted}
              value={customName}
              onChangeText={setCustomName}
            />
          </View>
        </View>

        {/* Category picker — glass grid */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => {
              const icons = { Certificate: '🏅', Resume: '📄', ID: '🪪', Other: '📎' };
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.75}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catBtn,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)')
                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.70)'),
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                    isSelected && {
                      shadowColor: theme.primary,
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 3,
                    },
                  ]}
                >
                  
                  <Text style={styles.catIcon}>{icons[cat]}</Text>
                  <Text style={[
                    styles.catLabel,
                    { color: isSelected ? theme.primary : theme.textSecondary },
                    isSelected && { fontWeight: '700' },
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: theme.primary }, (uploading || !selectedFile || !category) && styles.btnDisabled]}
          onPress={handleUpload}
          disabled={uploading || !selectedFile || !category}
          activeOpacity={0.8}
        >
          {uploading
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.uploadBtnText}>Upload Document</Text>
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

  dropZoneWrap: {
    borderRadius: radius.xl,
    minHeight: 180,
    overflow: 'hidden',
  },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropHint: { alignItems: 'center', gap: 10, padding: spacing.lg },
  uploadIconWrap: {
    width: 72, height: 72, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  dropTitle: { ...typography.h3 },
  dropSubtitle: { ...typography.body },

  fileSelected: { alignItems: 'center', gap: 8, padding: spacing.lg },
  fileName: { ...typography.bodyBold, textAlign: 'center' },
  fileSize: { ...typography.caption },

  fieldGroup: { gap: 8 },
  label: { ...typography.captionBold, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputWrap: {
    borderRadius: radius.md,
    borderWidth: 1, paddingHorizontal: spacing.md,
  },
  input: { height: 48, ...typography.body },

  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  catBtn: {
    width: '48%',
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, gap: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  catIcon: { fontSize: 22 },
  catLabel: { ...typography.captionBold },

  uploadBtn: {
    borderRadius: radius.md,
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.5 },
  uploadBtnText: { color: '#fff', ...typography.bodyBold },
});


