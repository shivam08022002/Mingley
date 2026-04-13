import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../features/onboarding/screens/SplashScreen';
import { GetStartedScreen } from '../features/onboarding/screens/GetStartedScreen';
import { CarouselScreen } from '../features/onboarding/screens/CarouselScreen';
import { SignupOptionsScreen } from '../features/auth/screens/SignupOptionsScreen';
import { PhoneInputScreen } from '../features/auth/screens/PhoneInputScreen';
import { EmailInputScreen } from '../features/auth/screens/EmailInputScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { OTPVerificationScreen } from '../features/auth/screens/OTPVerificationScreen';

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
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
};
