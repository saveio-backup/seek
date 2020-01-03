import axios from 'axios';
import api from '../../assets/config/api';
const CancelToken = axios.CancelToken;
let syncFileRequestCancel;

const transferClear = clearInterval;
let address = ''
// const transferClear = function () { };
const state = {
    completeTransferList: [],
    // remote upload data
    uploadingTransferList: [],
    downloadingTransferList: [],
    // downloadTransferList: [],

    downloadLength: 0,
    uploadLength: 0,
    realUploadingLength: 10,
    realDownloadingLength: 10,

    // total data = local data + remote upload data
    uploadTransferList: [],
    downloadTransferList: [],

    // local data
    waitForUploadList: [],
    waitForDownloadList: [],
    // wait for upload order list
    waitForUploadOrderList: [],
    waitForDownloadOrderList: [],
    // rememb local new status (remote to be updated)
    localStatus: {
        pausing: [],
        uploading: []
    },
    syncList: [],
    syncListLimit: 0
}
const mutations = {
    GET_DOWNLOAD_TRANSFER(state, result) {
        state.downloadingTransferList = result;

        state.downloadTransferList = state.downloadingTransferList.concat(state.waitForDownloadList);
        state.downloadLength = state.downloadTransferList.length;
    },
    GET_UPLOAD_TRANSFER(state, result) {
        state.uploadingTransferList = result;

        state.uploadTransferList = state.uploadingTransferList.concat(state.waitForUploadList);
        state.uploadLength = state.uploadTransferList.length;
    },
    GET_COMPLETED_TRANSFER(state, result) {
        state.completeTransferList = result;
    },
    // set uploadTask (Data is distributed api)
    GET_WAIT_FOR_UPLOAD_LIST(state, result) {
        state.waitForUploadList = result;

        // update uploadTransfer and uploadLength content
        state.uploadTransferList = state.uploadingTransferList.concat(state.waitForUploadList);
        state.uploadLength = state.uploadTransferList.length;
    },
    GET_REAL_UPLOADING_LENGTH(state, result) {
        state.realUploadingLength = result;
    },
    // set uploadTask (Data set api) 
    SET_WAIT_FOR_UPLOAD_LIST(state, result) {
        localStorage.setItem(`uploadTask_${address}`, JSON.stringify(result));
        state.waitForUploadList = result;

        // update uploadTransfer and uploadLength content
        state.uploadTransferList = state.uploadingTransferList.concat(state.waitForUploadList);
        state.uploadLength = state.uploadTransferList.length;
    },
    GET_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        state.waitForUploadOrderList = result
    },

    // set downloadTask (Data is distributed api)
    GET_WAIT_FOR_DOWNLOAD_LIST(state, result) {
        state.waitForDownloadList = result;

        // update downloadTransfer and downloadLength content
        state.downloadTransferList = state.downloadingTransferList.concat(state.waitForDownloadList);
        state.downloadLength = state.downloadTransferList.length;
    },
    GET_REAL_DOWNLOADING_LENGTH(state, result) {
        state.realDownloadingLength = result;
    },
    // set downloadTask (Data set api) 
    SET_WAIT_FOR_DOWNLOAD_LIST(state, result) {
        localStorage.setItem(`downloadTask_${address}`, JSON.stringify(result));
        state.waitForDownloadList = result;

        // update downloadTransfer and downloadLength content
        state.downloadTransferList = state.downloadingTransferList.concat(state.waitForDownloadList);
        state.downloadLength = state.downloadTransferList.length;
    },
    GET_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        state.waitForDownloadOrderList = result
    },
    /**
     * params:
     * result(type array)
     *  */
    PUSH_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        let _waitForUploadOrderList = JSON.parse(JSON.stringify(state.waitForUploadOrderList));
        let flag = false;
        for (let value of result) {
            let index = _waitForUploadOrderList.indexOf(value);
            if (index === -1) {
                _waitForUploadOrderList.push(value);
                flag = true;
            }
        }
        if (flag) {
            state.waitForUploadOrderList = _waitForUploadOrderList;
            localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },
    UNSHIFT_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        let _waitForUploadOrderList = JSON.parse(JSON.stringify(state.waitForUploadOrderList));
        let flag = false;
        for (let value of result) {
            let index = _waitForUploadOrderList.indexOf(value);
            if (index === -1) {
                _waitForUploadOrderList.unshift(value);
                flag = true;
            }
        }
        if (flag) {
            state.waitForUploadOrderList = _waitForUploadOrderList;
            localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        let _waitForUploadOrderList = JSON.parse(JSON.stringify(state.waitForUploadOrderList));
        let flag = false; // look for is not update
        for (let value of result) {
            let index = _waitForUploadOrderList.indexOf(value);
            if (index === -1) continue;
            _waitForUploadOrderList.splice(index, 1);
            flag = true;
        }
        if (flag) {
            state.waitForUploadOrderList = _waitForUploadOrderList
            localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },

    /**
     * params:
     * result(type array)
     *  */
    PUSH_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        let _waitForDownloadOrderList = JSON.parse(JSON.stringify(state.waitForDownloadOrderList));
        let flag = false;
        for (let value of result) {
            let index = _waitForDownloadOrderList.indexOf(value);
            if (index === -1) {
                _waitForDownloadOrderList.push(value);
                flag = true;
            }
        }
        if (flag) {
            state.waitForDownloadOrderList = _waitForDownloadOrderList;
            localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(state.waitForDownloadOrderList));
        }
    },
    UNSHIFT_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        let _waitForDownloadOrderList = JSON.parse(JSON.stringify(state.waitForDownloadOrderList));
        let flag = false;
        for (let value of result) {
            let index = _waitForDownloadOrderList.indexOf(value);
            if (index === -1) {
                _waitForDownloadOrderList.unshift(value);
                flag = true;
            }
        }
        if (flag) {
            state.waitForDownloadOrderList = _waitForDownloadOrderList;
            localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(state.waitForDownloadOrderList));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        let _waitForDownloadOrderList = JSON.parse(JSON.stringify(state.waitForDownloadOrderList));
        let flag = false; // look for is not update
        for (let value of result) {
            let index = _waitForDownloadOrderList.indexOf(value);
            if (index === -1) continue;
            _waitForDownloadOrderList.splice(index, 1);
            flag = true;
        }
        if (flag) {
            state.waitForDownloadOrderList = _waitForDownloadOrderList
            localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(state.waitForDownloadOrderList));
        }
    },

    GET_LOCAL_STATUS(state, result) {
        state.localStatus = result;
    },
    /**
     * params:
     * result(type array)
     *  */
    ADD_PAUSING(state, result) {
        let _localStatus = JSON.parse(JSON.stringify(state.localStatus));
        let flag = false; // look for is not update
        for (let vaule of result) {
            let pausingIndex = _localStatus.pausing.indexOf(vaule);
            if (pausingIndex === -1) {
                _localStatus.pausing.push(vaule);
                flag = true;
            }

            let uploadingIndex = _localStatus.uploading.indexOf(vaule);
            if (uploadingIndex !== -1) {
                _localStatus.uploading.splice(uploadingIndex, 1);
                flag = true;
            }
        }
        if (flag) {
            state.localStatus = _localStatus;
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    REMOVE_PAUSING(state, result) {
        let _localStatus = JSON.parse(JSON.stringify(state.localStatus));
        let flag = false; // look for is not update
        for (let value of result) {
            let pausingIndex = _localStatus.pausing.indexOf(value);
            if (pausingIndex === -1) continue;
            _localStatus.pausing.splice(pausingIndex, 1);
            flag = true;
        }
        if (flag) {
            state.localStatus = _localStatus
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    ADD_UPLOADING(state, result) {
        let _localStatus = JSON.parse(JSON.stringify(state.localStatus));
        let flag = false; // look for is not update
        for (let value of result) {
            let uploadingIndex = _localStatus.uploading.indexOf(value);
            if (uploadingIndex === -1) {
                _localStatus.uploading.push(value);
                flag = true;
            }

            let pausingIndex = _localStatus.pausing.indexOf(value);
            if (pausingIndex !== -1) {
                _localStatus.pausing.splice(pausingIndex, 1);
                flag = true;
            }
        }
        if (flag) {
            state.localStatus = _localStatus;
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    REMOVE_UPLOADING(state, result) {
        let _localStatus = JSON.parse(JSON.stringify(state.localStatus));
        let flag = false; // look for is not update
        for (let value of result) {
            let uploadingIndex = _localStatus.uploading.indexOf(value);
            if (uploadingIndex === -1) continue;
            _localStatus.uploading.splice(uploadingIndex, 1);
            flag = true;
        }
        if (flag) {
            state.localStatus = _localStatus;
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    SET_SYNC_LIST(state, result) {
        state.syncList = result;
    },
    SET_SYNC_LIST_LIMIT(state, result) {
        state.syncListLimit = result;
    }

}
let downloadTimer = null;
let uploadTimer = null;
let completeTimer = null;
let syncFileTimer = null;
// let syncFileTimeoutr = null;
// const TIME_COUNT = 3000;
const actions = {
    getWaitForTransferList({
        commit
    }) {
        address = localStorage.getItem('Address');
        let list = localStorage.getItem(`uploadTask_${address}`);
        if (list) {
            commit('GET_WAIT_FOR_UPLOAD_LIST', JSON.parse(list));
        }
        let list2 = localStorage.getItem(`waitForUploadOrderList_${address}`);
        if (list2) {
            commit('GET_WAIT_FOR_UPLOAD_ORDER_LIST', JSON.parse(list2));
        }
        let list3 = localStorage.getItem(`localStatus_${address}`);
        if (list3) {
            commit('GET_LOCAL_STATUS', JSON.parse(list3));
        }
        let list4 = localStorage.getItem(`downloadTask_${address}`);
        if (list4) {
            commit('GET_WAIT_FOR_DOWNLOAD_LIST', JSON.parse(list4));
        }
        let list5 = localStorage.getItem(`waitForDownloadOrderList_${address}`);
        if (list5) {
            commit('GET_WAIT_FOR_DOWNLOAD_ORDER_LIST', JSON.parse(list5));
        }
    },
    getUpload({
        commit
    }) {
        // transferClear(uploadTimer);
        clearTimeout(uploadTimer);
        uploadTimer = setTimeout(() => {
            uploadTransferListRequest.bind(this, commit)();
        }, 200);
        // uploadTimer = setInterval(uploadTransferListRequest.bind(this, commit), TIME_COUNT);
    },
    getDownload({
        commit
    }) {
        // transferClear(downloadTimer);
        clearTimeout(downloadTimer)
        downloadTimer = setTimeout(() => {
            downloadTransferListRequest.bind(this, commit)();
        }, 200)

        // downloadTimer = setInterval(downloadTransferListRequest.bind(this, commit), TIME_COUNT)
    },
    getComplete({
        commit
    }) {
        // transferClear(completeTimer);
        clearTimeout(completeTimer);
        completeTimer = setTimeout(() => {
            completeTransferListRequest.bind(this, commit)();
        }, 200)
        // completeTimer = setInterval(completeTransferListRequest.bind(this, commit), TIME_COUNT)
    },
    setUpload({
        commit
    }, res) {
        toUploadTransferListRequest.bind(this, {
            commit,
            res
        })();
    },
    setDownload({
        commit
    }, res) {
        toDownloadTransferListRequest.bind(this, {
            commit,
            res
        })();
    },
    setComplete({
        commit
    }, res) {
        toCompleteTransferListRequest.bind(this, {
            commit,
            res
        })();
    },
    getSyncFileList({
        commit,
        state
    }, limit) {
        commit('SET_SYNC_LIST_LIMIT', limit);
        try {
            syncFileRequestCancel('request cancel!');
        } catch(e) {}
        syncFileRequest.bind(this, commit, limit)();
        // syncFileTimer = setInterval(() => {
        // syncFileRequest.bind(this, commit, state.syncListLimit)();
        // }, 3000)
    },
    clearIntervalSyncFileList() {
        clearInterval(syncFileTimer);
    }
}

function completeTransferListRequest(commit) {
    axios.get(api.transferlist + '/0/0/0').then(res => {
        toCompleteTransferListRequest.bind(this, {
            commit,
            res
        })();
    })
}

function toCompleteTransferListRequest({
    commit,
    res
}) {
    if (res.Error === 0) {
        const result = res.Result.Transfers;
        commit('GET_COMPLETED_TRANSFER', result)
    }
}

function downloadTransferListRequest(commit) {
    axios.get(api.transferlist + '/2/0/0').then(res => {
        toDownloadTransferListRequest.bind(this, {
            commit,
            res
        })();
    }).catch((error) => {
        console.error(error)
    })
}

function toDownloadTransferListRequest({
    commit,
    res
}) {
    if (res.Error === 0) {
        const result = res.Result.Transfers;
        if (res.Result.IsTransfering) {} else {
            // transferClear(downloadTimer);
        }
        commit('GET_DOWNLOAD_TRANSFER', result)
        let num = 0;
        for (let value of result) {
            if (value.Status !== 0 && value.Status !== 4 && !value.Url.startsWith('oni://www')) {
                num++;
            }
        }
        commit('GET_REAL_DOWNLOADING_LENGTH', num)
    } else {
        // transferClear(downloadTimer);
    }
}

function uploadTransferListRequest(commit) {
    axios.get(api.transferlist + '/1/0/0').then(res => {
        toUploadTransferListRequest.bind(this, {
            commit,
            res
        })();
    })
}

function toUploadTransferListRequest({
    commit,
    res
}) {
    if (res.Error === 0) {
        // this.dispatch('getComplete');
        const result = res.Result.Transfers;
        if (res.Result.IsTransfering) {} else {
            // transferClear(uploadTimer);
        }
        commit('GET_UPLOAD_TRANSFER', result)
        let num = 0;
        for (let value of result) {
            if (value.Status !== 0 && value.Status !== 4) {
                num++;
            }
        }
        commit('GET_REAL_UPLOADING_LENGTH', num)
    } else {
        // transferClear(uploadTimer);
    }
}

function syncFileRequest(commit, limit) {
    clearTimeout(syncFileTimer);
    // clearTimeout(syncFileTimeoutr);
    // syncFileTimeoutr = setTimeout(() => {
    //     syncFileRequestCancel('request cancel!');
    // }, 60000)
    axios.get(api.getFileList + `0/0/${limit}/1`, {
        cancelToken: new CancelToken(c => {
            syncFileRequestCancel = c;
        }),
        timeout: 60000
    }).then(res => {
        if (res.Error === 0) {
            commit('SET_SYNC_LIST', res.Result);
        }
    }).finally(() => {
        syncFileTimer = setTimeout(() => {
            syncFileRequest(commit, limit);
        }, 3000)
    })
}
export default {
    state,
    mutations,
    actions,
}