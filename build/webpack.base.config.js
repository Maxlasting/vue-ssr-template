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

const createCssLoader = (test, type, isDev, options = {}) => {
  const use = [
    {
      loader: 'css-loader',
      options: isDev ? {} :{ minimize: true }
    },
    {
      loader: 'postcss-loader',
      options: {
        config: join(__dirname, '../postcss.config.js')
      }
    }
  ]

  if (type !== 'css') use.push({
    loader: type + '-loader',
    options
  })

  return { test, use }
}

const cssLoaderMap = new Map(
  [
    [/\.css$/, 'css'], [/\.less$/, 'less'], [/\.s(a|c)ss$/, 'sass'], [/\.styl(us)?$/, 'stylus']
  ]
)

if (process.env.NODE_ENV === 'development') {
  [...cssLoaderMap].forEach(([test, type]) => config.module.rules.push(
    createCssLoader(test, type, true)
  ))
}

if (process.env.NODE_ENV === 'production') {
  [...cssLoaderMap].forEach(([_test, _type]) => {
    const { test, use } = createCssLoader(_test, _type)

    config.module.rules.push({
      test,
      use: ExtractTextWebpackPlugin.extract({
        use,
        fallback: 'vue-style-loader'
      })
    })
  })

  config.plugins.push(
    new ExtractTextWebpackPlugin({
      filename: '[name]-[contenthash].css'
    }),
    new WebpackProgressOraPlugin({ clear: false })
  )
}

module.exports = config