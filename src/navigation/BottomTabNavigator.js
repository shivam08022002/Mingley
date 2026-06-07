import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { DiscoverScreen } from '../features/discover/screens/DiscoverScreen';
import { MatchesScreen } from '../features/matches/screens/MatchesScreen';
import { MessagesListScreen } from '../features/chat/screens/MessagesListScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import {
  DiscoverTabIcon,
  MatchesTabIcon,
  MessagesTabIcon,
  ProfileTabIcon,
} from './TabIcons';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();



export const BottomTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            if (route.name === 'Discover') return <DiscoverTabIcon focused={focused} />;
            if (route.name === 'Matches')  return <MatchesTabIcon focused={focused} />;
            if (route.name === 'Messages') return <MessagesTabIcon focused={focused} />;
            if (route.name === 'Profile')  return <ProfileTabIcon focused={focused} />;
          },
          tabBarActiveTintColor: theme.iconActive,
          tabBarInactiveTintColor: theme.iconInactive,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            borderTopWidth: 1,
            borderTopColor: theme.isDark ? '#333333' : '#E2E8F0',
            borderBottomWidth: 0,
            elevation: theme.isDark ? 0 : 12,
            shadowColor: '#000',
            shadowOpacity: theme.isDark ? 0 : 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -2 },
            height: Platform.OS === 'ios' ? 82 : 68,
            paddingBottom: Platform.OS === 'ios' ? 12 : 8,
            paddingTop: 14,
          },
        })}
      >
        <Tab.Screen name="Discover"  component={DiscoverScreen} />
        <Tab.Screen name="Matches"   component={MatchesScreen} />
        <Tab.Screen name="Messages"  component={MessagesListScreen} />
        <Tab.Screen name="Profile"   component={ProfileScreen} />
      </Tab.Navigator>


    </View>
  );
};

const styles = StyleSheet.create({

});
