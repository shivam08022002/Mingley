/**
 * @format
 * Entry point for web (React Native Web + Metro).
 * Uses AppRegistry directly to avoid the broken expo package main field.
 */
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('main', () => App);

// Web-only: mount to #root
if (typeof document !== 'undefined') {
  AppRegistry.runApplication('main', {
    rootTag: document.getElementById('root') || document.getElementById('app'),
  });
}
