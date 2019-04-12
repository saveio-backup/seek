import Vue from 'vue'
import Router from 'vue-router'
import '../assets/css/reset.css'
Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [{
      path: '/',
      name: 'home-page',
      component: require('../pages/Home').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/CreateAccount',
      name: 'create-account-page',
      component: require('@/components/CreateAccount').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/ImportAccount',
      name: 'import-account-page',
      component: require('@/components/ImportAccount').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/FileManager',
      component: require('../pages/FileManager.vue').default,
      meta: {
        keepAlive: false
      },
      children: [{
          path: 'filebox',
          name: 'filebox',
          component: require('../pages/FileManager/FileBox.vue').default,
          children: [{
              path: 'disk',
              name: 'disk',
              component: require('../pages/FileManager/FileBox/Disk.vue').default
            }, {
              path: 'domain',
              name: 'domain',
              component: require('../pages/FileManager/FileBox/Domain.vue').default
            }, {
              path: 'expand',
              name: 'expand',
              component: require('../pages/FileManager/FileBox/Expand.vue').default
            },
            {
              path: 'upload',
              name: 'upload',
              component: require('../pages/FileManager/FileBox/Upload.vue').default
            }, {
              path: '/*',
              redirect: {
                name: 'disk',
                query: {
                  type: 0
                }
              }
            }
          ]
        },
        {
          path: 'transfer',
          name: 'transfer',
          component: require('../pages/FileManager/Transfer.vue').default
        },
        {
          path: 'discovery',
          name: 'discovery',
          component: require('../pages/FileManager/Discovery.vue').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/',
      meta: {
        keepAlive: false
      }
    }
  ]
})