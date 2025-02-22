const { getDefaultConfig } = require("expo/metro-config");
const postcssTransformer = require("react-native-postcss-transformer");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);

module.exports = (() => {
  config.transformer.babelTransformerPath = require.resolve(
    "react-native-css-transformer"
  );

  config.resolver.sourceExts.push("css");

  config.transformer.minifierConfig.compress.drop_console = true;
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: true,
    },
  });

  return withNativeWind(config, { input: "./global.css" });
})();
