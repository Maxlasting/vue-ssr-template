const webpackHotMiddleware = require('webpack-hot-middleware')

const koaHotMiddleware = (compiler, options) => {
  const expressHotMiddleware = webpackHotMiddleware(compiler, options)

  return (ctx, next) => new Promise((resolve) => {
    expressHotMiddleware(ctx.req, ctx.res, resolve)
  }).then(next)
}

module.exports = koaHotMiddleware
