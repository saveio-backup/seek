import Vue from 'vue'
import App from './App'

import router from './router/router.js'
import store from './store/store.js'
import axios from './assets/config/http'
import config from './assets/config/default'
import API from './assets/config/api'
import commonMethods from './assets/config/commonMethods'
import dateFormat from './assets/tool/date'
import './assets/config/element'
import * as globalComponentRegister from './assets/config/globalComponentRegister/index'
import {i18n} from './assets/config/i18n/index'
import './assets/css/style.scss'
import './assets/css/bootstrap-grid.css'
import './assets/tool/directive';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.use(commonMethods);

Vue.prototype.$dateFormat = dateFormat;
Vue.prototype.$axios = axios;
Vue.prototype.$api = API;
Vue.prototype.$config = config;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: {
    App,
    ...globalComponentRegister
  },
  i18n,
  router,
  store,
  template: '<App/>'
}).$mount('#app')
