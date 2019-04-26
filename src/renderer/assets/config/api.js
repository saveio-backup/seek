const {
  app
} = require('electron').remote
const fs = require("fs")
const userDataPath = app.getPath('userData')
const cfg = fs.readFileSync(`${userDataPath}/config.json`)
const cfgObj = JSON.parse(cfg)
let HOST
if (process.env.NODE_ENV == 'development') {
  HOST = 'http://192.168.1.124:10235/api/'
} else {
  if (cfgObj) {
    HOST = `http://localhost:${cfgObj.Base.PortBase+cfgObj.Base.HttpRestPortOffset}/api/`
  }
}
console.log("HOST", HOST)
const VERSION = 'v1/';
const API = {
  host: HOST,
  version: VERSION,
  account: HOST + VERSION + 'account',
  balance: HOST + VERSION + 'balance',
  userspace: HOST + VERSION + 'dsp/client/userspace/',
  getFileList: HOST + VERSION + 'dsp/file/uploadlist/',
  getDownloadFileList: HOST + VERSION + 'dsp/file/downloadlist/',
  transactions: HOST + VERSION + 'transactions/',
  transfer: HOST + VERSION + 'asset/transfer/direct',
  transferlist: HOST + VERSION + 'dsp/file/transferlist',
  upload: HOST + VERSION + 'dsp/file/upload',
  uploadfee: HOST + VERSION + 'dsp/file/uploadfee/',
  download: HOST + VERSION + 'dsp/file/download',
  downloadInfo: HOST + VERSION + 'dsp/file/downloadinfo/',
  delete: HOST + VERSION + 'dsp/file/delete',
  revenue: HOST + VERSION + 'dsp/file/share/revenue',
  income: HOST + VERSION + 'dsp/file/share/income/'
}
module.exports = API;