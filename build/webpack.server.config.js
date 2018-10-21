const webpack = require('webpack')
const merge = require('webpack-merge')
const { join } = require('path')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const baseConfig = require('./webpack.base.config.js')

const config = merge(baseConfig, {
  devtool: '#source-map',
  entry: {
    app: join(__dirname, '../src/entry-server.js')
  },
  target: 'node',
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.(css|s(c|a)ss|less|styl(us))(\?.*)?/,
        use: 'null-loader'
      }
    ]
  },
  externals: ['vue', 'vue-router', 'vuex', 'vue-server-renderer'],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_ENV': '"server"'
    }),
    new VueSSRServerPlugin()
  ]
})

module.exports = config
