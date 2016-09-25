var path = require('path');
var webpack = require('webpack');
var NODE_ENV = process.env.NODE_ENV;

var webPackConfig = {
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'project', 'game.js'),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\.(frag|vert|fs|vs|glsl)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    port: 3000,
  },
  output: {
    path: path.resolve(__dirname, 'public', 'build'),
    filename: 'game.min.js',
    publicPath: '/build/',
  },
  plugins: NODE_ENV == 'production' ? [
     new webpack.optimize.UglifyJsPlugin({
      minimize: true,
    }),
  ] : [],
};

module.exports = webPackConfig;
