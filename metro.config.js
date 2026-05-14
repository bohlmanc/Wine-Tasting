const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @react-native-ml-kit packages ship TypeScript source directly (main: index.ts).
// Metro ignores node_modules by default, so we must opt this package into transformation.
const defaultIgnore =
  'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?(/.*)?|@expo-google-fonts(/.*)?|react-navigation|@react-navigation(/.*)?|@unimodules(/.*)?|unimodules|sentry-expo|native-base|react-native-svg)';

config.transformer.transformIgnorePatterns = [
  defaultIgnore.replace(
    'react-native-svg)',
    'react-native-svg|@react-native-ml-kit(/.*)?)',
  ),
];

module.exports = config;
