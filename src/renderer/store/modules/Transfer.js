import axios from 'axios';
import api from '../../assets/config/api';
const state = {
  completeTransferList: [],
  uploadTransferList: [],
  downloadTransferList: []
}
let downloadTimer = null;
let uploadTimer = null;
const TIME_COUNT = 2000;
const mutations = {
  GET_DOWNLOAD_TRANSFER(state, result) {
    state.downloadTransferList = result;
  },
  GET_UPLOAD_TRANSFER(state, result) {
    state.uploadTransferList = result;
  },
  GET_COMPLETED_TRANSFER(state, result) {
    state.completeTransferList = result;
  }
}

const actions = {
  setUpload({
    commit
  }) {
    clearInterval(uploadTimer);
    uploadTimer = setInterval(() => {
      axios.get(api.transferlist + '/1/0/0').then(res => {
        if (res.data.Error === 0) {
          this.dispatch('setComplete');
          const result = res.data.Result.Transfers;
          if (res.data.Result.IsTransfering) {} else {
            clearInterval(uploadTimer);
          }
          commit('GET_UPLOAD_TRANSFER', result)
        }
      }).catch(() => {
        clearInterval(uploadTimer);
      })
    }, TIME_COUNT);
  },
  setDownload({
    commit
  }) {
    clearInterval(downloadTimer);
    downloadTimer = setInterval(() => {
      axios.get(api.transferlist + '/2/0/0').then(res => {
        if (res.data.Error === 0) {
          this.dispatch('setComplete');
          const result = res.data.Result.Transfers;
          if (res.data.Result.IsTransfering) {} else {
            clearInterval(downloadTimer);
          }
          commit('GET_DOWNLOAD_TRANSFER', result)
        }
      }).catch((error) => {
        console.error(error)
        clearInterval(downloadTimer);
      })
    }, TIME_COUNT);
  },
  setComplete({
    commit
  }) {
    axios.get(api.transferlist + '/0/0/0').then(res => {
      if (res.data.Error === 0) {
        const result = res.data.Result.Transfers;
        commit('GET_COMPLETED_TRANSFER', result)
      }
    })
  }
}

export default {
  state,
  mutations,
  actions
}