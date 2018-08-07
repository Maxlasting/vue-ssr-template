const webpack = require('webpack')
const merge = require('webpack-merge')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const baseConfig = require('./webpack.base.config.js')
// 可以根据规则 排除打包 一些特定的 文件以及 node_module 下的所有模块，只保留 require
const nodeExternals = require('webpack-node-externals')
const { join } = require('path')

const config = merge(baseConfig, {
  // 服务端入口文件配置
  entry: {
    app: join(__dirname, '../src/entry-server.js')
  },
  // 指定调试工具
  devtool: '#source-map',
  // 打包模式为 node 可用
  target: 'node',
  output: {
    filename: 'server-bundle.js',
    // 模块规范使用 commonjs
    libraryTarget: 'commonjs2'
  },
  externals: nodeExternals({
    // 白名单，排除 css 文件，后面的参考官方示例，这里有待考量
    whitelist: [/\.css$/, /\?vue&type=style/]
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_ENV': '"server"'
    }),
    new VueSSRServerPlugin()
  ]
})

module.exports = config