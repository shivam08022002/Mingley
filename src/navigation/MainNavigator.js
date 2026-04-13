import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileDetailsScreen } from '../features/profile-setup/screens/ProfileDetailsScreen';
import { GenderSelectionScreen } from '../features/profile-setup/screens/GenderSelectionScreen';
import { InterestsSelectionScreen } from '../features/profile-setup/screens/InterestsSelectionScreen';
import { ContactsPermissionScreen } from '../features/profile-setup/screens/ContactsPermissionScreen';
import { NotificationsPermissionScreen } from '../features/profile-setup/screens/NotificationsPermissionScreen';
import { ChatScreen } from '../features/chat/screens/ChatScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { GalleryScreen } from '../features/profile/screens/GalleryScreen';
import { SubscriptionIntroScreen } from '../features/subscription/screens/SubscriptionIntroScreen';
import { SubscriptionPlansScreen } from '../features/subscription/screens/SubscriptionPlansScreen';
import { PaymentScreen } from '../features/subscription/screens/PaymentScreen';
import { MatchScreen } from '../features/discover/screens/MatchScreen';
import { UserProfileScreen } from '../features/discover/screens/UserProfileScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="GenderSelection" component={GenderSelectionScreen} />
      <Stack.Screen name="InterestsSelection" component={InterestsSelectionScreen} />
      <Stack.Screen name="ContactsPermission" component={ContactsPermissionScreen} />
      <Stack.Screen name="NotificationsPermission" component={NotificationsPermissionScreen} />
      <Stack.Screen name="Home" component={BottomTabNavigator} />
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* Detail / Module flows */}
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="SubscriptionIntro" component={SubscriptionIntroScreen} />
      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />

      {/* Discover flows */}
      <Stack.Screen
        name="Match"
        component={MatchScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};
