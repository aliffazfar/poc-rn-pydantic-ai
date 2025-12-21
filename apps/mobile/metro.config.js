const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    unstable_enablePackageExports: true,
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],
  },
  watchFolders: [
    projectRoot,
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ],
});

// withUniwindConfig MUST be the outermost wrapper
module.exports = withUniwindConfig(config, {
  // Relative path to your global.css file
  cssEntryFile: "./src/global.css",
  // Path where Uniwind auto-generates typings
  dtsFile: "./src/uniwind-types.d.ts",
});
