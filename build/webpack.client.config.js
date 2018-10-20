const webpack = require('webpack')
const merge = require('webpack-merge')
const { join } = require('path')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const baseConfig = require('./webpack.base.config.js')

const cssLoader = function (loader) {
  const use = [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
  return loader ? use.concat([loader]) : use
}

const config = merge(baseConfig, {
  target: 'web',
  entry: {
    app: join(__dirname, '../src/entry-client.js')
  },
  devtool: false,
  output: {
    filename: '[name]-[chunkhash].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /css$/,
          enforce: true
        },
        vendor: {
          name: 'vendor',
          test: /[\/]node_modules[\/]/,
          enforce: true
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    }
  },
  module: {
    rules: [
      {
        test: /\.css(\?.*)?$/,
        use: cssLoader()
      },
      {
        test: /\.s(c|a)ss(\?.*)?$/,
        use: cssLoader('sass-loader')
      },
      {
        test: /\.less(\?.*)?$/,
        use: cssLoader('less-loader')
      },
      {
        test: /\.styl(us)?(\?.*)?$/,
        use: cssLoader('stylus-loader')
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VUE_ENV': '"client"'
    }),
    new webpack.NamedChunksPlugin(),
    new VueSSRClientPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css'
    }),
    new OptimizeCssAssetsWebpackPlugin({
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        discardComments: { removeAll: true }
      },
      canPrint: true
    })
  ]
})

module.exports = config
