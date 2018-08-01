const path = require('path')
// 用来监听文件变化的工具模块
const chokidar = require('chokidar')
const webpack = require('webpack')
// 将文件在内存中进行操作
const MFS = require('memory-fs')
const fs = require('fs')
// 获取 ip 地址的模块
const getIpTool = require('./get-Ip-tool.js')
// 更友好的 webpack 编译结果显示
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
// 打包进度条，值在 dev server 时生效
const WebpackBarPlugin = require('webpackbar')
// 开发中间件 koa 版
const koaDevMiddleware = require('./koa-dev-middleware.js')
// 热重载中间件 koa 版
const koaHotMiddleware = require('./koa-hot-middleware.js')
// 客户端配置文件
const clientConfig = require('./webpack.client.config.js')
// 服务端配置文件
const serverConfig = require('./webpack.server.config.js')

// 封装读取文件的函数
const readFile = (fs, file) => fs.readFileSync(
  path.join(clientConfig.output.path, file),
  'utf-8'
)

// 统一的错误处理函数
const handleErrors = (stats) => {
  const { errors, warnings } = stats.toJson()
    
  if (errors && errors.length) errors.forEach(err => console.error(err))
  if (warnings && warnings.length) warnings.forEach(warn => console.warn(warn))
}

module.exports = setupDevServer

/**
 * 核心开发中间件
 * @param {Object} app Koa 对象实例
 * @param {String}} templatePath 模版路径
 * @param {Function} cb 回调函数
 */
function setupDevServer (app, templatePath, cb) {
  let bundle  // 服务端打包出的 json 文件
  let template  // html 模版文件
  let clientManifest  // 客户端打包出的 json 文件
  let ready // resolve 函数

  // 这是个非常重要的 promise 对象，它的 resolve 被 ready 引用，并且在外部执行 
  const readyPromise = new Promise(resolve => ready = resolve)

  // 在每次重新编译或者 修改模版的时候 都要重新执行更新操作
  const update = () => {
    if (bundle && clientManifest) {
      ready()
      cb(bundle, { template, clientManifest })
    }
  }

  // 读取模版文件并监测其变化
  template = fs.readFileSync(templatePath, 'utf-8')

  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html has been updated.')
    update()
  })

  // 添加 热重载配置 noInfo 代表不在控制台打印 hmr 消息
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?noInfo=true',
    clientConfig.entry.app
  ]

  // 这里的名字不能使用 hash 模式
  clientConfig.output.filename = '[name].js'
  
  clientConfig.plugins.push(
    // 热重载必须的插件
    new webpack.HotModuleReplacementPlugin(),
    // 编译进度条，并设置为粉红色
    new WebpackBarPlugin({ color: '#d92b8e' }),
    // 更友好的编译结果提示
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [`您的项目运行在 http://localhost:${process.env.PORT}`],
        notes: [`您也可以查看您的 电脑ip + 端口号 (http://${getIpTool()}:${process.env.PORT}) 来访问！`]
      },
      clearConsole: true
    })
  )

  const clientCompiler = webpack(clientConfig)
  
  const devMiddleware = koaDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent'
  })
  
  const hotMiddleware = koaHotMiddleware(clientCompiler, {
    heartbeat: 5000,
    log: false
  })
  
  clientCompiler.plugin('done', (stats) => {
    handleErrors(stats)
    
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
    
    handleErrors(stats)
    
    bundle = JSON.parse(readFile(
      mfs,
      'vue-ssr-server-bundle.json'
    ))
    
    update()
  })
  
  return readyPromise
}
