import { createApp } from './app.js'

export default ctx => new Promise((resolve, reject) => {
  const { app, store, router } = createApp()

  // 拿到 服务端 传过来的 url
  const { url } = ctx
  // 拿到当前路由对象要跳转的路径
  const { fullPath } = router.resolve(url).route
  
  // 因为路由配置中有可能存在 redirect 这样的配置，所以要进行对比，如果最终得到 path 不一致，要进行重定向
  if (url !== fullPath) return reject({ url: fullPath })
  
  // 如果一致，直接跳转到对应的 url
  router.push(url)

  // 在这中间可以加入 seo 优化的操作，比如添加 vue-meta

  // 在路由可以跳转的时候，此时要加载对应的组件，找到其中的 asyncData 钩子函数，以便执行异步操作
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents()
    
    // 如果没有匹配的组件，证明访问的路径是不存在的，所有要返回 404
    if (!matchedComponents.length) return reject({ code: 404 })

    // 在处理完所有异步请求之后，才进行服务端字符串的拼接和模版渲染
    Promise.all(
      matchedComponents.map(({asyncData}) => asyncData && asyncData({
        store,
        route: router.currentRoute
      }))
    )
    .then(() => {
      ctx.state = store.state
      resolve(app)
    })
    .catch(reject)

  }, reject)
})