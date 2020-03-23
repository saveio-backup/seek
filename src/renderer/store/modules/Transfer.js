import axios from 'axios';
import api from '../../assets/config/api';
const CancelToken = axios.CancelToken;
let syncFileRequestCancel;

const transferClear = clearInterval;
// const transferClear = function () { };
const state = {
    completeTransferList: [],
    uploadingTransferList: [],
    downloadingTransferList: [],
    // just now complete task;
    justNowCompleteNumber: 0,

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
    syncListLimit: 0,
    fileboxLeave: true,
    downloadDoneList: [],
    uploadDoneList: []
}
const mutations = {
    SET_UPLOAD_DONE_LIST(state, result) {
        state.uploadDoneList = result
    },
    SET_DOWNLOAD_DONE_LIST(state, result) {
        state.downloadDoneList = result
    },
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
        console.log('SET_WAIT_FOR_UPLOAD_LIST:===========================', result);
        if(!address) {
            address = localStorage.getItem('Address');
        }
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
        console.log('SET_WAIT_FOR_DOWNLOAD_LIST:===========================',result);
        if(!address) {
            address = localStorage.getItem('Address');
        }
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
        console.log('PUSH_WAIT_FOR_UPLOAD_ORDER_LIST:===========================', result);
        console.log('state.waitForUploadOrderList:', state.waitForUploadOrderList);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.waitForUploadOrderList:",state.waitForUploadOrderList);
            // localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },
    UNSHIFT_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        console.log("UNSHIFT_WAIT_FOR_UPLOAD_ORDER_LIST:===========================", result);
        console.log("state.waitForUploadOrderList:",state.waitForUploadOrderList);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.waitForUploadOrderList:", state.waitForUploadOrderList);
            // localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        console.log("REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST:===========================", result);
        console.log("state.waitForUploadOrderList:",state.waitForUploadOrderList);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.waitForUploadOrderList:",state.waitForUploadOrderList);
            // localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },
    SET_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        console.log("SET_WAIT_FOR_UPLOAD_ORDER_LIST:===========================", result);
        state.waitForUploadOrderList = result;
        if(!address) {
            address = localStorage.getItem('Address');
        }
        // localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(result));
    },
    /**
     * params:
     * result(type array)
     *  */
    PUSH_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        console.log("PUSH_WAIT_FOR_DOWNLOAD_ORDER_LIST:===========================", result);
        console.log("state.waitForDownloadOrderList:", state.waitForDownloadOrderList);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            // console.log("state.waitForDownloadOrderList:", state.waitForDownloadOrderList);
            // localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(state.waitForDownloadOrderList));
        }
    },
    UNSHIFT_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        console.log("UNSHIFT_WAIT_FOR_DOWNLOAD_ORDER_LIST:===========================", result);
        console.log("state.waitForDownloadOrderList:", state.waitForDownloadOrderList);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            // console.log("state.waitForDownloadOrderList:", state.waitForDownloadOrderList);
            // localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(state.waitForDownloadOrderList));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        console.log("REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST:===========================", result);
        console.log("state.waitForDownloadOrderList:", state.waitForDownloadOrderList);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            // console.log("state.waitForDownloadOrderList:", state.waitForDownloadOrderList);
            // localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(state.waitForDownloadOrderList));
        }
    },
    SET_WAIT_FOR_DOWNLOAD_ORDER_LIST(state, result) {
        console.log("SET_WAIT_FOR_DOWNLOAD_ORDER_LIST:===========================", result);
        state.waitForDownloadOrderList = result
        if(!address) {
            address = localStorage.getItem('Address');
        }
        // localStorage.setItem(`waitForDownloadOrderList_${address}`, JSON.stringify(result));
    },


    GET_LOCAL_STATUS(state, result) {
        console.log("GET_LOCAL_STATUS:===========================", result);
        state.localStatus = result;
        if(!address) {
            address = localStorage.getItem('Address');
        }
        localStorage.setItem(`localStatus_${address}`, JSON.stringify(result));
    },
    /**
     * params:
     * result(type array)
     *  */
    ADD_PAUSING(state, result) {
        console.log("ADD_PAUSING:===========================", result);
        console.log("state.localStatus:", state.localStatus);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.localStatus:", state.localStatus)
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    REMOVE_PAUSING(state, result) {
        console.log("REMOVE_PAUSING:===========================",result);
        console.log("state.localStatus:", state.localStatus);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.localStatus:", state.localStatus);
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    /**
     * params:
     * result(type array)
     *  */
    ADD_UPLOADING(state, result) {
        console.log("ADD_UPLOADING:===========================", result);
        console.log("state.localStatus:", state.localStatus);
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.localStatus:", state.localStatus);
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    REMOVE_UPLOADING(state, result) {
        console.log("REMOVE_UPLOADING:===========================", result);
        console.log("state.localStatus:", state.localStatus)
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
            if(!address) {
                address = localStorage.getItem('Address');
            }
            console.log("state.localStatus:", state.localStatus);
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    SET_SYNC_LIST(state, result) {
        state.syncList = result;
    },
    SET_SYNC_LIST_LIMIT(state, result) {
        state.syncListLimit = result;
    },
    /**
     * push justNowCompleteArr value
    */
    ADD_JUST_NOW_COMPLETE_Number(state, result) {
        state.justNowCompleteNumber = state.justNowCompleteNumber + 1;
    },
    SET_FILEBOX_LEAVE(state, result) {
        state.fileboxLeave = result;
    }
}
let downloadTimer = null;
let uploadTimer = null;
let completeTimer = null;
let syncFileTimer = null;
let address = '';

// let syncFileTimeoutr = null;
// const TIME_COUNT = 3000;
const actions = {
    getWaitForTransferList({
        commit
    }) {
        address = localStorage.getItem('Address');
        if(!address) return;
        let list = localStorage.getItem(`uploadTask_${address}`);
        if (list) {
            let _list = JSON.parse(list) || [];
            let _newList = _list.filter(value => {
                value.Status = 0;
                if(value.Ready) {
                    return false;
                }
                return true;
            })
            commit('GET_WAIT_FOR_UPLOAD_LIST', _newList);
        }

        commit('GET_WAIT_FOR_UPLOAD_ORDER_LIST', []);
        commit('GET_LOCAL_STATUS', {
            pausing: [],
            uploading: []
        });
        let list4 = localStorage.getItem(`downloadTask_${address}`);
        if (list4) {
            let _list4 = JSON.parse(list4) || [];
            let _newList4 = _list4.filter(value => {
                value.Status = 0;
                if(value.Ready) {
                    return false;
                }
                return true;
            })
            commit('GET_WAIT_FOR_DOWNLOAD_LIST', _newList4);
        }

        commit('GET_WAIT_FOR_DOWNLOAD_ORDER_LIST', []);
        commit('GET_LOCAL_STATUS', {
            pausing: [],
            uploading: []
        });

        let list6 = localStorage.getItem(`downloadDoneList_${address}`);
        if(list6) {
            commit('SET_DOWNLOAD_DONE_LIST', JSON.parse(list6))
        }
        let list7 = localStorage.getItem(`uploadDoneList_${address}`);
        if(list7) {
            commit('SET_UPLOAD_DONE_LIST', JSON.parse(list7))
        }
    },
    getUpload({
        commit
    }) {
        clearTimeout(uploadTimer);
        uploadTimer = setTimeout(() => {
            uploadTransferListRequest.bind(this, commit)();
        }, 200);
    },
    getDownload({
        commit
    }) {
        clearTimeout(downloadTimer)
        downloadTimer = setTimeout(() => {
            downloadTransferListRequest.bind(this, commit)();
        }, 200)
    },
    getComplete({
        commit
    }) {
        clearTimeout(completeTimer);
        completeTimer = setTimeout(() => {
            completeTransferListRequest.bind(this, commit)();
        }, 200)
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
    }, limit = 0) {
        commit('SET_FILEBOX_LEAVE', false);
        commit('SET_SYNC_LIST_LIMIT', limit);
        clearTimeout(syncFileTimer);
        try {
            syncFileRequestCancel('request cancel!');
        } catch (e) {}
        syncFileRequest.bind(this, commit, state, limit)();
    },
    clearIntervalSyncFileList({commit}) {
        commit('SET_FILEBOX_LEAVE', true);
        clearTimeout(syncFileTimer);
    }
}

function completeTransferListRequest(commit) {
    axios.get(api.transferlist + '/0/0/0/0/0/0/0').then(res => {
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
    axios.get(api.transferlist + '/2/0/0/0/0/0/0').then(res => {
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
    axios.get(api.transferlist + '/1/0/0/0/0/0/0').then(res => {
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
            if (value.Status !== 0 && value.Status !== 4 && value.Status !== 5) {
                num++;
            }
        }
        console.log("num:============>",num);
        commit('GET_REAL_UPLOADING_LENGTH', num)
    } else {
        // transferClear(uploadTimer);
    }
}

function syncFileRequest(commit, state, limit) {
    clearTimeout(syncFileTimer);
    axios.get(api.getFileList + `0/0/${limit}/1/0/0/0/0`, {
        cancelToken: new CancelToken(c => {
            syncFileRequestCancel = c;
        }),
        timeout: 60000
    }).then(res => {
        if (res.Error === 0) {
            commit('SET_SYNC_LIST', res.Result.List);
        }
    }).finally(() => {
        syncFileTimer = setTimeout(() => {
            if((state.uploadLength !== 0 || state.syncList.length !== 0) && !state.fileboxLeave) {
                syncFileRequest(commit, state, limit);
            }
        }, 3000)
    })
}
export default {
    state,
    mutations,
    actions,
}