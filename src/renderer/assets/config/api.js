const HOST = 'http://192.168.1.124:10235/api/'
const VERSION = 'v1/';
const API = {
  host: HOST,
  version: VERSION,
  account: HOST + VERSION + 'account',
  balance: HOST + VERSION + 'balance',
  userspace: HOST + VERSION + 'dsp/client/userspace/',
  getFileList: HOST + VERSION + 'dsp/file/uploadlist/',
  getDownloadFileList: HOST + VERSION + 'dsp/file/downloadlist/',
  transactions:HOST+VERSION + 'transactions/',
  transfer:HOST +VERSION + 'asset/transfer/direct',
  transferlist: HOST + VERSION + 'dsp/file/transferlist',
  upload: HOST + VERSION + 'dsp/file/upload',
  download: HOST + VERSION + 'dsp/file/download'
}
module.exports = API;