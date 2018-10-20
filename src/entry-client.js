import Vue from 'vue'
import createApp from 'create-app'

Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({ store: this.$store, route: to })
        .then(next).catch(next)
    } else {
      next()
    }
  }
})

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    const currentMatchedComponents = router.getMatchedComponents(to)
    const previousMatchedComponents = router.getMatchedComponents(from)

    let diff = false

    const activated = currentMatchedComponents.filter(
      (c, i) => diff || (diff = c !== previousMatchedComponents[i])
    )

    if (!activated.length) return next()

    const asyncHooks = activated.map(c => c.asyncData).filter(_ => _)

    const promise = Promise.all(
      asyncHooks.map(hook => hook({ route: to, store }))
    )

    promise.then(() => {
      // ...
      next()
    })
    .catch(next)
  })

  app.$mount('#app')
})
