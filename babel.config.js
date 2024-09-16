module.exports = function (api) {
  api.cache(true);
  const disableImportExportTransform = true;
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          native: {
            disableImportExportTransform,
          },
          web: {
            disableImportExportTransform,
          },
        },
      ],
      "nativewind/babel",
    ],
  };
};
