import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppNavigator } from './AppNavigator';

export const navigationRef = createNavigationContainerRef();

export const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
};
