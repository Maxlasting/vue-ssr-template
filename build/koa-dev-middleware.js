const webpackDevMiddleware = require('webpack-dev-middleware')

const koaDevMiddleware = (compiler, options) => {
  const expressDevMiddleware = webpackDevMiddleware(compiler, options)

  const { fileSystem } = expressDevMiddleware

  const middleware = (ctx, next) => new Promise((resolve, reject) => {
    const res = {
      end: content => {
        ctx.body = content
        resolve()
      },
      setHeader: (key, val) => ctx.set(key, val)
    }
    expressDevMiddleware(ctx.req, res, reject)
  }).catch(next)
  
  return { middleware, fileSystem }
}

module.exports = koaDevMiddleware
