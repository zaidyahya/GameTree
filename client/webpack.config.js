var path = require('path');
const webpack = require('webpack');

var config = {
    entry: './src/index.js',
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
          },
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.(png|svg|jpe?g|gif)$/,
            include: /images/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  outputPath: 'images/',
                  publicPath: 'images/'
                }
              }
            ]
          }
        ]
    },
    resolve: {
    extensions: ['*', '.js', '.jsx']
    },
    output: {
      path: __dirname + '/dist',
      publicPath: '/',
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
      contentBase: './dist',
      historyApiFallback: true,
      hot: true,
      proxy: [
        {
          //index: '',
          context: ['/api'],
          // context: ['/auth', '/api'],
          target: 'http://localhost:5000',
          //pathRewrite: {'^/api' : ''},
          //changeOrigin: true,
          secure: false
        }
      ]
    }
};

module.exports = config;