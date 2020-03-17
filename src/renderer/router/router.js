import Vue from 'vue'
import Router from 'vue-router'
import '../assets/css/reset.scss'
import api from '../assets/config/api';
Vue.use(Router)

function loadComponent(path) {
  return () => import( /* webpackChunkName: "view-[request]" */ `@/${path}`)
}

export default new Router({
  mode: 'hash',
  routes: [{
      path: '/Navigation',
      name: 'Navigation',
      component: loadComponent('WindowNavigation.vue')
    },
    {
      path: '/Markdown',
      name: 'Markdown',
      component: loadComponent('pages/Markdown.vue')
    },
    {
      path: '/Home',
      name: 'Home',
      component: loadComponent('pages/Home.vue'),
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/CreateAccount',
      name: 'CreateAccount',
      component: loadComponent('components/CreateAccount.vue'),
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/ImportAccount',
      name: 'ImportAccount',
      component: loadComponent('components/ImportAccount.vue'),
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/FileManager',
      component: loadComponent('pages/FileManager.vue'),
      meta: {
        keepAlive: false
      },
      children: [{
          path: 'filebox',
          name: 'filebox',
          component: loadComponent('pages/FileManager/FileBox.vue'),
          children: [{
              path: 'disk',
              name: 'disk',
              component: loadComponent('pages/FileManager/FileBox/Disk.vue')
            }, {
              path: 'domain',
              name: 'domain',
              component: loadComponent('pages/FileManager/FileBox/Domain.vue')
            }, {
              path: 'expand',
              name: 'expand',
              component: loadComponent('pages/FileManager/FileBox/Expand.vue')
            },
            {
              path: 'upload',
              name: 'upload',
              component: loadComponent('pages/FileManager/FileBox/Upload.vue')
            }
          ]
        },
        {
          path: 'transfer',
          name: 'transfer',
          component: loadComponent('pages/FileManager/Transfer.vue'),
          meta: {
            keepAlive: false
          },
        },
        {
          path: 'discovery',
          name: 'discovery',
          component: loadComponent('pages/FileManager/Discovery.vue')
        },
        {
          path: '',
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
      path: '/Miner',
      component: loadComponent('pages/Miner.vue'),
      meta: {
        keepAlive: true
      },
      children: [{
        path: 'minerdisk',
        name: 'minerdisk',
        component: loadComponent('pages/FileManager/FileBox/Disk.vue')
      }, {
        path: 'income',
        name: 'income',
        component: loadComponent('pages/Miner/Income.vue')
      }, {
        path: '',
        redirect: {
          name: 'minerdisk',
          query: {
            controlBar: 'close',
            type: 0,
            page: 'miner'
          }
        }
      }]
    },
    {
      path: '/wallet',
      name: 'Wallet',
      component: loadComponent('pages/Wallet.vue'),
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/dialog',
      name: 'Dialog',
      component: loadComponent('pages/Dialog.vue'),
      meta: {
        keepAlive: true
      },
      children: [{
          path: 'exportPrivateKey',
          name: 'exportPrivateKey',
          component: loadComponent('pages/Dialog/ExportPrivateKey.vue')
        },
        {
          path: 'logout',
          name: 'logout',
          component: loadComponent('pages/Dialog/Logout.vue')
        }
      ]
    },
    {
      path: '/menuwindow',
      name: 'menuWindow',
      component: loadComponent('pages/menuWindow.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: loadComponent('pages/Settings.vue')
    },
    {
      path: '/orderpay',
      name: 'orderpay',
      component: loadComponent('pages/OrderPay/OrderPay.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: loadComponent('pages/History/History.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: loadComponent('pages/Login/Login.vue')
    },
    {
      path: '/loginLog',
      name: 'LoginLog',
      component: loadComponent('pages/LoginLog.vue')
    },
    {
      path: '/plugin',
      name: 'plugin',
      component: loadComponent('pages/PluginInfo.vue')
    },
    {
      path: '/',
      redirect: '/Home',
      meta: {
        keepAlive: false
      }
    },
    {
      path: '*',
      name: 'Page404',
      component: loadComponent('pages/goPage404.vue')
    }
  ]
})