import Vue from 'vue'
import { createApp } from './app.js'

// 全局混入一个路由钩子，在路由更新之前触发
Vue.mixin({
  beforeRouterUpdate (to, from, next) {
    const { asyncData } = this.$options

    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      }).then(next).catch(next)
    } else {
      next()
    }
  }
})

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

/**
 * 下面这段代码来自 vue 官方 ssr 示例，具体的一些含义还不是很透彻
 * 感觉有部分是没有必要的，所以可以根据实际需求来修改
 */
router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    // 获取当前匹配的所有组件
    const matched = router.getMatchedComponents(to)
    // 获取已经匹配的所有组件
    const prevMatched = router.getMatchedComponents(from)
  
    let diff = false
  
    // 过滤出第一个不同的组件以及之后的所有组件
    const activated = matched.filter((c, i) => diff || (diff = prevMatched[i] !== c))
  
    // 找到这些组件中的 asyncData 钩子函数
    const asyncDataHooks = activated.map((c) => c.asyncData).filter(_ => _)
  
    // asyncData 设计时 返回的 是一个 Promise 对象
    const promise = Promise.all(
      asyncDataHooks.map(hook => hook({ store, route: to }))
    )
  
    promise.then(next).catch(next)
  })

  app.$mount('#root')
})