import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isTablet = width > 500;

  // Dynamic bottom padding: if the device has a bottom inset (like notch or display buttons), 
  // use it. Otherwise, fallback to a sensible padding of 12 for older/flat screen styling.
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;
  const tabHeight = isTablet ? 68 : (60 + bottomPadding);

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
            borderTopWidth: isTablet ? 0 : 1,
            borderTopColor: theme.isDark ? '#333333' : '#E2E8F0',
            borderBottomWidth: 0,
            elevation: theme.isDark ? 0 : 12,
            shadowColor: '#000',
            shadowOpacity: theme.isDark ? 0 : 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -2 },
            height: tabHeight,
            paddingBottom: isTablet ? 0 : bottomPadding,
            paddingTop: isTablet ? 0 : 14,
            
            // Foldable/Tablet floating capsule optimization
            ...(isTablet && {
              position: 'absolute',
              bottom: insets.bottom > 0 ? insets.bottom + 12 : 20,
              left: '50%',
              marginLeft: -220, // centers the 440px wide tab bar
              width: 440,
              borderRadius: 30,
              borderWidth: 1,
              borderColor: theme.isDark ? '#333333' : '#E2E8F0',
              elevation: 8,
              shadowOpacity: 0.15,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              paddingHorizontal: 16,
            }),
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
