import {
  ipcMain
} from 'electron'


// usermetaDB
ipcMain.on('getUsermeta', (event, key) => {
  global.usermetaDB.queryData(key).then(async (res) => {
    event.returnValue = res;
  }).catch(err => {
    event.returnValue = null;
  })
})

ipcMain.on('setUsermeta', (event, key, value) => {
  global.usermetaDB.updateData(key, value).then(async () => {
    event.returnValue = {
      status: true
    };
  }).catch(async (reject) => {
    event.returnValue = {
      status: false,
      msg: reject
    };
  })
})

// settingDB
ipcMain.on('getAllSettings', event => {
  global.settingDB.getAllData().then(async (res) => {
    event.returnValue = res;
  }).catch(err => {
    event.returnValue = null;
  })
})
ipcMain.on('getSettings', (event, key) => {
  global.settingDB.queryData(key).then(async (res) => {
    event.returnValue = res;
  }).catch(err => {
    event.returnValue = null;
  })
})
ipcMain.on('updateSettings', (event, key, value) => {
  global.settingDB.updateData(key, value).then(async () => {
    event.returnValue = {
      status: true
    };
  }).catch(async (reject) => {
    event.returnValue = {
      status: false,
      msg: reject
    };
  })
})
//historyDB
ipcMain.on('getListHistory', (event, params) => {
  global.HistoryDB.getList(params).then(async (res) => {
    // console.log('HistoryDB')
    // console.log(res)
    event.returnValue = res;
  }).catch(err => {
    event.returnValue = [];
  })
});
