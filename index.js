const Koa = require('koa')
const KoaRouter = require('koa-router')
const { createBundleRenderer } = require('vue-server-renderer')
const LRU = require('lru-cache')
const favicon = require('koa-favicon')
const { join } = require('path')

const app = new Koa()
const router = new KoaRouter()
const port = process.env.PORT || 8081

app.use(favicon(join(__dirname, './favicon.png')))

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err.code === 302) {
      ctx.status = 302
      ctx.redirect(err.url)
    } else if (err.code === 404) {
      ctx.status = 404
      ctx.body = '404 | Not Found.'
    } else {
      ctx.status = 500
      ctx.body = err.message
      console.error(err.message)
    }
  }
})

const createRenderer = (bundle, options) => createBundleRenderer(
  bundle,
  Object.assign(
    {
      cache: LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false
    },
    options
  )
)

const setupDevServer = require('./build/setup-dev-server.js')
const templatePath = join(__dirname, './index.template.html')

let renderer = null

const readyPromise = setupDevServer(app, templatePath, (bundle, options) => {
  renderer = createRenderer(bundle, options)
})

const render = async (ctx) => {
  const start = Date.now()

  ctx.set('Content-Type', 'text/html')

  const context = {
    url: ctx.url
  }

  const html = await renderer.renderToString(context)

  ctx.body = html

  console.log(`渲染用时：${Date.now() - start}ms`)
}

router.get('/*', ctx => readyPromise.then(() => render(ctx)))

app.use(router.routes()).use(router.allowedMethods())

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})
