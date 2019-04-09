import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router/router.js'
import store from './store/store.js'
import API from './assets/config/api';
import './assets/css/style.scss'

import {
  Select,
  Option,
  Form,
  Input,
  FormItem,
  Button,
  Table,
  TableColumn
} from 'element-ui';
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Button)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Form)
Vue.use(Option)
Vue.use(Select)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.prototype.$axios = axios
Vue.prototype.$api = API;
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')