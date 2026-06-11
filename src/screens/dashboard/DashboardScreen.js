import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  RefreshControl, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { Dimensions } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import StatusChip from '../../components/StatusChip';
import ChatbotModal from '../../components/ChatbotModal';
import { NotificationManager } from '../../utils/NotificationManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { radius, spacing, typography, glassShadow } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STATUS_LIST = ['Applied', 'Interview', 'Offered', 'Hired', 'Rejected'];
const STATUS_COLORS = ['#EAB308', '#8B5CF6', '#EC4899', '#22C55E', '#EF4444'];

export default function DashboardScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // 1. Load from local cache instantly
      const cachedDocs = await AsyncStorage.getItem(`@cached_docs_${user.id}`);
      const cachedJobs = await AsyncStorage.getItem(`@cached_jobs_${user.id}`);

      if (cachedDocs) setDocuments(JSON.parse(cachedDocs));
      if (cachedJobs) setJobs(JSON.parse(cachedJobs));
      if (cachedDocs || cachedJobs) setLoading(false); // Stop loading spinner immediately if cache exists

      // 2. Fetch fresh data from Supabase in background
      const [docsRes, jobsRes] = await Promise.all([
        supabase.from('documents').select('id,category,created_at').eq('user_id', user.id),
        supabase.from('job_applications').select('id,status,company,position,created_at').eq('user_id', user.id),
      ]);
      if (docsRes.error) throw docsRes.error;
      if (jobsRes.error) throw jobsRes.error;

      setDocuments(docsRes.data || []);
      setJobs(jobsRes.data || []);

      // 3. Update cache
      AsyncStorage.setItem(`@cached_docs_${user.id}`, JSON.stringify(docsRes.data || []));
      AsyncStorage.setItem(`@cached_jobs_${user.id}`, JSON.stringify(jobsRes.data || []));
    } catch (e) {
      // Don't show alert if it's just a background refresh error when we already have cache
      console.error('Fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  const fetchNotifications = useCallback(async () => {
    if (user?.id) {
      const notifs = await NotificationManager.getNotifications(user.id);
      setNotifications(notifs);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, [fetchData, fetchNotifications]);

  // Refresh on tab focus
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => setIsFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
    return () => { unsubscribe(); unsubscribeBlur(); };
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
      fetchNotifications();
    }
  }, [isFocused, fetchData, fetchNotifications]);

  // Status breakdown counts
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => !['Rejected', 'Hired'].includes(j.status)).length;

  // Recent items (last 5 across both)
  const recentDocs = documents.slice(0, 3).map(d => ({ ...d, _type: 'doc' }));
  const recentJobs = jobs.slice(0, 3).map(j => ({ ...j, _type: 'job' }));
  const recentActivity = [...recentDocs, ...recentJobs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const handleMarkAllAsRead = async () => {
    await NotificationManager.markAllAsRead(user.id);
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  if (loading) return (
    <View style={[styles.loaderContainer, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  const hour = currentDate.getHours();
  let greetingText = 'Good Evening';
  if (hour < 12) greetingText = 'Good Morning';
  else if (hour < 17) greetingText = 'Good Afternoon';

  const formattedDateTime = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: spacing.lg }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={theme.primary} />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {user?.user_metadata?.avatar ? (
              <Image source={{ uri: user.user_metadata.avatar }} style={styles.greetingAvatar} />
            ) : (
              <View style={[styles.greetingAvatarPlaceholder, { backgroundColor: `${theme.primary}22` }]}>
                <Ionicons name="person" size={20} color={theme.primary} />
              </View>
            )}
            <View>
              <Text style={[styles.greeting, { color: theme.textPrimary }]} numberOfLines={1}>
                {greetingText}, {user?.user_metadata?.username || user?.email?.split('@')[0]}
              </Text>
              <Text style={[styles.greetingSubtitle, { color: theme.textSecondary, marginTop: 2 }]}>
                {formattedDateTime}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Icon buttons */}
            <TouchableOpacity
              style={[styles.iconBtn, shadow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={toggleTheme}
              activeOpacity={0.75}
            >
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, shadow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={() => setShowNotifications(!showNotifications)}
              activeOpacity={0.75}
            >
              <Ionicons name="notifications-outline" size={18} color={theme.textPrimary} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <View style={[styles.dropdown, shadow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={styles.dropdownHeader}>
              <Text style={[styles.dropdownTitle, { color: theme.textPrimary }]}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                  <Text style={[styles.dropdownAction, { color: theme.primary }]}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {notifications.length === 0 ? (
                <Text style={[styles.dropdownEmpty, { color: theme.textMuted }]}>No notifications yet.</Text>
              ) : (
                notifications.map((notif) => (
                  <View key={notif.id} style={[styles.notifItem, !notif.read && { backgroundColor: `${theme.primary}11` }]}>
                    <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>{notif.title}</Text>
                    <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{notif.message}</Text>
                    <Text style={[styles.notifTime, { color: theme.textMuted }]}>
                      {new Date(notif.timestamp).toLocaleDateString()} {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* Summary cards */}
        <View style={[styles.combinedSummaryCard, shadow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: `${theme.primary}22` }]}>
              <Ionicons name="document-text" size={22} color={theme.primary} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.primary }]}>{documents.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Documents</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: `${theme.accent}22` }]}>
              <Ionicons name="briefcase" size={22} color={theme.accent} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.accent }]}>{jobs.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Applications</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: `${theme.success}22` }]}>
              <Ionicons name="checkmark-circle" size={22} color={theme.success} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.success }]}>{activeJobs}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Active</Text>
          </View>
        </View>

        {/* Status Breakdown */}
        {jobs.length > 0 && (
          <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
            {/* Header */}
            <View style={{ marginBottom: spacing.sm, paddingHorizontal: 4 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 'bold', marginTop: 2 }}>Application Status</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Breakdown</Text>
            </View>

            {/* Main Container */}
            <View style={[styles.pipelineCard, shadow]}>
              <View style={[styles.pipelineInner, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
                {/* Donut Chart (Left Side) */}
                <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={120} height={120} viewBox="0 0 120 120">
                    <G rotation="-90" origin="60, 60">
                      {(() => {
                        const RADIUS = 44;
                        const STROKE_WIDTH = 14;
                        const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
                        let currentOffset = 0;

                        return STATUS_LIST.map((s, i) => {
                          const count = jobs.filter(j => j.status === s).length;
                          if (count === 0) return null;

                          const strokeLength = (count / totalJobs) * CIRCUMFERENCE;
                          const gap = totalJobs > count ? 4 : 0;
                          const actualLength = Math.max(0, strokeLength - gap);

                          const circle = (
                            <Circle
                              key={s}
                              cx="60"
                              cy="60"
                              r={RADIUS}
                              stroke={STATUS_COLORS[i]}
                              strokeWidth={STROKE_WIDTH}
                              fill="transparent"
                              strokeDasharray={`${actualLength} ${CIRCUMFERENCE}`}
                              strokeDashoffset={-currentOffset}
                              strokeLinecap="round"
                            />
                          );
                          currentOffset += strokeLength;
                          return circle;
                        });
                      })()}
                    </G>
                  </Svg>
                  <View style={{ position: 'absolute', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.textPrimary }}>{totalJobs}</Text>
                    <Text style={{ fontSize: 10, color: theme.textMuted, fontWeight: '700' }}>TOTAL</Text>
                  </View>
                </View>

                {/* Custom Legend (Right Side) */}
                <View style={{ flex: 1, gap: 8, paddingLeft: 24 }}>
                  {STATUS_LIST.map((s, i) => {
                    const count = jobs.filter(j => j.status === s).length;
                    const color = STATUS_COLORS[i];
                    const bgColor = color + '22';

                    return (
                      <View key={s} style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: bgColor,
                        borderRadius: 20,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                          <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '600' }}>{s}</Text>
                        </View>
                        <Text style={{ color: color, fontSize: 14, fontWeight: 'bold' }}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Document category breakdown */}
        {documents.length > 0 && (
          <View style={[styles.cardSection, shadow]}>
            <View style={[styles.cardSectionInner, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Document Categories</Text>
              {['Certificate', 'Resume', 'ID', 'Other'].map(cat => {
                const count = documents.filter(d => d.category === cat).length;
                const pct = documents.length > 0 ? count / documents.length : 0;
                const catColors = { Certificate: theme.primary, Resume: theme.accent, ID: theme.teal, Other: theme.textMuted };
                return (
                  <View key={cat} style={styles.progressRow}>
                    <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>{cat}</Text>
                    <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }]}>
                      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: catColors[cat] }]} />
                    </View>
                    <Text style={[styles.progressCount, { color: theme.textSecondary }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={[styles.cardSection, shadow]}>
          <View style={[styles.cardSectionInner, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Recent Activity</Text>
            {recentActivity.length === 0 ? (
              <Text style={[styles.emptyActivity, { color: theme.textMuted }]}>No activity yet. Start by uploading a document or adding a job application.</Text>
            ) : (
              recentActivity.map((item) => (
                <View key={item.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: item._type === 'doc' ? `${theme.primary}33` : `${theme.accent}33` }]}>
                    <Ionicons
                      name={item._type === 'doc' ? 'document-text-outline' : 'briefcase-outline'}
                      size={16}
                      color={item._type === 'doc' ? theme.primary : theme.accent}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityName, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item._type === 'doc' ? item.category : `${item.position} at ${item.company}`}
                    </Text>
                    <Text style={[styles.activityMeta, { color: theme.textMuted }]}>
                      {item._type === 'doc' ? 'Document' : 'Job Application'} ·{' '}
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {item._type === 'job' && <StatusChip status={item.status} />}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Quick actions */}
        <View style={[styles.cardSection, shadow]}>
          <View style={[styles.cardSectionInner, { borderColor: theme.border, backgroundColor: theme.bgCard }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[
                  styles.quickBtn,
                  { borderColor: theme.borderActive, backgroundColor: isDark ? 'rgba(72, 163, 243, 0.1)' : 'rgba(99,102,241,0.07)' },
                ]}
                onPress={() => navigation.navigate('Documents', { screen: 'UploadDocument' })}
                activeOpacity={0.75}
              >
                <View style={[styles.quickBtnIcon, { backgroundColor: `${theme.primary}22` }]}>
                  <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.quickBtnText, { color: theme.textPrimary }]}>Upload{'\n'}Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickBtn,
                  { borderColor: `${theme.accent}44`, backgroundColor: isDark ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.07)' },
                ]}
                onPress={() => navigation.navigate('Jobs', { screen: 'AddJob' })}
                activeOpacity={0.75}
              >
                <View style={[styles.quickBtnIcon, { backgroundColor: `${theme.accent}22` }]}>
                  <Ionicons name="add-circle-outline" size={20} color={theme.accent} />
                </View>
                <Text style={[styles.quickBtnText, { color: theme.textPrimary }]}>Add{'\n'}Application</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={[styles.fab, shadow, { backgroundColor: theme.primary }]}
        onPress={() => setShowChatbot(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <ChatbotModal
        visible={showChatbot}
        onClose={() => setShowChatbot(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 24 },

  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  greetingAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#e5e7eb' },
  greetingAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  greetingSubtitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  greeting: { ...typography.h3, lineHeight: 28 },
  email: { ...typography.caption, marginTop: 2 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  dropdown: {
    position: 'absolute',
    top: spacing.lg + 50,
    right: spacing.lg,
    width: 300,
    maxHeight: 400,
    borderRadius: radius.lg,
    borderWidth: 1,
    zIndex: 100,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  dropdownTitle: { ...typography.h3, fontSize: 16 },
  dropdownAction: { ...typography.captionBold },
  dropdownList: { padding: spacing.sm, maxHeight: 340 },
  dropdownEmpty: { textAlign: 'center', padding: spacing.lg, ...typography.body },
  notifItem: {
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  notifTitle: { ...typography.captionBold, fontSize: 13, marginBottom: 2 },
  notifMessage: { ...typography.caption, fontSize: 12, lineHeight: 16 },
  notifTime: { ...typography.caption, fontSize: 10, marginTop: 4 },

  combinedSummaryCard: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: '60%',
    opacity: 0.6,
  },

  // Pipeline card
  pipelineCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  pipelineInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },

  // Generic sections
  cardSection: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  cardSectionInner: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
  },

  sectionTitle: {
    ...typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressLabel: { ...typography.captionBold, width: 80 },
  progressBar: {
    flex: 1, height: 8, borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  progressCount: { ...typography.captionBold, width: 24, textAlign: 'right' },

  activityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 6,
  },
  activityIcon: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  activityContent: { flex: 1 },
  activityName: { ...typography.bodyBold },
  activityMeta: { ...typography.caption, marginTop: 2 },

  emptyActivity: { ...typography.body, textAlign: 'center', paddingVertical: spacing.md },

  quickActions: { flexDirection: 'row', gap: 12 },
  quickBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quickBtnIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: { ...typography.captionBold, textAlign: 'center', lineHeight: 18 },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 100,
  },
});


