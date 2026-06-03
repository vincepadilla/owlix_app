import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo / Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image source={require('../../../assets/owlix-logo.png')} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
          </View>
          <Text style={styles.appName}>OWLIX</Text>
          <Text style={styles.tagline}>Your Career Tracker</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register link */}
          <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.ghostBtnText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoWrap: {
    width: 72, height: 72, borderRadius: radius.xl,
    backgroundColor: theme.primaryGlow, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: theme.borderGlow,
  },
  appName: { ...typography.h1, color: theme.textPrimary },
  tagline: { ...typography.body, color: theme.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: theme.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  title: { ...typography.h2, color: theme.textPrimary },
  subtitle: { ...typography.body, color: theme.textSecondary, marginTop: 4, marginBottom: spacing.lg },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.dangerBg, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
  },
  errorText: { ...typography.caption, color: theme.danger, flex: 1 },

  fieldGroup: { marginBottom: spacing.md },
  label: { ...typography.captionBold, color: theme.textSecondary, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.bgInput, borderRadius: radius.md,
    borderWidth: 1, borderColor: theme.border, paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: theme.textPrimary, ...typography.body },
  eyeBtn: { padding: 6 },

  primaryBtn: {
    backgroundColor: theme.primary, borderRadius: radius.md,
    height: 50, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', ...typography.bodyBold, letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md, gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
  dividerText: { ...typography.caption, color: theme.textMuted },

  ghostBtn: {
    borderWidth: 1, borderColor: theme.border, borderRadius: radius.md,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: { ...typography.bodyBold, color: theme.textSecondary },
});
