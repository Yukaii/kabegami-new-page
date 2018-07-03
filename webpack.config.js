'use strict';
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const devMode = process.env.NODE_ENV === 'production';

let webpackConfig = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    page: './src/page',
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([{
      from: '*',
      context: 'extension'
    }]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new VueLoaderPlugin()
  ],
  output: {
    path: path.join(__dirname, 'extension_dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/],
      }
    }, {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }]
  }
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new CleanWebpackPlugin([
      path.join(__dirname, 'extension_dist')
    ])
  ])
}

module.exports = webpackConfig;
