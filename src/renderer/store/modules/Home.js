import axios from 'axios';
import api from '../../assets/config/api'
const state = {
  balanceTotal: 0,
  balanceAddress: '',
  channels: [],
  revenue: 0,
  loginStatus: -1
}
// Confirm login status


const mutations = {
  'SET_BALANCE_TOTAL'(state, result) {
    state.balanceTotal = result.BalanceFormat;
    state.balanceAddress = result.Channels[0].Address;
    state.channels = result.Channels;
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
  revenueTimer: null
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
      .then(res => {
        const data = res.data;
        if (data.Error === 0) {
          if (data.Desc === "SUCCESS" && data.Result.Address) {
            const result = data.Result;
            for (let key in result) {
              window.localStorage.setItem(key, result[key]);
            }
            commit('SET_CURRENT_ACCOUNT', 1) // login success
            this.dispatch("setBalanceLists"); // getBalance
            this.dispatch("setChannelBalanceTotal"); // getAllChannels
            this.dispatch("setRevenue");
          } else {
            commit('SET_CURRENT_ACCOUNT', 0) // login fail
            window.localStorage.clear(); // remove all local infomation
          }
        }
      })
      .catch(err => {
        commit('SET_CURRENT_ACCOUNT', 0) // login fail
        console.error(err);
      });
  }
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