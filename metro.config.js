const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Adds support for `.bin` files.

  'bin'
);

module.exports = config;
