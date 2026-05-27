import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Navigation } from './src/navigation';
import { Toast } from './src/components/common/Toast';

// Inject global CSS fixes for web platform
if (Platform.OS === 'web') {
  // Fix viewport to prevent zoom in on mobile web
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

  const style = document.createElement('style');
  style.textContent = `
    /* Remove blue browser outline on all inputs */
    input, textarea, select {
      outline: none !important;
      -webkit-appearance: none;
    }
    /* Ellipsis placeholder clipping fix */
    input::placeholder {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Fix modal backdrop on web */
    [data-testid="modal-backdrop"], .RNModal {
      position: fixed !important;
    }
    /* Hide scrollbars visually but keep scrollable */
    ::-webkit-scrollbar {
      width: 0px;
      background: transparent;
    }
    /* Prevent body scroll when modal is open */
    body {
      overflow: hidden;
      margin: 0;
      padding: 0;
      background-color: #0F0F14 !important;
    }
    /* Constrain app to maximum 480px and center horizontally */
    #root {
      max-width: 450px;
      margin: 0 auto;
      background-color: #FFFFFF;
      box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.45);
      position: relative;
      overflow: hidden;
      height: 100%;
    }
    /* Full height root */
    html, body {
      height: 100%;
    }
  `;
  document.head.appendChild(style);
}

import { useAuthStore } from './src/store/useAuthStore';
import { signalRService } from './src/services/signalRService';

function App() {
  useEffect(() => {
    // Listen to changes in auth state to build / terminate live websockets
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.isAuthenticated) {
        signalRService.start();
      } else {
        signalRService.stop();
      }
    });

    // Check in case user is already authenticated
    const initialAuth = useAuthStore.getState().isAuthenticated;
    if (initialAuth) {
      signalRService.start();
    }

    return () => unsubscribe();
  }, []);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Navigation />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.webContainer}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#0F0F14',
    width: '100%',
    height: '100%',
  },
  webContainer: {
    flex: 1,
    maxWidth: 450,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 0px 40px rgba(0, 0, 0, 0.45)',
    overflow: 'hidden',
  },
});

export default App;
