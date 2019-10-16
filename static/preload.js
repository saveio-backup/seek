import axios from 'axios';
import api from '../src/renderer/assets/config/api';
import failedPage from './html/failed/failed';
import fs from 'fs';
import {
  remote,
  ipcRenderer
} from "electron";
console.log('declar views');
const views = remote.getCurrentWindow() ? remote.getCurrentWindow().views : null;
const Version = '00';
const thirdPageUid = {};
ipcRenderer.on('will-load-thirdpage', (event, url, uuid) => {
  loadThirdPage(url, uuid);
})
ipcRenderer.on('will-cancel-downloadpage', (event, url) => {
  cancelDownload(url);
})
class Seek {
  constructor() {}
  static getAccount() {
    return new Promise((resolve, reject) => {
      axios.get(api.account).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    })
  }
  static preExecNativeContract(data) {
    data = JSON.parse(data);
    data.Version = Version;
    return new Promise((resolve, reject) => {
      axios.post(api.preexecContract, data).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    })
  }
  static invokeNativeContract(data, callback) {
    const uid = uniqId();
    const viewid = currentView().webContents.id;
    let path = `orderpay/?data=${encodeURIComponent(data)}&channel=${uid}&viewid=${viewid}`;
    this.openComponent({
      path
    });

    callback && ipcRenderer.on(uid, (event, tx) => {
      callback(tx);
    })
  }
  static downloadUrl({
    path
  }, callback) {
    if (path.toLowerCase().startsWith('oni://share/')) {
      this.openNewUrl({
        path
      });
      callback({
        Error: 0,
        Desc: ''
      });
    } else {
      callback({
        Error: 90000,
        Desc: '格式不正确'
      });
    }
  }
  static openNewUrl({
    path
  }) {
    let view = views.find(item => item.isActive)
    view.url = path;
    view.onNewUrl(path);
  }
  static openChannel(flag) {
    const path = 'seek://Home?exec=openAddChannel'
    let view = views.find(item => item.isActive)
    view.url = path;
    view.onNewUrl(path);
  }
  static openComponent({
    path
  }) {
    views.find(item => item.isActive).openComponent(path)
  }
}

function currentView() {
  return views.find(item => item.isActive);
}

async function loadThirdPage(url, uuid) {
  const detail = await getTransferDetail(url);
  if (detail.data.Result) {
    thirdPageUid[uuid] = true;
    const data = detail.data.Result;
    if (data.Progress >= 0 && data.Progress < 1) { // task has exist
      if (data.Status === 0) { // but in Pause state 
        axios.post(api.downloadResume, {
          Ids: [data.Id]
        }).then(res => {
          if (res.data.Error === 0) {
            setTimeout(() => {
              loadThirdPage(url, uuid);
            }, 2000);
          }
        })
      } else { // in processing 
        setTimeout(() => {
          loadThirdPage(url, uuid);
        }, 2000);
      }
    } else if (data.Progress === 1) { // task has finished
      // render page
      try {
        fs.statSync(data.Path);
        console.log('path is');
        console.log(data.Path);
        ipcRenderer.send('load-third-page', data.Path);
        console.log('task finished!!!!');
      } catch (error) {
        console.error(`error ${error}`);
        downloadPage(url, uuid); // task exist but file not found
      }
    }
  } else if (thirdPageUid[uuid]) {
    console.log(`no result ${url}`);
    delete thirdPageUid[uuid]
    console.log('loadErrorPage , uuid is:', uuid);
    ipcRenderer.send(uuid + '-loadErrorPage', {
      note: 'The task has been cancelled.'
    });
  } else {
    thirdPageUid[uuid] = true;
    downloadPage(url, uuid);
  }
}

async function cancelDownload(url) {
  const detail = await getTransferDetail(url);
  let Id = null;
  const data = detail.data.Result;
  if (data && data.Progress < 1) {
    Id = data.Id;
    axios.post(api.downloadCancel, {
      Ids: [Id]
    }).then(res => {
      console.log('download cancel');
      console.log(res);
    })
  }
}

function downloadPage(url, uuid) {
  axios.post(api.download, {
    Url: url,
    MaxPeerNum: 20,
    SetFileName: true
  }).then(res => {
    if (res.data.Error === 0) {
      setTimeout(() => {
        loadThirdPage(url, uuid);
      }, 2000);
    } else {
      console.log('emit loadErrorPage')
      ipcRenderer.send(uuid + '-loadErrorPage', {
        errorCode: res.data.Error
      });
    }
  })
}

function getTransferDetail(url) {
  const hexUrl = ipcRenderer.sendSync('string-to-hex', url);
  return new Promise((resolve, reject) => {
    axios.get(api.transferDetail + `/3/${hexUrl}`).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    })
  })
}


function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}
process.once('loaded', () => {
  console.log('loaded');
  global.Seek = Seek;
  global.remote = remote;
})