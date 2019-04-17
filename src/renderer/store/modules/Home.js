const state = {
  balanceTotal: 0
}

const mutations = {
  'SET_BALANCE_TOTAL'(state, result) {
    state.balanceTotal = result;
  }
}

const actions = {
  setChannelBalanceTotal({
    commit
  }, result) {
    // do something async
    commit('SET_BALANCE_TOTAL', result)
  }
}

export default {
  state,
  mutations,
  actions
}