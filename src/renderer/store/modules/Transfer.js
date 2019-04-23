import axios from 'axios';
import api from '../../assets/config/api';
const state = {
  completeTransferList: [],
  uploadTransferList: [],
  downloadTransferList: [],
  downloadProgress: 0,
  uploadProgress: 0,
  downloadLength: 0,
  uploadLength: 0
}
let downloadTimer = null;
let uploadTimer = null;
const TIME_COUNT = 3000;
const mutations = {
  GET_DOWNLOAD_TRANSFER(state, result) {
    state.downloadTransferList = result;
    state.downloadLength = result.length;
    let downloadProgress = 0;
    for (let i = 0; i < result.length; i++) {
      downloadProgress += result[i].Progress;
    }
    state.downloadProgress = downloadProgress / result.length;
  },
  GET_UPLOAD_TRANSFER(state, result) {
    state.uploadTransferList = result;
    state.uploadLength = result.length;
    let uploadProgress = 0;
    for (let i = 0; i < result.length; i++) {
      uploadProgress += result[i].Progress;
    }
    state.uploadProgress = uploadProgress / result.length;
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