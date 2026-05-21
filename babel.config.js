module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Note: SDK 50+ auto-includes the react-native-reanimated plugin when
    // the package is installed, so we don't list it explicitly here.
  };
};
