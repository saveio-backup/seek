import axios from 'axios';
import api from '../../assets/config/api';
const state = {
  balanceLists: [],
  txRecords: [],
  transferIn: [],
  transferOut: []
}

const mutations = {
  SET_BALANCE_LISTS(state, result) {
    state.balanceLists = result;
  },
  SET_TX_RECORDS(state, result) {
    state.txRecords = result;
  },
  SET_TRANSFER_IN(state, result) {
    state.transferIn = result;
  },
  SET_TRANSFER_OUT(state, result) {
    state.transferOut = result;
  }
}

const actions = {
  setTxRecords({
    commit
  }, config) {
    let {
      asset = '',
        limit = '100',
        height = ''
    } = config || {};
    axios.get(api.transactions + window.localStorage.Address + '/0?asset=' + asset + '&limit=' + limit + '&height=' + height).then(res => {
      if (res.data.Error === 0) {
        const transferIn = [];
        const transferOut = [];
        const result = res.data.Result;
        for (let i = 0; i < result.length; i++) {
          if (result[i].Type === 1) {
            transferOut.push(result[i]);
          } else if (result[i].Type === 2) {
            transferIn.push(result[i]);
          }
        }
        commit('SET_TX_RECORDS', result);
        commit('SET_TRANSFER_IN', transferIn);
        commit('SET_TRANSFER_OUT', transferOut);
      }
    })
  },
  setBalanceLists({
    commit
  }) {
    axios
      .get(
        api.balance + "/" + window.localStorage.getItem("Address") || ""
      )
      .then(res => {
        if (res.data.Desc === "SUCCESS") {
          const result = res.data.Result;
          commit('SET_BALANCE_LISTS', result);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }
}

export default {
  state,
  mutations,
  actions
}