import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { DepositModal } from '../components/SharedFinanceModals';
import { useChatStore } from '../store/useChatStore';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const depositModalVisible = useChatStore((state) => state.depositModalVisible);
  const setDepositModalVisible = useChatStore((state) => state.setDepositModalVisible);

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      <DepositModal 
        visible={depositModalVisible} 
        onClose={() => setDepositModalVisible(false)} 
      />
    </>
  );
};
