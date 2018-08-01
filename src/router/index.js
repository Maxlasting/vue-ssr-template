import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes.js'

Vue.use(VueRouter)

export const createRouter = () => new VueRouter({
  // 服务端渲染必须使用 history 模式
  mode: 'history',
  // 取消向后兼容
  fallback: false,
  // 在调转每个路由的时候，将滚动条初始化
  scrollBehavior: () => {{ y: 0 }},
  routes
})