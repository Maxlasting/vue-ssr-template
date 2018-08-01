const Koa = require('koa')
const KoaRouter = require('koa-router')
const fs = require('fs')
const { join } = require('path')
const { createBundleRenderer } = require('vue-server-renderer')
const LRU = require('lru-cache')
const favicon = require('koa-favicon')
const koaBody = require('koa-body')
const koaSend = require('koa-send')

const app = new Koa()
const router = new KoaRouter()

const isDev = process.env.NODE_ENV === 'development'
const port = process.env.PORT || 8080

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    if (e.url) {
      isDev && console.log('重定向 ==========>', e.url)
      ctx.redirect(e.url)
      return
    }
    if (e.code == 404) {
      ctx.status = 404
      ctx.body = '404 | Not Found.'
      return
    }
    ctx.status = 500
    ctx.body = isDev ? e.message : '500 Server Error.'
    isDev && console.log(e.message)
  }
})

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 100 * 1024 * 1024
  }
}))

app.use(favicon(join(__dirname, './favicon.png')))

const createRenderer = (bundle, options) => createBundleRenderer(
  bundle,
  Object.assign(options, {
    cache: LRU({
      max: 1000, 
      maxAge: 1000 * 60 * 15
    }),
    runInNewContext: false
  })
)

let renderer = null
let readyPromise = null
let templatePath = join(__dirname, './index.template.html')

if (isDev) {
  const setupDevServer = require('./build/setup-dev-server.js')

  readyPromise = setupDevServer(app, templatePath, (bundle, options) => {
    renderer = createRenderer(bundle, options)
  })
} else {
  const template = fs.readFileSync(templatePath, 'utf-8')
  const bundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')

  renderer = createRenderer(bundle, {
    template,
    clientManifest
  })
}

// ---- start ----
// 这里来写自定义接口等服务
const apiRouter = new KoaRouter({ prefix: '/api' })



app.use(apiRouter.routes()).use(apiRouter.allowedMethods())
// ---- end ----

const render = async (ctx, next) => {
  const s = Date.now()

  ctx.set('Content-Type', 'text/html')

  const context = {
    url: ctx.url
  }

  const html = await renderer.renderToString(context)
  
  ctx.body = html

  isDev && console.log(`渲染用时：${Date.now() - s}ms`)
}

router.get('/dist/*', async (ctx) => {
  await koaSend(ctx, ctx.path)
})

router.get('*', isDev ? (ctx) => readyPromise.then(() => render(ctx)) : render)

app.use(router.routes()).use(router.allowedMethods())

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})
