/**
 * Webpack Configuration for Preload Script
 * Compiles TypeScript preload files
 */
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/preload/preload.ts',
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'preload.js',
    clean: false, // Don't clean dist folder
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.main.json',
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    electron: 'commonjs2 electron',
  },
};
