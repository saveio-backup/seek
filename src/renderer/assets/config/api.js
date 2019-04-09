const HOST = 'http://192.168.1.124:10235/api/'
const VERSION = 'v1/';
const API = {
  host: HOST,
  account: HOST + VERSION + 'account',
  balance: HOST + VERSION + 'balance'
}
module.exports = API;