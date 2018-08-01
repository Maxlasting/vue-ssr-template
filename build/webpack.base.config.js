const webpack = require('webpack')
// 用来分离 css 到单独的文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 用来处理 .vue 文件中的内容
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// 优化打包进度显示
const WebpackProgressOraPlugin = require('webpack-progress-ora-plugin')
const { join } = require('path')
// 所有的的静态资源处理 loader
const staticLoader = require('./static-loader.js')

const config = {
  // 指定打包模式，分为 development 和 production
  mode: process.env.NODE_ENV,
  // 输出配置
  output: {
    path: join(__dirname, '../dist'),
    // 注意，这里需要设定为 /dist/ 的原因是服务端渲染依然要获取打包出来的文件
    publicPath: '/dist/'
  },
  performance: {
    // 在某个文件过大的时候，会提出警告，设置为 false 为忽略警告，也可以配置 maxEntrypointSize 来调整
    hints: false
  },
  resolve: {
    alias: {
      // 指定 vue 的别名为 runtime + esm 版本的，这样才可以使用 render 函数
      vue: join(__dirname, '../node_modules/vue/dist/vue.runtime.esm.js')
    }
  },
  module: {
    // 用来处理各个扩展名文件的 loader
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // 将静态资源 loader 添加，这个参数只是在 production 环境下才会使用
      ...staticLoader(MiniCssExtractPlugin)
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

// 如果是生产环境，那么就添加提取 css 的插件以及 打包时候的进度优化提示
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css'
    }),
    new WebpackProgressOraPlugin({ clear: true })
  )
}

module.exports = config