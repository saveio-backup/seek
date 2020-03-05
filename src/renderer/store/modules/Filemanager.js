import axios from 'axios';
import api from '../../assets/config/api';
const state = {
  space: '',
  smartContractEvents: null
}

const mutations = {
  SET_SPACE(state, space) {
    state.space = space;
  },
  SET_SMART_CONTRACT_EVENTS(state, result) {
    state.smartContractEvents = result;
  }
}

const actions = {
  setSpace({
    commit
  }) {
    // do something async
    axios
      .get(api.userspace + window.localStorage.getItem("Address"))
      .then(res => {
        if (res.Error === 0) {
          commit('SET_SPACE', res.Result)
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