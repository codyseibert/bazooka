import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import projects from './projects'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  plugins: [
    createPersistedState({
      key: 'vuetodo'
    })
  ],
  modules: {
    projects
  }
})
