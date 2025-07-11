const { plugin } = require("mongoose");

module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        [
          'babel-plugin-dotenv-import',
          {
            moduleName: '@env',
            path: '.env',
          },
        ],
      ]
    };
  };