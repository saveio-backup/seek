const {
  app
} = require('electron').remote
const fs = require("fs")
const userDataPath = app.getPath('userData')
const exist = fs.existsSync(`${userDataPath}/config.json`)
let HOST = 'http://localhost:10235/api/'
console.log('userDataPath', userDataPath, exist)
if (exist) {
  const cfg = fs.readFileSync(`${userDataPath}/config.json`)
  if (cfg) {
    const cfgObj = JSON.parse(cfg)
    console.log('cfgObj', cfgObj)
    if (cfgObj) {
      HOST = `http://localhost:${cfgObj.Base.PortBase + cfgObj.Base.HttpRestPortOffset}/api/`
    }
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
  income: HOST + VERSION + 'dsp/file/share/income/',
  withdrawChannel: HOST + VERSION + 'channel/withdraw',
  depositChannel: HOST + VERSION + 'channel/deposit'
}
module.exports = API;