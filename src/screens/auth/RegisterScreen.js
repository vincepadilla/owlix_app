import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing, typography } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirmPwd) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPwd) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      Alert.alert('Check your email', 'We sent you a confirmation link. Please verify your email before signing in.');
      navigation.navigate('Login');
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.logoWrap, { backgroundColor: theme.primaryGlow, borderColor: theme.borderGlow }]}>
            <Image source={require('../../../assets/owlix-logo.png')} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
          </View>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>OWLIX</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>Start your career journey today.</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join us and organize your career</Text>

          {!!error && (
            <View style={[styles.errorBanner, { backgroundColor: theme.dangerBg }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            </View>
          )}

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
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1, color: theme.textPrimary }]}
                placeholder="Min. 6 characters"
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

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Repeat password"
                placeholderTextColor={theme.textMuted}
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                secureTextEntry={!showPwd}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <TouchableOpacity style={[styles.ghostBtn, { borderColor: theme.border }]} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.ghostBtnText, { color: theme.textSecondary }]}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoWrap: {
    width: 72, height: 72, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md, borderWidth: 1,
  },
  appName: { ...typography.h1 },
  tagline: { ...typography.body, marginTop: 4 },

  card: {
    borderRadius: radius.xl,
    padding: spacing.xl, borderWidth: 1, overflow: 'hidden',
  },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, marginTop: 4, marginBottom: spacing.lg },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
  },
  errorText: { ...typography.caption, flex: 1 },

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

  primaryBtn: {
    borderRadius: radius.md,
    height: 50, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', ...typography.bodyBold, letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, gap: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { ...typography.caption },

  ghostBtn: {
    borderWidth: 1, borderRadius: radius.md,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: { ...typography.bodyBold },
});
