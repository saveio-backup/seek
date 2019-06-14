import axios from 'axios';
import api from '../../assets/config/api'
import router from '../../router/router';
const state = {
  balanceTotal: 0,
  balanceAddress: '',
  channels: [],
  channelBind: {},
  revenue: 0,
  loginStatus: -1,
  initChannelProgress: 0
}
// Confirm login status


const mutations = {
  'SET_BALANCE_TOTAL'(state, result) {
    state.balanceTotal = result.BalanceFormat;
    if (result.Channels.length > 0) {
      state.balanceAddress = result.Channels[0].Address;
    }
    state.channels = result.Channels;
    this.dispatch('setChannelBind', localStorage.getItem('channelBindId') || '')
  },
  'SET_CHANNEL_BIND'(state, Id) {
    state.channelBind = {};
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
  'SET_REVENUE'(state, result) {
    state.revenue = result;
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
        const data = res.data;
        if (data.Error === 0) { // response data
          if (data.Desc === "SUCCESS" && data.Result.Address) { // Wallet(Account) exist
            try {
              const progress = await axios.get(api.channelInitProgress)
              if (progress.data.Error === 0 && (progress.data.Result.Progress < 1)) { // but no Channel
                rebackToCreateAccount(commit, progress.data.Result.Progress); // back to create account
                this.dispatch('getChannelInitProgress'); // Loop loading progress
              } else if (progress.data.Error === 0) { // both Wallet and Channel exist
                const result = data.Result;
                for (let key in result) {
                  window.localStorage.setItem(key, result[key]);
                }
                commit('SET_CURRENT_ACCOUNT', 1) // login success
                this.dispatch("setBalanceLists"); // getBalance
                this.dispatch("setChannelBalanceTotal"); // getAllChannels
                this.dispatch("setRevenue");
              }

            } catch (error) {
              console.error(error)
              commit('SET_CURRENT_ACCOUNT', 0) // login fail
            }
          } else {
            commit('SET_CURRENT_ACCOUNT', 0) // login fail
            window.localStorage.clear(); // remove all local infomation
          }
        } else { // if user not login and not in Homepage
          if (location.href.indexOf('Home') < 0) {
            router.replace({
              name: 'Home'
            })
          }
          commit('SET_CURRENT_ACCOUNT', 0) // login fail Or no user
        }
      })
      .catch(err => { // network wrong
        commit('SET_CURRENT_ACCOUNT', 0) // login fail
        console.error(err);
      });
  },
  getChannelInitProgress({
    commit
  }) {
    clearInterval(timer.channelInitProgress);
    timer.channelInitProgress = setInterval(() => {
      axios.get(api.channelInitProgress).then(res => {
        if (res.data.Error === 0) {
          if (res.data.Result.Progress >= 1) {
            commit('SET_CHANNEL_PROGRESS', 1)
            clearInterval(timer.channelInitProgress);
            window.location.href = location.origin + location.pathname; // success login link to home page
          }
          commit('SET_CHANNEL_PROGRESS', res.data.Result.Progress)
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
    .get(api.host + api.version + "channel")
    .then(res => {
      if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
        commit('SET_BALANCE_TOTAL', res.data.Result)
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function requestRevenue(commit) {
  axios.get(api.revenue).then(res => {
    if (res.data.Error === 0) {
      commit('SET_REVENUE', res.data.Result.Revenue);
    }
  })
}
export default {
  state,
  mutations,
  actions
}