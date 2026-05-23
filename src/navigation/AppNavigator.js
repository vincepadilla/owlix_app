import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DocumentsScreen from '../screens/documents/DocumentsScreen';
import UploadDocumentScreen from '../screens/documents/UploadDocumentScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import AddJobScreen from '../screens/jobs/AddJobScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';

const Tab = createBottomTabNavigator();
const DocsStack = createNativeStackNavigator();
const JobsStack = createNativeStackNavigator();

function DocumentsStack() {
  return (
    <DocsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.textPrimary,
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
  return (
    <JobsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTintColor: colors.textPrimary,
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Documents: focused ? 'folder' : 'folder-outline',
            Jobs: focused ? 'briefcase' : 'briefcase-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ headerShown: true, headerTitle: 'CareerVault', headerStyle: { backgroundColor: colors.bgCard }, headerTitleStyle: { color: colors.textPrimary, fontWeight: '800', fontSize: 20 } }}
      />
      <Tab.Screen name="Documents" component={DocumentsStack} />
      <Tab.Screen name="Jobs" component={JobApplicationsStack} />
    </Tab.Navigator>
  );
}
