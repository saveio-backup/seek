import axios from 'axios';
import api from '../../assets/config/api'
import {
  ipcRenderer
} from 'electron';
const remote = require('@electron/remote')
const state = {
  balanceTotal: 0,
  balanceAddress: '',
  themeColor: ipcRenderer.sendSync('getSettings', 'themeColor'),
  channels: [],
  channelBind: {},
  revenue: 0,
  revenueFormat: 0,
  loginStatus: -1,
  // initChannelProgress: 0,
  dns: [],

  totalHeight: 0,
  currentHeight: 0,
  isSync: false,
  isNeedSync: false,
  account: null,
  state: {
    ChainState: {},
    DNSState: {},
    DspProxyState: {},
    ChannelProxyState: {}
  },
  moduleState: null,
}
// Confirm login status


const mutations = {
  'SET_MODULE_STATE'(state, result) {
    state.moduleState = result;
  },
  'SET_STAET'(state, result) {
    state.state = result;
  },
  'SET_IS_SYNC'(state, result) {
    state.isSync = result;
  },
  'SET_IS_NEED_SYNC'(state, result) {
    state.isNeedSync = result;
  },
  'SET_ACCOUNT'(state, result) {
    state.account = result;
  },
  'SET_BALANCE_TOTAL'(state, result) {
    state.channels = result.Channels;
    this.dispatch('setChannelBind', localStorage.getItem('channelBindId') || '')
  },
  'SET_CHANNEL_BIND'(state, Id) {
    state.channelBind = {};
    state.channels = state.channels || [];
    let result = state.channels.some(channel => {
      if (channel.ChannelId == Id) {
        state.channelBind = Object.assign({}, channel);
        localStorage.setItem('channelBindId', Id);
        return true;
      } else {
        return false;
      }
    })
    if (!result) {
      // state.channelBind = state.channels[0] || {};
      for (let value of state.channels) {
        if (state.dns.indexOf(value.HostAddr) >= 0) {
          localStorage.setItem('channelBindId', value.ChannelId);
          state.channelBind = Object.assign({}, value);
          return;
        }
      }
    }
  },
  'SET_CURRENT_HEIGHT'(state, progress) {
    state.currentHeight = progress;
  },
  'SET_TOTAL_HEIGHT'(state, progress) {
    state.totalHeight = progress;
  },
  'SET_REVENUE'(state, result) {
    state.revenue = result.Revenue;
    state.revenueFormat = result.RevenueFormat
  },
  'SET_CURRENT_ACCOUNT'(state, result) {
    state.loginStatus = result;
  },
  'SET_DNS'(state, result) {
    state.dns = result;
  },
  'SET_THEME_COLOR'(state, result) {
    state.themeColor = result;
  }
}
const timer = {
  COUNT_INTERVAL: 5000,
  channelBalanceTotalTimer: null,
  revenueTimer: null,
  channelInitProgress: null,
  dns: null
};
const actions = {
  setChannelBalanceTotal({
    commit
  }) {
    requestChannelBalanceTotal(commit);
  },
  setRevenue({
    commit
  }) {
    requestRevenue(commit);
  },
  setCurrentAccount({
    commit
  }) {
    const router = require('../../router/router');
    axios
      .get(api.account)
      .then((res) => {
        if (res.Error === 0) {
          if (res.Result.Address) { // Wallet(Account) exist
            const result = res.Result;
            ipcRenderer.send("run-dialog-event", {
              name: "setLoginStatus",
              data: true
            });
            ipcRenderer.sendSync("updateSettings", 'currentAddress', res.Result.Address);
            ipcRenderer.sendSync('initUsermetaDB', res.Result.Address); // set Usermeta db
            remote.getCurrentWindow() &&
              ipcRenderer.sendTo(
                remote.getCurrentWindow().webContents.id,
                "updatePlugin"
              );
            for (let key in result) {
              window.localStorage.setItem(key, result[key]);
            }
            commit('SET_CURRENT_ACCOUNT', 1) // login success
            this.dispatch("setBalanceLists"); // getBalance
            this.dispatch("setChannelBalanceTotal"); // getAllChannels
            this.dispatch("setRevenue");
            this.dispatch("setCurrentChannel");
            try {
              axios.get(api.channelInitProgress).then(progress => {
                if (progress.Error === 0) {
                  if (progress.Result.End - progress.Result.Now > 100000) { // but no Channel
                    if (location.href.indexOf('CreateAccount') < 0) {
                      router.default.replace({
                        name: 'CreateAccount'
                      })
                      commit('SET_CURRENT_HEIGHT', progress.Result.Now);
                      commit('SET_TOTAL_HEIGHT', progress.Result.End);
                      ipcRenderer.send("run-dialog-event", {
                        name: "setLoginStatus",
                        data: true
                      });
                    }
                  }
                }
              })
            } catch (e) {
              console.log(e);
            }
          } else {
            ipcRenderer.send("run-dialog-event", {
              name: "setLoginStatus",
              data: false
            });
            commit('SET_CURRENT_ACCOUNT', 0) // login fail
            const notClear = [
              'waitForUploadOrderList',
              'uploadTask',
              'localStatus',
              'showSmallContract',
              'downloadDoneList',
              'uploadDoneList',
            ]
            outer: for (let value of window.localStorage) {
              if (!window.localStorage.propertyIsEnumerable(value)) continue;
              for (let notClearItem of notClear) {
                if (value.startsWith(notClearItem)) {
                  continue outer;
                }
              }
              window.localStorage.removeItem(value);
            }
          }
        } else if (res.Error === 50012) {
          if (location.href.indexOf('login') < 0) {
            router.default.replace({
              name: 'login'
            });
          }
        } else {
          ipcRenderer.send("run-dialog-event", {
            name: "setLoginStatus",
            data: false
          });
          if (location.href.indexOf('Home') < 0) {
            router.default.replace({
              name: 'Home'
            })
          }
          commit('SET_CURRENT_ACCOUNT', 0) // login fail Or no user
        }
      })
      .catch(err => { // network wrong
        console.error(err);
        if (location.href.indexOf('Home') < 0) {
          router.default.replace({
            name: 'Home'
          })
        }
        commit('SET_CURRENT_ACCOUNT', 0) // login fail Or no user
      });
  },
  setChannelBind({
    commit
  }, Id) {
    commit('SET_CHANNEL_BIND', Id)
  },
  getDns({
    commit
  }) {
    getAllDns(commit);
    clearInterval(timer.dns);
    timer.dns = setInterval(() => {
      getAllDns(commit);
    }, timer.COUNT_INTERVAL)
  },
  clearIntervalGetDns({
    commit
  }) {
    clearInterval(timer.dns);
  },
  setCurrentChannel({
    commit
  }) {
    axios.get(api.getCurrentChannel).then(res => {
      if (res.Error === 0) {
        this.dispatch('setChannelBind', res.Result.ChannelId);
      }
    });
  }
}

function getAllDns(commit) {
  axios.get(api.getAllDns).then(res => {
    if (res.Error === 0) {
      let arr = [];
      for (let value of res.Result) {
        arr.push(value.HostAddr);
      }
      commit('SET_DNS', arr);
    }
  });
}

function requestChannelBalanceTotal(commit) {
  axios
    .get(api.channel, {
      timeout: 20000
    })
    .then(res => {
      if (res.Error === 0) {
        commit('SET_BALANCE_TOTAL', res.Result)
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function requestRevenue(commit) {
  axios.get(api.revenue).then(res => {
    if (res.Error === 0) {
      commit('SET_REVENUE', res.Result);
    }
  })
}
export default {
  state,
  mutations,
  actions
}