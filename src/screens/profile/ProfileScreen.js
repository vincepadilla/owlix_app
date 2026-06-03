import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, StatusBar, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationManager } from '../../utils/NotificationManager';
import { radius, spacing, typography, glassShadow } from '../../theme/colors';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { theme, isDark } = useTheme();
  
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar || null);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (email !== user.email && email.trim() !== '') updates.email = email.trim();
      if (password.length > 0) {
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        updates.password = password;
      }
      
      const metaUpdates = {};
      if (username !== user?.user_metadata?.username) {
        metaUpdates.username = username.trim();
      }
      
      let finalAvatarUrl = avatarUrl;
      
      // If the avatarUrl is a local file URI (from image picker), we need to upload it
      if (avatarUrl && avatarUrl.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(avatarUrl, { encoding: 'base64' });
        const fileData = decode(base64);
        const ext = avatarUrl.split('.').pop() || 'jpg';
        const storagePath = `avatars/${user.id}_${Date.now()}.${ext}`;

        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(storagePath, fileData, {
            contentType: 'image/jpeg',
            upsert: true,
          });
          
        if (storageError) throw storageError;

        // Get a long-lived signed URL to use as the public avatar URL
        const { data: signedData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10); // 10 years
          
        if (signedError) throw signedError;
        finalAvatarUrl = signedData.signedUrl;
      }

      if (finalAvatarUrl !== user?.user_metadata?.avatar) {
        metaUpdates.avatar = finalAvatarUrl;
      }

      if (Object.keys(metaUpdates).length > 0) {
        updates.data = metaUpdates;
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert('No changes', 'There are no changes to save.');
        setSaving(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      await NotificationManager.addNotification(
        user.id,
        'Profile Updated',
        'You successfully updated your profile details.'
      );

      Alert.alert('Success', 'Profile updated successfully! Note: Email updates require confirmation.');
      setPassword(''); // Clear password field after update
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive', 
        onPress: async () => { 
          setSigningOut(true);
          try { 
            await signOut(); 
          } catch (e) { 
            Alert.alert('Error', e.message); 
            setSigningOut(false);
          } 
        } 
      },
    ]);
  };

  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.avatarWrap, { backgroundColor: theme.primaryGlow, borderColor: theme.borderGlow }]}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color={theme.primary} />
            )}
            <View style={[styles.editBadge, { backgroundColor: theme.primary, borderColor: theme.bg }]}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Your Profile</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Manage your account details</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, shadow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          
          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Choose a username"
                placeholderTextColor={theme.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="you@example.com"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Text style={[styles.helperText, { color: theme.textMuted }]}>Changing email requires confirmation on both new and old addresses.</Text>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1, color: theme.textPrimary }]}
                placeholder="Leave blank to keep current"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }, saving && styles.btnDisabled]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Sign Out Card */}
        <View style={[styles.card, shadow, { backgroundColor: theme.bgCard, borderColor: theme.border, marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account Actions</Text>
          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: theme.danger }]}
            onPress={handleSignOut}
            disabled={signingOut}
            activeOpacity={0.8}
          >
            {signingOut
              ? <ActivityIndicator color={theme.danger} />
              : (
                <>
                  <Ionicons name="log-out-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                  <Text style={[styles.ghostBtnText, { color: theme.danger }]}>Sign Out</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: 140 },
  
  header: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.md },
  avatarWrap: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md, borderWidth: 1,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 40 },
  editBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, marginTop: 4 },

  card: {
    borderRadius: radius.xl,
    padding: spacing.xl, borderWidth: 1, overflow: 'hidden',
  },
  
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },

  fieldGroup: { marginBottom: spacing.md },
  label: { ...typography.captionBold, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1, paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, ...typography.body },
  eyeBtn: { padding: 6 },
  helperText: { ...typography.caption, marginTop: 4 },

  primaryBtn: {
    borderRadius: radius.md,
    height: 50, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', ...typography.bodyBold, letterSpacing: 0.3 },

  ghostBtn: {
    borderWidth: 1, borderRadius: radius.md,
    height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: { ...typography.bodyBold },
});


