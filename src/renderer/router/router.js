import Vue from 'vue'
import Router from 'vue-router'
import '../assets/css/reset.css'
import api from '../assets/config/api';
Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [{
      path: '/Navigation',
      name: 'navigation',
      component: require('../WindowNavigation.vue').default
    },
    {
      path: '/Home',
      name: 'Home',
      component: require('../pages/Home').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/CreateAccount',
      name: 'CreateAccount',
      component: require('@/components/CreateAccount').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/ImportAccount',
      name: 'ImportAccount',
      component: require('@/components/ImportAccount').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/FileManager',
      name: 'FileManager',
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
        },
        {
          path: '',
          redirect: {
            name: 'disk',
            query:{
              type:0
            }
          }
        }
      ]
    },
    {
      path: '/Miner',
      name: 'Miner',
      component: require('../pages/Miner.vue').default,
      meta: {
        keepAlive: true
      },
      children: [{
        path: 'minerdisk',
        name: 'minerdisk',
        component: require('../pages/FileManager/FileBox/Disk.vue').default
      }, {
        path: 'income',
        name: 'income',
        component: require('../pages/Miner/Income.vue').default
      }, {
        path: '',
        redirect: {
          name: 'minerdisk',
          query: {
            controlBar: 'close',
            type: 0,
            page: 'miner',
            addrAPI: api.getDownloadFileList
          }
        }
      }]
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: require('../pages/Wallet.vue').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/dialog',
      name: 'Dialog',
      component: require('../pages/Dialog.vue').default,
      meta: {
        keepAlive: true
      },
      children: [
        {
          path: 'exportPrivateKey',
          name: 'ExportPrivateKey',
          component: require('../pages/Dialog/ExportPrivateKey.vue').default
        },
        {
          path: 'logout',
          name: 'Logout',
          component: require('../pages/Dialog/Logout.vue').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/Home',
      meta: {
        keepAlive: false
      }
    }
  ]
})