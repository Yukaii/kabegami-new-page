'use strict';
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let webpackConfig = {
  entry: {
    page: './src/page',
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([{
      from: '*',
      context: 'extension'
    }])
  ],
  output: {
    path: path.join(__dirname, 'extension_dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      loader: 'ts-loader'
    }]
  }
};

module.exports = webpackConfig;
