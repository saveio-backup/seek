import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router/router.js'
import store from './store/store.js'
import API from './assets/config/api'
import './assets/css/style.scss'
import dateFormat from './assets/tool/date'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
Vue.use(ElementUI, { locale })
// import {
//   Select,
//   Option,
//   Form,
//   Input,
//   FormItem,
//   Button,
//   Table,
//   TableColumn,
//   Progress,
//   Dialog,
//   InputNumber,
//   DatePicker,
// } from 'element-ui';
// Vue.use(DatePicker)
// Vue.use(InputNumber)
// Vue.use(Dialog)
// Vue.use(Progress)
// Vue.use(Table)
// Vue.use(TableColumn)
// Vue.use(Button)
// Vue.use(FormItem)
// Vue.use(Input)
// Vue.use(Form)
// Vue.use(Option)
// Vue.use(Select)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.prototype.$dateFormat = dateFormat;
Vue.prototype.$axios = axios
Vue.prototype.$api = API;
Vue.config.productionTip = false
Vue.directive('clickoutside', {
  bind: function (el, binding) {
    function documentHandler(e) {
      // console.log(el);
      // console.log(e.target);
      if (el.contains(e.target)) {
        return false
      };
      if (binding.expression) {
        binding.value(e);
      }
    }
    document.addEventListener('click', documentHandler);
  }

});
/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')