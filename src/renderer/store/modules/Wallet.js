import axios from 'axios';
import api from '../../assets/config/api';
const CancelToken = axios.CancelToken;
let txTransSourceCancel;
const state = {
  mainCount: 0,
  balanceLists: [],
  txRecords: [],
  transferIn: [],
  transferOut: [],
  BlockHeight: '',
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
  },
  SET_BLOCK_HEIGHT(state, height) {
    state.BlockHeight = height;
  }
}
const timer = {
  COUNT_INTERVAL: 5000,
  txRecordsTimer: null,
  balanceListsTimer: null,
  heart: null
}
const actions = {
  setTxRecords({
    commit
  }, config) {
    clearInterval(timer.txRecordsTimer);
    requestTransActions.bind(this, commit, config)();
  },
  setBalanceLists({
    commit
  }) {
    requestBalanceLists(commit);
    // clearInterval(timer.balanceListsTimer);
    // timer.balanceListsTimer = setInterval(() => {
    // requestBalanceLists(commit)
    // }, timer.COUNT_INTERVAL);
  },
  cancelTxRequest() {
    clearTimeout(timer.heart);
    txTransSourceCancel('request cancel!');
  }
}

function requestBalanceLists(commit) {
  axios
    .get(
      api.balance + "/" + window.localStorage.getItem("Address") || "", {
        message: {
          once: 'onceIdWalletBalance'
        }
      }
    )
    .then(res => {
      if (res.Error === 0) {
        const result = res.Result;
        commit('SET_BALANCE_LISTS', result);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function requestTransActions(commit, config) {
  let skipTxCountFromBlock = 0;
  let {
    switchToggle = {},
      asset = '',
      limit = state.txRecords.length >= 30 ? state.txRecords.length : 30,
      height = '',
      IgnoreOtherContract = false,
      txType = 0
  } = config || {};
  switchToggle.showLoading = true;
  let _url = `${api.transactions}${window.localStorage.Address}/${txType}?asset=${asset}&limit=${limit}&height=${height}&skipTxCountFromBlock=${(skipTxCountFromBlock || '')}&IgnoreOtherContract=${IgnoreOtherContract}`
  // axios.get(api.transactions + window.localStorage.Address + '/0?asset=' + asset + '&limit=' + limit + '&height=' + height + '&skipTxCountFromBlock=' + (skipTxCountFromBlock || '') + '&IgnoreOtherContract=' + IgnoreOtherContract, {
  axios.get(_url, {
    cancelToken: new CancelToken(c => {
      txTransSourceCancel = c;
    }),
    timeout: 60000
  }).then(res => {
    if (res.Error === 0) {
      const transferIn = [];
      const transferOut = [];
      const result = res.Result;
      for (let i = 0; i < result.length; i++) {
        if (result[i].Type === 1) {
          transferOut.push(result[i]);
        } else if (result[i].Type === 2) {
          transferIn.push(result[i]);
        }
        if (i === result.length - 1) {
          commit('SET_BLOCK_HEIGHT', result[i].BlockHeight)
        }
      }
      commit('SET_TX_RECORDS', result);
      commit('SET_TRANSFER_IN', transferIn);
      commit('SET_TRANSFER_OUT', transferOut);
      clearTimeout(timer.heart);
      timer.heart = setTimeout(() => {
        this.dispatch('setTxRecords', {
          asset,
          IgnoreOtherContract,
          txType
        }); // heart loading
      }, 5000);
    } else {
      if (axios.isCancel(thrown)) {} else {
        console.error('request error');
        console.error(thrown);
      }
    }
  }).finally(() => {
    switchToggle.showLoading = false;
  })
}
export default {
  state,
  mutations,
  actions
}