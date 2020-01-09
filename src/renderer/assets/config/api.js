const {
  app
} = require('electron').remote;
import {
  ipcRenderer
} from 'electron';
import {
  DEFAULT_CHAINID
} from '../../../main/windowManager/defaultOption';

const fs = require("fs");
const userDataPath = app.getPath('userData');
const chainId = ipcRenderer.sendSync('getSettings', 'ChainId');
let HOST = null;
const exist = fs.existsSync(`${userDataPath}/config-${chainId}.json`);
if (exist) { // chainid.json   exist
  const cfg = fs.readFileSync(`${userDataPath}/config-${chainId}.json`);
  if (cfg) {
    const cfgObj = JSON.parse(cfg);
    if (cfgObj) {
      HOST = `http://localhost:${cfgObj.Base.PortBase + cfgObj.Base.HttpRestPortOffset}/api/`;
    }
  }
} else { // not exist!!
  try {
    const result = ipcRenderer.sendSync("updateSettings", 'ChainId', DEFAULT_CHAINID);
    const cfg = fs.readFileSync(`${userDataPath}/config-${DEFAULT_CHAINID}.json`);
    if (cfg) {
      const cfgObj = JSON.parse(cfg);
      if (cfgObj) {
        HOST = `http://localhost:${cfgObj.Base.PortBase + cfgObj.Base.HttpRestPortOffset}/api/`;
      }
    }
  } catch (err) {}
}

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
  transferDetail: HOST + VERSION + 'dsp/file/transfer/detail',
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
  channelSwitch: HOST + VERSION + 'channel/switch',
  getAllDns: HOST + VERSION + 'dns',
  getCurrentChannel: HOST + VERSION + 'channel/current',
  balancehistory: HOST + VERSION + 'balancehistory',
  channelSync: HOST + VERSION + 'channel/syncing',
  networkStatus: HOST + VERSION + 'network/state',
  reconnect: HOST + VERSION + 'network/channel/reconnect',
  chainId: HOST + VERSION + 'chainid',
  switchChainId: HOST + VERSION + 'chainid/switch',
  getchainidlist: HOST + VERSION + 'chainid/list',
  invokeContract: HOST + VERSION + 'smartcontract/invoke',
  preexecContract: HOST + VERSION + 'smartcontract/preexec',
  checkPassword: HOST + VERSION + 'account/password/check',
  config: HOST + VERSION + 'config',
  dspFilePeersCount: HOST + VERSION + 'dsp/file/peers/count',
  login: HOST + VERSION + 'account/login',
  getHashByUrl: HOST + VERSION + 'dns/hash',
  dspFilesDeletefee: HOST + VERSION + 'dsp/files/deletefee'
}
export default API;