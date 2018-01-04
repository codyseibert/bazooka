// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'vuetify/dist/vuetify.min.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
// import 'codemirror/theme/base16-dark.css'

import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import { sync } from 'vuex-router-sync'
import VueHighlightJS from 'vue-highlightjs'
import VueCodemirror from 'vue-codemirror'
import store from '@/store'
import Panel from '@/components/Panel'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(VueHighlightJS)
Vue.use(VueCodemirror)

sync(store, router)

Vue.component('panel', Panel)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
