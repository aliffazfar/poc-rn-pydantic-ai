/** @type {import('react-native-worklets/plugin').PluginOptions} */
const workletsPluginOptions = {
  // Your custom options.
};

// React Compiler config for React 19
// See: https://react.dev/learn/react-compiler
const ReactCompilerConfig = {
  target: '19',

  // Log which components/hooks are being compiled
  // This will output to Metro terminal during build
  logger: {
    logEvent(filename, event) {
      // Only log successful compilations (filter out skips)
      if (event.kind === 'CompileSuccess') {
        console.log(
          `[React Compiler] ✓ Compiled: ${event.fnName} in ${filename}`,
        );
      }
      // Uncomment to see skipped components (too verbose for normal use)
      // if (event.kind === 'CompileSkip') {
      //   console.log(`[React Compiler] ⊘ Skipped: ${event.fnName} - ${event.reason}`);
      // }
    },
  },
};

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // React Compiler must be first
    ['babel-plugin-react-compiler', ReactCompilerConfig],
    // react-native-worklets/plugin MUST be listed last (replaces reanimated/plugin in v4)
    ['react-native-worklets/plugin', workletsPluginOptions],
  ],
};
