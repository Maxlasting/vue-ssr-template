import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes.js'

Vue.use(VueRouter)

const createRouter = () => new VueRouter({
  mode: 'history',
  fallback: false,
  routes
})

export { createRouter }
export default createRouter
