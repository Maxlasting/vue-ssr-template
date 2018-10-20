const webpack = require('webpack')
const { join } = require('path')
const chokidar = require('chokidar')
const MFS = require('memory-fs')
const fs = require('fs')
const webpackDevKoaMiddleware = require('webpack-dev-koa-middleware')
const webpackHotKoaMiddleware = require('webpack-hot-koa-middleware')
const clientConfig = require('./webpack.client-dev.config.js')
const serverConfig = require('./webpack.server.config.js')

const readFile = (fs, file) => fs.readFileSync(
  join(clientConfig.output.path, file),
  'utf-8'
)

const cacheErrors = stats => {
  const { errors, warnings } = stats.toJson()
  if (errors && errors.length) errors.forEach(err => console.error(err))
  if (warnings && warnings.length) warnings.forEach(warn => console.warn(warn))
}

module.exports = setupDevServer

function setupDevServer (app, templatePath, cb) {
  let bundle
  let template
  let clientManifest
  let ready

  const readyPromise = new Promise(resolve => ready = resolve)

  const update = () => {
    if (bundle && clientManifest && template) {
      ready()
      cb && cb(bundle, { template, clientManifest })
    }
  }

  template = fs.readFileSync(templatePath, 'utf-8')

  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html has been updated.')
    update()
  })

  const clientCompiler = webpack(clientConfig)

  const devMiddleware = webpackDevKoaMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent'
  })

  const hotMiddleware = webpackHotKoaMiddleware(clientCompiler, {
    heartbeat: 5000,
    log: false
  })

  clientCompiler.plugin('done', (stats) => {
    cacheErrors(stats)

    clientManifest = JSON.parse(readFile(
      devMiddleware.fileSystem,
      'vue-ssr-client-manifest.json'
    ))

    update()
  })

  app.use(devMiddleware.middleware).use(hotMiddleware)

  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()

  serverCompiler.outputFileSystem = mfs

  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err

    cacheErrors(stats)

    bundle = JSON.parse(readFile(
      mfs,
      'vue-ssr-server-bundle.json'
    ))

    update()
  })

  return readyPromise
}


