module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-reanimated/plugin must be listed last. It's required
    // by @gorhom/bottom-sheet (used on the Map screen).
    plugins: ["react-native-reanimated/plugin"],
  };
};
