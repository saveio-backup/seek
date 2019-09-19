import axios from 'axios';
import api from '../src/renderer/assets/config/api';
import {
  remote,
  ipcRenderer
} from "electron";
const views = remote.getCurrentWindow().views;
const Version = '00';
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
    let path = `orderpay/?data=${data}&channel=${uid}&viewid=${viewid}`;
    this.openComponent({path});

    callback && ipcRenderer.once(uid, (event, tx) => {
      callback(tx);
    })
  }
  static downloadUrl({path}, callback) {
    if (path.toLowerCase().startsWith('oni://share/')) {
      this.openNewUrl(path);
      // callback({Error: 0, Desc: ''});
    } else {
      // callback({Error: 90000, Desc: '格式不正确'});
    }
  }
  static openNewUrl({path}) {
    let view = views.find(item => item.isActive)
    view.url = path;
    view.onNewUrl(path);
  }
  static openComponent({path}) {
    views.find(item => item.isActive).openComponent(path)
  }
}

function currentView() {
  return views.find(item => item.isActive);
}

function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}
global.Seek = Seek