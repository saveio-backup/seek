import axios from 'axios';
import api from '../src/renderer/assets/config/api';
import {
  remote,
  ipcRenderer
} from "electron";
const views = remote.getCurrentWindow().views;
class Seek {
  constructor() {}
  getAccount() {
    return new Promise((resolve, reject) => {
      axios.get(api.account).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err);
      })
    })
  }
  toDeal(data, callback) {
    const uid = uniqId();
    const viewid = this.currentView().webContents.id;
    let path = `orderpay/?data=${data}&channel=${uid}&viewid=${viewid}`
    this.openComponent(path)

    callback && ipcRenderer.once(uid, (event, tx) => {
      callback(tx);
    })
  }
  openComponent(page) {
    views.find(item => item.isActive).openComponent(page)
  }
  currentView() {
    return views.find(item => item.isActive);
  }
}

function uniqId() {
  return Math.round(new Date().getTime() + (Math.random() * 100));
}
global.Seek = Seek