const state = {
  space: ''
}

const mutations = {
  SET_SPACE(state, space) {
    state.space = space;
  }
}

const actions = {
  setSpace({
    commit
  },space) {
    // do something async
    commit('SET_SPACE',space)
  }
}

export default {
  state,
  mutations,
  actions
}