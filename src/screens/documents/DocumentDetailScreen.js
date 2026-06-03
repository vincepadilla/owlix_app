import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Linking, Modal, Image, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabaseClient';
import CategoryBadge from '../../components/CategoryBadge';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing, typography, glassShadow } from '../../theme/colors';

function formatBytes(bytes) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function DocumentDetailScreen({ route, navigation }) {
  const { document } = route.params;
  const { theme, isDark } = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [localDocUri, setLocalDocUri] = useState(null);

  const handleView = async () => {
    setViewing(true);
    try {
      const ext = document.file_path.split('.').pop();
      const localUri = `${FileSystem.cacheDirectory}careervault_${document.id}.${ext}`;
      const fileInfo = await FileSystem.getInfoAsync(localUri);

      const showDocument = async (uri) => {
        if (Platform.OS === 'android' && document.file_type === 'application/pdf') {
          // Android WebView cannot render PDFs locally, so we use the native system viewer
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: document.name });
        } else {
          setLocalDocUri(uri);
          setModalVisible(true);
        }
      };

      if (fileInfo.exists) {
         await showDocument(localUri);
      } else {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path, 60 * 10);
        if (error) throw error;
        
        const downloadResult = await FileSystem.downloadAsync(data.signedUrl, localUri);
        if (downloadResult.status === 200) {
          await showDocument(localUri);
        } else {
          throw new Error('Failed to download document for viewing.');
        }
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setViewing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60 * 10);
      if (error) throw error;

      const ext = document.file_path.split('.').pop();
      const localUri = `${FileSystem.cacheDirectory}careervault_${document.id}.${ext}`;
      const downloadResult = await FileSystem.downloadAsync(data.signedUrl, localUri);

      if (downloadResult.status !== 200) throw new Error('Download failed');

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: document.file_type || 'application/octet-stream',
          dialogTitle: document.name,
        });
      } else {
        Alert.alert('Cannot save', 'Sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              // Delete from storage
              const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([document.file_path]);
              if (storageError) throw storageError;

              // Delete from DB
              const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', document.id);
              if (dbError) throw dbError;

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

  const fileIcons = {
    'application/pdf': { icon: 'document-text', color: '#EF4444' },
    'image/jpeg': { icon: 'image', color: '#3B82F6' },
    'image/png': { icon: 'image', color: '#3B82F6' },
  };
  const fileInfo = fileIcons[document.file_type] || { icon: 'document', color: theme.primary };
  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]}>

        {/* Hero icon — glass circle */}
        <View style={[styles.iconHeroWrap, shadow]}>
          <View style={[styles.iconHero, {
            backgroundColor: `${fileInfo.color}22`,
            borderColor: isDark ? `${fileInfo.color}33` : `${fileInfo.color}44`,
          }]}>
            <Ionicons name={fileInfo.icon} size={52} color={fileInfo.color} />
          </View>
        </View>

        {/* Name and badge */}
        <Text style={[styles.docName, { color: theme.textPrimary }]}>{document.name}</Text>
        <CategoryBadge category={document.category} />

        {/* Meta cards — glassmorphism grid */}
        <View style={styles.metaGrid}>
          {[
            { icon: 'calendar-outline', label: 'Uploaded', value: formatDate(document.created_at) },
            { icon: 'scale-outline', label: 'File Size', value: formatBytes(document.size) },
            { icon: 'document-outline', label: 'Type', value: document.file_type || 'Unknown' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={[styles.metaCard, shadow]}>
              <View style={[styles.metaCardInner, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Ionicons name={icon} size={18} color={theme.primary} />
                <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{label}</Text>
                <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }, viewing && styles.btnDisabled]}
            onPress={handleView}
            disabled={viewing || downloading}
            activeOpacity={0.8}
          >
            {viewing
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <Ionicons name="eye-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>View</Text>
                </>
              )
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accent || '#8B5CF6' }, downloading && styles.btnDisabled]}
            onPress={handleDownload}
            disabled={viewing || downloading}
            activeOpacity={0.8}
          >
            {downloading
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <Ionicons name="download-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Download</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.dangerBtn, { borderColor: theme.danger, backgroundColor: theme.dangerBg }, deleting && styles.btnDisabled]}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting
            ? <ActivityIndicator color={theme.danger} />
            : (
              <>
                <Ionicons name="trash-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.dangerBtnText, { color: theme.danger }]}>Delete Document</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>

      {/* Offline Viewer Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F9FAFB' }}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]} numberOfLines={1}>{document.name}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={26} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#E5E7EB' }}>
            {document.file_type?.startsWith('image/') ? (
              <Image source={{ uri: localDocUri }} style={{ flex: 1, resizeMode: 'contain' }} />
            ) : document.file_type === 'application/pdf' ? (
              Platform.OS === 'android' ? (
                <View style={styles.modalUnsupported}>
                  <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
                  <Text style={{ color: theme.textSecondary, marginTop: 16, textAlign: 'center' }}>
                    Android requires an external app to view PDFs.
                  </Text>
                </View>
              ) : (
                <WebView 
                  source={{ uri: localDocUri }} 
                  style={{ flex: 1 }} 
                  originWhitelist={['*']} 
                  allowFileAccess={true}
                  allowFileAccessFromFileURLs={true}
                  allowUniversalAccessFromFileURLs={true}
                />
              )
            ) : (
              <View style={styles.modalUnsupported}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
                <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Cannot preview this file type offline.</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: spacing.lg, alignItems: 'center', gap: spacing.lg, paddingBottom: 140 },

  iconHeroWrap: {
    borderRadius: radius.xl + 8,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  iconHero: {
    width: 112,
    height: 112,
    borderRadius: radius.xl + 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  docName: { ...typography.h2, textAlign: 'center' },

  metaGrid: { width: '100%', gap: 10 },
  metaCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  metaCardInner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    borderWidth: 1,
  },
  metaLabel: { ...typography.caption, marginTop: 4 },
  metaValue: { ...typography.bodyBold },

  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flex: 1, height: 52,
    borderRadius: radius.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { color: '#fff', ...typography.bodyBold },

  dangerBtn: {
    width: '100%', height: 52,
    borderRadius: radius.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  dangerBtnText: { ...typography.bodyBold },

  btnDisabled: { opacity: 0.6 },

  modalHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: spacing.md, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  modalTitle: { ...typography.h3, flex: 1, marginRight: 12 },
  modalCloseBtn: { padding: 4 },
  modalUnsupported: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
});


