import Vue from 'vue'
import Router from 'vue-router'
import '../assets/css/reset.css'
Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [{
      path: '/',
      name: 'home-page',
      component: require('../pages/Home').default
    },
    {
      path: '/CreateAccount',
      name: 'create-account-page',
      component: require('@/components/CreateAccount').default
    },
    {
      path: '/ImportAccount',
      name: 'import-account-page',
      component: require('@/components/ImportAccount').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})