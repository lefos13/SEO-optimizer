/**
 * Webpack Configuration for Main Process (Electron)
 * Compiles TypeScript main process files
 */
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main.ts',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
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
      '@analyzers': path.resolve(__dirname, 'src/analyzers'),
      '@database': path.resolve(__dirname, 'src/database'),
      '@main': path.resolve(__dirname, 'src/main'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    // Don't bundle native modules
    electron: 'commonjs2 electron',
    'electron-reload': 'commonjs2 electron-reload',
    chokidar: 'commonjs2 chokidar',
    'sql.js': 'commonjs2 sql.js',
  },
};
