import axios from 'axios';
import api from '../../assets/config/api'
const state = {
  balanceTotal: 0,
  balanceAddress: '',
  channels: [],
  revenue: 0,
}

const mutations = {
  'SET_BALANCE_TOTAL'(state, result) {
    state.balanceTotal = result.BalanceFormat;
    state.balanceAddress = result.Channels[0].Address;
    state.channels = result.Channels;
  },
  'SET_REVENUE'(state, result) {
    state.revenue = result;
  }
}

const actions = {
  setChannelBalanceTotal({
    commit
  }) {
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
  },
  setRevenue({
    commit
  }) {
    axios.get(api.revenue).then(res => {
      console.log(res);
      if (res.data.Error === 0) {
        commit('SET_REVENUE', res.data.Result.Revenue);
      }
    })
  }
}

export default {
  state,
  mutations,
  actions
}