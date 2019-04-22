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
    state.balanceTotal = result.Balance;
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
  }, result) {
    // do something async
    commit('SET_BALANCE_TOTAL', result)
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