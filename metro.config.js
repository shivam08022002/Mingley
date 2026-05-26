const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure ts/tsx are resolved (expo package main points to .ts source)
config.resolver.sourceExts = [
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json',
];

// Disable Expo Router auto-detection (this project uses React Navigation)
// Prevents transform.routerRoot=app being injected into bundle URLs
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let the default resolver handle everything
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
