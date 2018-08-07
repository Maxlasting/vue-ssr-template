const { join } = require('path')
// 用来分离 css 到单独的文件
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
// 用来处理 .vue 文件中的内容
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// 优化打包进度显示
const WebpackProgressOraPlugin = require('webpack-progress-ora-plugin')

const config = {
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
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'static/[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

// 这里先不做通用配置，后面再想解决方案，需要其它预处理器，先手动添加
if (process.env.NODE_ENV === 'development') {
  config.module.rules.push(
    {
      test: /\.css$/,
      use: ['vue-style-loader', 'css-loader', 'postcss-loader']
    }
  )
}

if (process.env.NODE_ENV === 'production') {
  config.module.rules.push(
    {
      test: /\.css$/,
      use: ExtractTextWebpackPlugin.extract({
        use: [
          {
            loader: 'css-loader',
            options: { minimize: true }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: join(__dirname, '../postcss.config.js') }
            }
          }
        ],
        fallback: 'vue-style-loader'
      })
    }
  )

  config.plugins.push(
    new ExtractTextWebpackPlugin({
      filename: '[name]-[contenthash].css'
    }),
    new WebpackProgressOraPlugin({ clear: false })
  )
}

module.exports = config