const webpack = require('webpack')
const merge = require('webpack-merge')
const { join } = require('path')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const FirendErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WebpackBarPlugin = require('webpackbar')
const baseConfig = require('./webpack.base.config.js')

const getIp = () => {
  const os = require('os')
  const interfaces = os.networkInterfaces()

  for (let key in interfaces) {
    const items = interfaces[key]

    for (let i=0; i<items.length; i++) {
      const item = items[i]
      if (item.family === 'IPv4' && !item.internal && item.address !== '127.0.0.1') {
        return item.address
      }
    }
  }
}

const port = process.env.PORT || 8081

const config = merge(baseConfig, {
  target: 'web',
  entry: {
    app: [
      'webpack-hot-middleware/client?noInfo=true',
      join(__dirname, '../src/entry-client.js')
    ]
  },
  devtool: '#cheap-module-source-map',
  output: {
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css(\?.*)?$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.s(c|a)ss(\?.*)?$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'sass-lolader']
      },
      {
        test: /\.less(\?.*)?$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
      {
        test: /\.styl(us)?(\?.*)?$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'stylus-loader']
      }
    ]
  },
  plugins: [
    new WebpackBarPlugin({ color: '#d92b8e' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_ENV': '"client"'
    }),
    new VueSSRClientPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new FirendErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [`您的项目运行在 http://localhost:${port}`],
        notes: [`您也可以查看您的 电脑ip + 端口号 (http://${getIp()}:${port}) 来访问！`]
      },
      clearConsole: true
    })
  ]
})

module.exports = config
