const home = () => import(/* webpackChunkName: "home" */ '../views/home/home.vue')

export default [
  {
    path: '/home',
    component: home
  },
  {
    path: '/',
    redirect: '/home'
  }
]
