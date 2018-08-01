const isProd = process.env.NODE_ENV === 'production'

module.exports = (MiniCssExtractPlugin) => {
  const cssLoaderMap = new Map([
    [/\.css$/, 'css-loader'],
    [/\.scss$/, 'sass-loader'],
    [/\.less$/, 'less-loader'],
    [/\.styl(us)?$/, 'stylus-loader']
  ])

  const mediaLoaderMap = [
    /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    /\.(woff2?|eot|ttf|otf)(\?.*)?$/
  ]

  const cssLoader = ([test, loader]) => {
    const use = ['vue-style-loader', 'css-loader', 'postcss-loader']

    if (loader !== 'css-loader') use.push(loader)

    if (isProd) {
      use.shift()
      use.shift()
      use.unshift(MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { minimize: true } })
    }

    return { test, use }
  }

  const mediaLoader = (test) => ({
    test,
    loader: 'url-loader',
    options: {
      limit: 10240,
      name: 'static/[name]-[hash:7].[ext]'
    }
  })

  return [
    ...mediaLoaderMap.map(test => mediaLoader(test)),
    ...[...cssLoaderMap].map(item => cssLoader(item))
  ]
}
