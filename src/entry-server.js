import createApp from './app.js'

export default ctx => new Promise((resolve, reject) => {
  const { app, router, store } = createApp()
  const { url } = ctx
  const { fullPath } = router.resolve(url).route

  if (fullPath !== url) return reject({ code: 302, url: fullPath })

  ctx.meta = app.$meta()

  router.push(url)

  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents()

    if (!matchedComponents.length) return reject({ code: 404 })

    Promise.all(
      matchedComponents.map(
        ({ asyncData }) => asyncData && asyncData({
          route: router.currentRoute,
          store
        })
      )
    ).then(() => {
      ctx.state = store.state
      resolve(app)
    }).catch(reject)
  }, reject)
})
