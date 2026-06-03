import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import JobCard from '../../components/JobCard';
import { radius, spacing, typography } from '../../theme/colors';

const STATUS_FILTERS = ['All', 'Applied', 'Interview', 'Offered', 'Rejected'];

export default function JobsScreen({ navigation }) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
      applyFilter(data || [], activeFilter);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchJobs);
    return unsubscribe;
  }, [navigation, fetchJobs]);

  const applyFilter = (jobList, status) => {
    setFiltered(status === 'All' ? jobList : jobList.filter(j => j.status === status));
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    applyFilter(jobs, status);
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="briefcase-outline" size={64} color={theme.textMuted} />
      <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No applications yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>Tap + to add your first job application</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]} edges={['left', 'right']}>
      {/* Filter chips — glassmorphism style */}
      <View style={[styles.filterRow, { paddingTop: spacing.sm }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            return (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleFilterChange(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? (isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)')
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.70)'),
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                  isActive && {
                    shadowColor: theme.primary,
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3,
                  },
                ]}
              >
                
                <Text style={[
                  styles.filterText,
                  { color: isActive ? theme.primary : theme.textSecondary },
                  isActive && { fontWeight: '700' },
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.primary} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { job: item })} />
          )}
          contentContainerStyle={[styles.list, !filtered.length && styles.listEmpty, { paddingTop: spacing.sm }]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchJobs(); }}
              tintColor={theme.primary}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        onPress={() => navigation.navigate('AddJob')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  filterRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  filterText: { ...typography.captionBold },

  list: { padding: spacing.md, paddingBottom: 24 },
  listEmpty: { flex: 1 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.body },

  loader: { flex: 1 },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});


