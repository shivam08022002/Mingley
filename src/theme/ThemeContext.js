import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved theme preference on app start
    AsyncStorage.getItem('app_theme').then((value) => {
      if (value !== null) {
        // User has previously set a preference — use it
        setIsDark(value === 'dark');
      } else {
        // First launch: follow the system (OS) theme
        const systemTheme = Appearance.getColorScheme();
        setIsDark(systemTheme === 'dark');
      }
    }).catch(() => {
      // Fallback to light theme if AsyncStorage fails
      setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('app_theme', next ? 'dark' : 'light').catch(() => {});
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside ThemeProvider
    return { theme: lightTheme, isDark: false, toggleTheme: () => {} };
  }
  return context;
};
