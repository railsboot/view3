const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack')

module.exports = (env = {}) => ({
  mode: env.production ? 'production' : 'development',
  stats: 'minimal',
  entry: {
    main: './examples/main.js'
  },
  output: {
    path: path.resolve(__dirname, "./examples/dist"),
    filename: "[name]-[fullhash].js",
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: { whitespace: 'preserve' }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          },
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.less' , '.scss', '.css']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './examples/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[fullhash].css'
    }),
    new VueLoaderPlugin({ whitespace: 'preserve' })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, './examples'),
      serveIndex: true,
    },
    hot: true,
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
    historyApiFallback: true
  }
})
