module.exports = function (api) {
  // Expo's preset needs to be called inside a function to access api.caller internally
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [],
  };
};