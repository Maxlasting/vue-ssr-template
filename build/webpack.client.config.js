const webpack = require('webpack')
// 用来合拼 webpack 配置
const merge = require('webpack-merge')
// 用来打包 客户端 配置的 json 文件
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const baseConfig = require('./webpack.base.config.js')
const { join } = require('path')

const config = merge(baseConfig, {
  // 配置入口选项，客户端为 entry-client.js
  entry: {
    app: join(__dirname, '../src/entry-client.js')
  },
  // 配置输出选项 文件名
  output: {
    filename: '[name]-[chunkhash].js'
  },
  // 开发时候用来调试的 map 工具
  devtool: '#cheap-module-source-map',
  // 打包的目标对象为web端
  target: 'web',
  // 代码分割模式，提取公共代码的配置
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取所有引用 node_modules 中的模块打包为一个单独的 vendor.js
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          enforce: true
        }
      }
    },
    // 分离 webpack 配置文件为 manifest.js
    runtimeChunk: {
      name: 'manifest'
    }
  },
  plugins: [
    // 可以为每个懒加载的路由单独设置一个名字，而不是 id 0 1 2...
    new webpack.NamedChunksPlugin(),
    // 定义环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_ENV': '"client"'
    }),
    // 服务端渲染必须使用的插件，用来生产 clientManifest json 文件
    new VueSSRClientPlugin()
  ]
})

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'false'
}

module.exports = config
