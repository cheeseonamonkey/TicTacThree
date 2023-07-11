export default {
  input: 'index.js', // entry point of your application
  output: {
    dir: 'dist', // output directory
    format: 'umd', // UMD format
    name: 'MyLibrary', // global variable name for your library
    inlineDynamicImports: true, // inline dynamic imports
  },
};
