import axios from 'axios';
import api from '../../assets/config/api';
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
  }) {
    // do something async
    axios
      .get(api.userspace + window.localStorage.getItem("Address"))
      .then(res => {
        if (res.data.Desc === "SUCCESS") {
          if (res.data.Error === 0) {
            commit('SET_SPACE', res.data.Result)
          }
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