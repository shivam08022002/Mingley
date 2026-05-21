import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../features/onboarding/screens/SplashScreen';
import { GetStartedScreen } from '../features/onboarding/screens/GetStartedScreen';
import { CarouselScreen } from '../features/onboarding/screens/CarouselScreen';
import { SignupOptionsScreen } from '../features/auth/screens/SignupOptionsScreen';
import { PhoneInputScreen } from '../features/auth/screens/PhoneInputScreen';
import { EmailInputScreen } from '../features/auth/screens/EmailInputScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../features/auth/screens/ResetPasswordScreen';
import { OTPVerificationScreen } from '../features/auth/screens/OTPVerificationScreen';
import { ProfileDetailsScreen } from '../features/profile-setup/screens/ProfileDetailsScreen';
import { GenderSelectionScreen } from '../features/profile-setup/screens/GenderSelectionScreen';
import { InterestsSelectionScreen } from '../features/profile-setup/screens/InterestsSelectionScreen';
import { ContactsPermissionScreen } from '../features/profile-setup/screens/ContactsPermissionScreen';
import { NotificationsPermissionScreen } from '../features/profile-setup/screens/NotificationsPermissionScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="Carousel" component={CarouselScreen} />
      <Stack.Screen name="Welcome" component={SignupOptionsScreen} />
      <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <Stack.Screen name="EmailInput" component={EmailInputScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="GenderSelection" component={GenderSelectionScreen} />
      <Stack.Screen name="InterestsSelection" component={InterestsSelectionScreen} />
      <Stack.Screen name="ContactsPermission" component={ContactsPermissionScreen} />
      <Stack.Screen name="NotificationsPermission" component={NotificationsPermissionScreen} />
    </Stack.Navigator>
  );
};
