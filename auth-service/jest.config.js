const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
