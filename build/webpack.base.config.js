const { join } = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpackProgressOraPlugin = require('webpack-progress-ora-plugin')

process.noDeprecation = true

const config = {
  mode: process.env.NODE_ENV,
  devtool: false,
  output: {
    path: join(__dirname, '../dist'),
    publicPath: '/dist/'
  },
  performance: {
    hints: false
  },
  resolve: {
    alias: {
      'vue': join(__dirname, '../node_modules/vue/dist/vue.runtime.js'),
      'create-app': join(__dirname, '../src/app.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.js(\?.*)?$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        include: join(__dirname, '../src/')
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'images/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(woff2|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'fonts/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(mp3|mp4|ogg|webm|aac|flac)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'medias/[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpackProgressOraPlugin()
  )
}

module.exports = config
