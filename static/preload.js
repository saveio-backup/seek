import axios from 'axios';
import api from '../src/renderer/assets/config/api';
import errorPage from './html/failed/failed';
import fs from 'fs';
import {
  remote,
  ipcRenderer
} from "electron";
const views = remote.getCurrentWindow().views;
const Version = '00';
ipcRenderer.on('will-load-thirdpage', (event, url) => {
  loadThirdPage(url);
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

    callback && ipcRenderer.once(uid, (event, tx) => {
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
  static openComponent({
    path
  }) {
    views.find(item => item.isActive).openComponent(path)
  }
}

function currentView() {
  return views.find(item => item.isActive);
}

async function loadThirdPage(url) {
  const detail = await getTransferDetail(url);
  if (detail.data.Result) {
    const data = detail.data.Result;
    if (data.Progress >= 0 && data.Progress < 1) { // task has exit
      if (data.Status === 0) { // but in Pause state 
        // todo  download continue
        axios.post(api.downloadResume, {
          Ids: [data.Id]
        }).then(res => {
          if (res.data.Error === 0) {
            setTimeout(() => {
              loadThirdPage(url);
            }, 2000);
          }
        })
      } else { // in processing 
        setTimeout(() => {
          loadThirdPage(url);
        }, 2000);
      }
    } else if (data.Progress === 1) { // task has finished
      // render page
      try {
        fs.statSync(data.Path);
        ipcRenderer.send('load-third-page', data.Path);
        console.log('task finished!!!!');
      } catch (error) {
        downloadPage(url); // task exist but file not found
      }
    }
  } else {
    downloadPage(url);
  }
}

function downloadPage(url) {
  axios.post(api.download, {
    Url: url,
    MaxPeerNum: 20,
    SetFileName: true
  }).then(res => {
    if (res.data.Error === 0) {
      setTimeout(() => {
        loadThirdPage(url);
      }, 2000);
    } else {
      ipcRenderer.send('loadErrorPage');
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
global.Seek = Seek