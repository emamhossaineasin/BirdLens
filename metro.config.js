// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// const defaultConfig = getDefaultConfig(__dirname);

// const config = {
//   resolver: {
//     assetExts: [...defaultConfig.resolver.assetExts, 'bin', 'tflite'],
//   },
// };

// module.exports = mergeConfig(defaultConfig, config);

const {
  getDefaultConfig,
  mergeConfig,
} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native/src/private/featureflags/ReactNativeFeatureFlags') {
        return {
          type: 'sourceFile',
          filePath: path.join(
            __dirname,
            'node_modules/react-native/src/private/featureflags/ReactNativeFeatureFlags.js',
          ),
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
    assetExts: defaultConfig.resolver.assetExts.includes('tflite')
      ? defaultConfig.resolver.assetExts
      : [...defaultConfig.resolver.assetExts, 'tflite'],
  },
};

module.exports = mergeConfig(defaultConfig, config);