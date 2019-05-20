import axios from 'axios';
import api from '../../assets/config/api';
const state = {
  mainCount: 0,
  balanceLists: [],
  txRecords: [],
  transferIn: [],
  transferOut: []
}

const mutations = {
  SET_BALANCE_LISTS(state, result) {
    state.balanceLists = result;
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (item.Symbol === 'SAVE') {
        state.mainCount = item.BalanceFormat;
        break;
      }

    }
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
const timer = {
  COUNT_INTERVAL: 5000,
  txRecordsTimer: null,
  balanceListsTimer: null
}
const actions = {
  setTxRecords({
    commit
  }, config) {
    clearInterval(timer.txRecordsTimer);
    requestTransActions(commit, config);
  },
  setBalanceLists({
    commit
  }) {
    requestBalanceLists(commit);
    clearInterval(timer.balanceListsTimer);
    timer.balanceListsTimer = setInterval(() => {
      requestBalanceLists(commit)
    }, timer.COUNT_INTERVAL);
  }
}

function requestBalanceLists(commit) {
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

function requestTransActions(commit, config) {
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
  }).finally(() => {
    // setTimeout(() => {
    //   requestTransActions(commit, config);
    // }, timer.COUNT_INTERVAL);
  })
}
export default {
  state,
  mutations,
  actions
}