import axios from 'axios';
import api from '../../assets/config/api';
const transferClear = clearInterval;
let address = ''
// const transferClear = function () { };
const state = {
    completeTransferList: [],
    // remote upload data
    uploadingTransferList: [],
    downloadTransferList: [],
    // downloadProgress: 0,
    // uploadProgress: 0,
    downloadLength: 0,
    uploadLength: 0,
    realUploadingLength: 10,

    // total data = local data + remote upload data
    uploadTransferList: [],

    // local data
    waitForUploadList: [],
    // wait for upload order list
    waitForUploadOrderList: [],
    // rememb local new status (remote to be updated)
    localStatus: {
        pausing: [],
        uploading: []
    }
}
const mutations = {
    GET_DOWNLOAD_TRANSFER(state, result) {
        state.downloadTransferList = result;
        state.downloadLength = result.length;
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
        localStorage.setItem(`uploadTask_${address}`,JSON.stringify(result));
        state.waitForUploadList = result;
        
        // update uploadTransfer and uploadLength content
        state.uploadTransferList = state.uploadingTransferList.concat(state.waitForUploadList);
        state.uploadLength = state.uploadTransferList.length;
    },
    GET_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        state.waitForUploadOrderList = result
    },
    /**
     * params:
     * result(type array)
     *  */ 
    PUSH_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        let _waitForUploadOrderList = JSON.parse(JSON.stringify(state.waitForUploadOrderList));
        let flag = false;
        for(let value of result) {
            let index = _waitForUploadOrderList.indexOf(value);
            if(index === -1) {
                _waitForUploadOrderList.push(value);
                flag = true;
            }
        }
        if(flag) {
            state.waitForUploadOrderList = _waitForUploadOrderList;
            localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
        }
    },
    UNSHIFT_WAIT_FOR_UPLOAD_ORDER_LIST(state, result) {
        let _waitForUploadOrderList = JSON.parse(JSON.stringify(state.waitForUploadOrderList));
        let flag = false;
        for(let value of result) {
            let index = _waitForUploadOrderList.indexOf(value);
            if(index === -1) {
                _waitForUploadOrderList.unshift(value);
                flag = true;
            }
        }
        if(flag) {
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
        for(let value of result) {
            let index = _waitForUploadOrderList.indexOf(value);
            if(index === -1) continue;
            _waitForUploadOrderList.splice(index, 1);
            flag = true;
        }
        if(flag) {
            state.waitForUploadOrderList = _waitForUploadOrderList
            localStorage.setItem(`waitForUploadOrderList_${address}`, JSON.stringify(state.waitForUploadOrderList));
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
        for(let vaule of result) {
            let pausingIndex = _localStatus.pausing.indexOf(vaule);
            if(pausingIndex === -1) {
                _localStatus.pausing.push(vaule);
                flag = true;
            }
    
            let uploadingIndex = _localStatus.uploading.indexOf(vaule);
            if(uploadingIndex !== -1) {
                _localStatus.uploading.splice(uploadingIndex, 1);
                flag = true;
            }
        }
        if(flag) {
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
        for(let value of result) {
            let pausingIndex = _localStatus.pausing.indexOf(value);
            if(pausingIndex === -1) continue;
            _localStatus.pausing.splice(pausingIndex, 1);
            flag = true;
        }
        if(flag) {
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
        for(let value of result) {
            let uploadingIndex = _localStatus.uploading.indexOf(value);
            if(uploadingIndex === -1) {
                _localStatus.uploading.push(value);
                flag = true;
            }
    
            let pausingIndex = _localStatus.pausing.indexOf(value);
            if(pausingIndex !== -1) {
                _localStatus.pausing.splice(pausingIndex, 1);
                flag = true;
            }
        }
        if(flag) {
            state.localStatus = _localStatus;
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    },
    REMOVE_UPLOADING(state, result) {
        let _localStatus = JSON.parse(JSON.stringify(state.localStatus));
        let flag = false; // look for is not update
        for(let value of result) {
            let uploadingIndex = _localStatus.uploading.indexOf(value);
            if(uploadingIndex === -1) continue;
            _localStatus.uploading.splice(uploadingIndex, 1);
            flag = true;
        }
        if(flag) {
            state.localStatus = _localStatus;
            localStorage.setItem(`localStatus_${address}`, JSON.stringify(state.localStatus));
        }
    }
    
}
let downloadTimer = null;
let uploadTimer = null;
let completeTimer = null;
const TIME_COUNT = 3000;
const actions = {
    getWaitForUploadList({commit}) {
        address = localStorage.getItem('Address');
        let list = localStorage.getItem(`uploadTask_${address}`);
        if(list) {
            commit('GET_WAIT_FOR_UPLOAD_LIST', JSON.parse(list));
        }
        let list2 = localStorage.getItem(`waitForUploadOrderList_${address}`);
        if(list2) {
            commit('GET_WAIT_FOR_UPLOAD_ORDER_LIST', JSON.parse(list2));
        }
        let list3 = localStorage.getItem(`localStatus_${address}`);
        if(list3) {
            commit('GET_LOCAL_STATUS', JSON.parse(list3));
        }

    },
    setUpload({
        commit
    }) {
        transferClear(uploadTimer);
        uploadTransferListRequest.bind(this, commit)();
        uploadTimer = setInterval(uploadTransferListRequest.bind(this, commit), TIME_COUNT);
    },
    setDownload({
        commit
    }) {
        transferClear(downloadTimer);
        downloadTransferListRequest.bind(this, commit)();
        downloadTimer = setInterval(downloadTransferListRequest.bind(this, commit), TIME_COUNT)
    },
    setComplete({
        commit
    }) {
        transferClear(completeTimer);
        completeTransferListRequest.bind(this, commit)();
        completeTimer = setInterval(completeTransferListRequest.bind(this, commit), TIME_COUNT)
    },
    clearIntervalSetUpload({
        commit
    }) {
        transferClear(uploadTimer);
    },
    clearIntervalSetDownload({
        commit
    }) {
        transferClear(downloadTimer);
    },
    clearIntervalSetComplete({
        commit
    }) {
        transferClear(completeTimer);
    }
}

// const getter = {
//     uploadTransferList(state) {
//         let result = state.needUploadList.concat(state.uploadingTransferList);
//         state.uploadLength = result.length;        
//         return result;
//     }
// }

function completeTransferListRequest(commit) {
    axios.get(api.transferlist + '/0/0/0').then(res => {
        if (res.Error === 0) {
            const result = res.Result.Transfers;
            commit('GET_COMPLETED_TRANSFER', result)
        }
    })
}

function downloadTransferListRequest(commit) {
    axios.get(api.transferlist + '/2/0/0').then(res => {
        if (res.Error === 0) {
            this.dispatch('setComplete');

            const result = res.Result.Transfers;
            if (res.Result.IsTransfering) {} else {
                // transferClear(downloadTimer);
            }
            commit('GET_DOWNLOAD_TRANSFER', result)
        } else {
            // transferClear(downloadTimer);
        }
    }).catch((error) => {
        console.error(error)
    })
}

function uploadTransferListRequest(commit) {
    axios.get(api.transferlist + '/1/0/0').then(res => {
        if (res.Error === 0) {
            this.dispatch('setComplete');
            const result = res.Result.Transfers;
            if (res.Result.IsTransfering) {} else {
                // transferClear(uploadTimer);
            }
            commit('GET_UPLOAD_TRANSFER', result)
            let num = 0;
            for(let value of result) {
                if(value.Status !== 0 && value.Status !== 4) {
                    num ++;
                }
            }
            console.log('num',num);
            console.dir(result);
            commit('GET_REAL_UPLOADING_LENGTH', num)
        } else {
            // transferClear(uploadTimer);
        }
    })
}
export default {
    state,
    mutations,
    actions,
    // getter
}