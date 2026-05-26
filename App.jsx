import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Navigation } from './src/navigation';

// Inject global CSS fixes for web platform
if (Platform.OS === 'web') {
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
      background: #000;
    }
    /* Full height root */
    #root, html, body {
      height: 100%;
    }
  `;
  document.head.appendChild(style);
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
