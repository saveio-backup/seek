const state = {
  completeTransferList: [],
  uploadTransferList: [],
  downloadTransferList: []
}
let downloadTimer = null;
let uploadTimer = null;
const TIME_COUNT = 2000;
const mutations = {
  GET_DOWNLOAD_TRANSFER(state) {
    clearInterval(downloadTimer);
    downloadTimer = setInterval(() => {
      this.$axios.get(this.$api.transferlist + '/2/0/0').then(res => {
        if (res.data.Error === 0) {
          this.GET_COMPLETED_TRANSFER();
          const result = res.data.Result;
          if (result.length > 0) {} else {
            clearInterval(downloadTimer);
          }
          state.downloadTransferList = res.data.Result;
        }
      })
    }, TIME_COUNT);
  },
  GET_UPLOAD_TRANSFER(state) {
    clearInterval(uploadTimer);
    uploadTimer = setInterval(() => {
      this.$axios.get(this.$api.transferlist + '/1/0/0').then(res => {
        if (res.data.Error === 0) {
          this.GET_COMPLETED_TRANSFER();
          const result = res.data.Result;
          if (result.length > 0) {} else {
            clearInterval(uploadTimer);
          }
          state.uploadTransferList = res.data.Result;
        }
      })
    }, TIME_COUNT);
  },
  GET_COMPLETED_TRANSFER(state) {
    this.$axios.get(this.$api.transferlist + '/0/0/0').then(res => {
      if (res.data.Error === 0) {
        const result = res.data.Result;
        state.completeTransferList = result;
      }
    })
  }
}

const actions = {
  setUpload({
    commit
  }) {
    commit('GET_UPLOAD_TRANSFER')
  },
  setDownload({
    commit
  }) {
    commit('GET_DOWNLOAD_TRANSFER')
  }
}

export default {
  state,
  mutations,
  actions
}