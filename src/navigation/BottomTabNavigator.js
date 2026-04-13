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

const Tab = createBottomTabNavigator();

// Home indicator bar (black pill at very bottom)
const HomeIndicator = () => (
  <View style={styles.homeIndicatorWrapper}>
    <Svg width={134} height={5} viewBox="0 0 134 5" fill="none">
      <Rect width="134" height="5" rx="2.5" fill="black" />
    </Svg>
  </View>
);

export const BottomTabNavigator = () => {
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
          tabBarActiveTintColor: '#E94057',
          tabBarInactiveTintColor: '#ADAFBB',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 12,
            shadowColor: '#000',
            shadowOpacity: 0.08,
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

      {/* Home indicator pill at the very bottom */}
      <HomeIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  homeIndicatorWrapper: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    backgroundColor: '#FFFFFF',
  },
});
