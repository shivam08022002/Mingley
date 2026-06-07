import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './AppNavigator';
import { navigationRef } from './navigationRef';

export const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};
