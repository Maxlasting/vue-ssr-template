export default [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "index" */ '../views/index.vue')
  }
]