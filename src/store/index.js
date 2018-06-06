import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

Vue.use(Vuex)

const createStore = new Vuex.Store({
  state: {
    userMsg: {
      Role: null,
      UnionId: null,
      SessionKey: null,
      UserOpenId: null,
      Token: null
    },
    shareControl: true
  },
  getters,
  actions,
  mutations
})

export default createStore
