const {
  app
} = require('electron').remote
const fs = require("fs")
const userDataPath = app.getPath('userData')
const exist = fs.existsSync(`${userDataPath}/config.json`)
let HOST = null;
// let HOST = 'http://localhost:10235/api/'
// console.log('userDataPath', userDataPath, exist)
if (exist) {
  const cfg = fs.readFileSync(`${userDataPath}/config.json`)
  if (cfg) {
    const cfgObj = JSON.parse(cfg)
    // console.log('cfgObj', cfgObj)
    if (cfgObj) {
      HOST = `http://localhost:${cfgObj.Base.PortBase + cfgObj.Base.HttpRestPortOffset}/api/`
    }
  }
}
// console.log("HOST", HOST)
const VERSION = 'v1/';
const API = {
  host: HOST,
  version: HOST + VERSION + 'version',
  account: HOST + VERSION + 'account',
  balance: HOST + VERSION + 'balance',
  decrypt: HOST + VERSION + 'dsp/file/decrypt',
  userspace: HOST + VERSION + 'dsp/client/userspace/',
  userspacerecords: HOST + VERSION + 'dsp/client/userspacerecords/',
  getUploadFileInfo: HOST + VERSION + 'dsp/file/upload/info/',
  getFileList: HOST + VERSION + 'dsp/file/uploadlist/',
  getDownloadFileList: HOST + VERSION + 'dsp/file/downloadlist/',
  transactions: HOST + VERSION + 'transactions/',
  transfer: HOST + VERSION + 'asset/transfer/direct',
  transferlist: HOST + VERSION + 'dsp/file/transferlist',
  getfscontractsetting: HOST + VERSION + 'smartcontract/fs/setting',
  upload: HOST + VERSION + 'dsp/file/upload',
  uploadfee: HOST + VERSION + 'dsp/file/uploadfee/',
  download: HOST + VERSION + 'dsp/file/download',
  downloadInfo: HOST + VERSION + 'dsp/file/downloadinfo/',
  delete: HOST + VERSION + 'dsp/file/delete',
  deletes: HOST + VERSION + 'dsp/files/delete',
  revenue: HOST + VERSION + 'dsp/file/share/revenue',
  income: HOST + VERSION + 'dsp/file/share/income/',
  uploadRetry: HOST + VERSION + 'dsp/file/upload/retry',
  downloadRetry: HOST + VERSION + 'dsp/file/download/retry',
  uploadResume: HOST + VERSION + 'dsp/file/upload/resume',
  downloadResume: HOST + VERSION + 'dsp/file/download/resume',
  uploadPause: HOST + VERSION + 'dsp/file/upload/pause',
  downloadPause: HOST + VERSION + 'dsp/file/download/pause',
  uploadCancel: HOST + VERSION + 'dsp/file/upload/cancel',
  downloadCancel: HOST + VERSION + 'dsp/file/download/cancel',
  deleteRecord: HOST + VERSION + 'dsp/file/transferlist/delete',
  withdrawChannel: HOST + VERSION + 'channel/withdraw',
  depositChannel: HOST + VERSION + 'channel/deposit',
  exportPrivateKey: HOST + VERSION + 'account/export/privatekey',
  channel: HOST + VERSION + 'channel',
  channelInitProgress: HOST + VERSION + 'channel/init/progress',
  channelOPen: HOST + VERSION + 'channel/open',
  channelClose: HOST + VERSION + 'channel/close',
  getAllDns: HOST + VERSION + 'dns',
  balancehistory: HOST + VERSION + 'balancehistory',
  channelSync: HOST + VERSION + 'channel/syncing',
  networkStatus: HOST + VERSION + 'network/state',
  reconnect:  HOST + VERSION + 'network/channel/reconnect'
}
module.exports = API;