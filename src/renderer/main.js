import Vue from 'vue'
import App from './App'
import router from './router/router.js'
import store from './store/store.js'
import axios from './assets/config/http'
import config from './assets/config/default'
import i18n from './assets/config/i18n/index';
import API from './assets/config/api'
import commonMethods from './assets/config/commonMethods'
import './assets/css/style.scss'
import dateFormat from './assets/tool/date'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import RipperButton from './components/RipperButton.vue'
import '../../static/css/buttonRipple/js/TweenMax.min'

const LANGUAGE = 'en'; //language
// const OUTTIME = 1;//out block time
Vue.use(ElementUI, {
  locale
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.use(commonMethods);

Vue.use(RipperButton);
Vue.component('ripper-button', RipperButton); // init component

Vue.prototype.$dateFormat = dateFormat;
Vue.prototype.$axios = axios;
Vue.prototype.$i18n = i18n;
Vue.prototype.$api = API;
Vue.prototype.$language = LANGUAGE;
Vue.prototype.$config = config;
Vue.config.productionTip = false;
Vue.directive('seekclickoutside', {
  bind: function (el, binding, vnode) {
    el.documentHandler = (e) => {
      e.stopPropagation();
      const {
        handler,
        exclude
      } = binding.value;
      let clickedOnExcludedEl = false
      exclude && exclude.forEach(refName => {
        if (!clickedOnExcludedEl) {
          const excludedEl = vnode.context.$refs[refName]
          clickedOnExcludedEl = excludedEl.contains(e.target)
        }
      })
      if (!el.contains(e.target) && !clickedOnExcludedEl && handler) {
        vnode.context[handler]()
      }
    }
    document.body.addEventListener('click', el.documentHandler);
  },
  unbind(el) {
    console.log('unbind');
    document.body.removeEventListener('click', el.documentHandler);
  }
});
/* eslint-disable no-new */
new Vue({
  components: {
    App,
    RipperButton
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')