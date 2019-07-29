import axios from 'axios';
import api from '../../assets/config/api'
import router from '../../router/router';
const state = {
  balanceTotal: 0,
  balanceAddress: '',
  channels: [],
  channelBind: {},
  revenue: 0,
  revenueFormat: 0,
  loginStatus: -1,
  initChannelProgress: 0
}
// Confirm login status


const mutations = {
  'SET_BALANCE_TOTAL'(state, result) {
    state.balanceTotal = result.BalanceFormat;
    if (result.Channels && (result.Channels.length > 0)) {
      state.balanceAddress = result.Channels[0].Address;
    }
    state.channels = result.Channels;
    this.dispatch('setChannelBind', localStorage.getItem('channelBindId') || '')
  },
  'SET_CHANNEL_BIND'(state, Id) {
    state.channelBind = {};
    state.channels = state.channels || [];
    let result = state.channels.some(channel => {
      if (channel.ChannelId.toString() === Id) {
        state.channelBind = channel;
        return true;
      } else {
        return false;
      }
    })
    if (!result) {
      state.channelBind = state.channels[0] || {};
    }
  },
  'SET_CHANNEL_PROGRESS'(state, progress) {
    state.initChannelProgress = progress;
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
  }
}
const timer = {
  COUNT_INTERVAL: 5000,
  channelBalanceTotalTimer: null,
  revenueTimer: null,
  channelInitProgress: null
};
const actions = {
  setChannelBalanceTotal({
    commit
  }) {
    requestChannelBalanceTotal(commit);
    clearInterval(timer.channelBalanceTotalTimer);
    timer.channelBalanceTotalTimer = setInterval(() => {
      requestChannelBalanceTotal(commit);
    }, timer.COUNT_INTERVAL);
  },
  setRevenue({
    commit
  }) {
    requestRevenue(commit);
    clearInterval(timer.revenueTimer);
    timer.revenueTimer = setInterval(() => {
      requestRevenue(commit);
    }, timer.COUNT_INTERVAL);
  },
  setCurrentAccount({
    commit
  }) {
    axios
      .get(api.account)
      .then(async (res) => {
        if (res.Error === 0) {
          // const data = res.data;
          // if (data.Error === 0) { // response data
          if (res.Result.Address) { // Wallet(Account) exist
            try {
              const progress = await axios.get(api.channelInitProgress)
              if (progress.Error === 0) {
                if (progress.Error === 0 && (progress.Result.Progress < 1)) { // but no Channel
                  rebackToCreateAccount(commit, progress.Result.Progress); // back to create account
                  this.dispatch('getChannelInitProgress'); // Loop loading progress
                } else if (progress.Error === 0) { // both Wallet and Channel exist
                  const result = res.Result;
                  for (let key in result) {
                    window.localStorage.setItem(key, result[key]);
                  }
                  commit('SET_CURRENT_ACCOUNT', 1) // login success
                  this.dispatch("setBalanceLists"); // getBalance
                  this.dispatch("setChannelBalanceTotal"); // getAllChannels
                  this.dispatch("setRevenue");
                }
							} else {
                commit('SET_CURRENT_ACCOUNT', 0) // login fail
							}
            } catch (error) {
              console.error(error)
            }
          } else {
            commit('SET_CURRENT_ACCOUNT', 0) // login fail
            window.localStorage.clear(); // remove all local infomation
          }
        } else {
          // this.$message.error(this.$i18n.error[res.Error][this.$language]);
          if (location.href.indexOf('Home') < 0) {
            router.replace({
              name: 'Home'
            })
          }
          commit('SET_CURRENT_ACCOUNT', 0) // login fail Or no user
        }
      })
      .catch(err => { // network wrong
        console.error(err);
      });
  },
  getChannelInitProgress({
    commit
  }) {
    clearInterval(timer.channelInitProgress);
    timer.channelInitProgress = setInterval(() => {
      axios.get(api.channelInitProgress).then(res => {
        if (res.Error === 0) {
          if (res.Result.Progress >= 1) {
            commit('SET_CHANNEL_PROGRESS', 1)
            clearInterval(timer.channelInitProgress);
            window.location.href = location.origin + location.pathname; // success login link to home page
          }
          commit('SET_CHANNEL_PROGRESS', res.Result.Progress)
          commit('SET_CURRENT_HEIGHT', res.Result.Now)
          commit('SET_TOTAL_HEIGHT', res.Result.End)
        }  
      });
    }, timer.COUNT_INTERVAL);
  },
  setChannelBind({
    commit
  }, Id) {
    commit('SET_CHANNEL_BIND', Id)
  }
}

function rebackToCreateAccount(commit, progress) {
  commit('SET_CURRENT_ACCOUNT', 0) // login fail
  commit('SET_CHANNEL_PROGRESS', progress)
  router.replace({
    name: 'CreateAccount'
  })
}

function requestChannelBalanceTotal(commit) {
  axios
    .get(api.channel)
    .then(res => {
      if (res.Error === 0) {
        commit('SET_BALANCE_TOTAL', res.Result)
      }
    })
    .catch(err => {
      console.error(err);
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