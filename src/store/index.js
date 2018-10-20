import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const createStore = () => new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {}
})

export { createStore }
export default createStore
