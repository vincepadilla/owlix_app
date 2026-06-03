import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DocumentsScreen from '../screens/documents/DocumentsScreen';
import UploadDocumentScreen from '../screens/documents/UploadDocumentScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import AddJobScreen from '../screens/jobs/AddJobScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const DocsStack = createNativeStackNavigator();
const JobsStack = createNativeStackNavigator();

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

function DocumentsStack() {
  const { theme } = useTheme();
  return (
    <DocsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.bgCard },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <DocsStack.Screen name="DocumentsList" component={DocumentsScreen} options={{ title: 'My Documents' }} />
      <DocsStack.Screen name="UploadDocument" component={UploadDocumentScreen} options={{ title: 'Upload Document' }} />
      <DocsStack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
    </DocsStack.Navigator>
  );
}

function JobApplicationsStack() {
  const { theme } = useTheme();
  return (
    <JobsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.bgCard },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <JobsStack.Screen name="JobsList" component={JobsScreen} options={{ title: 'Job Applications' }} />
      <JobsStack.Screen name="AddJob" component={AddJobScreen} options={{ title: 'Add Application' }} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Application Detail' }} />
    </JobsStack.Navigator>
  );
}

export default function AppNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bgCard,
          height: 65 + (insets.bottom > 0 ? insets.bottom - 15 : 0),
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 10,
          paddingHorizontal: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Documents: focused ? 'folder' : 'folder-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Documents" component={DocumentsStack} />
      <Tab.Screen name="Jobs" component={JobApplicationsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
