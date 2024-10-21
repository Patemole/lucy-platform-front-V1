const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/components/ChatWidget.tsx',
  output: {
    filename: 'chat-widget.js',
    path: path.resolve(__dirname, 'public/drexel.edu'),
    library: 'ChatWidget',
    libraryTarget: 'window',
    libraryExport: 'default',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: [
              'transform-inline-environment-variables', // Added this plugin
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'images',
            },
          },
        ],
      },
    ],
  },
  // Removed the DefinePlugin configuration
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env.NODE_ENV': JSON.stringify('production'),
  //   }),
  // ],
  mode: 'production',
};