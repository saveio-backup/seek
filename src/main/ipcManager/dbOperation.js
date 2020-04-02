import {
  ipcMain
} from 'electron'

import {
  UsermetaDB
} from '../dbs/index_levelup';
ipcMain.on('initUsermetaDB', (event, subDirname) => {
  if ((!global.usermetaDB) || global.usermetaDB.subDirname != subDirname) {
    global.usermetaDB && global.usermetaDB.close();
    try {
      global.usermetaDB = new UsermetaDB(subDirname);
      global.usermetaDB.initDB(() => {
        event.returnValue = 'Done';
      });
    } catch (error) {
      event.returnValue = 'Done';
    }
  } else {
    // no Need init there has been init in main process
    event.returnValue = 'Done';
  }

})
ipcMain.on('getUsermeta', (event, key) => {
  if (!global.usermetaDB) {
    event.returnValue = null;
    return;
  }
  global.usermetaDB.queryData(key).then(async (res) => {
    event.returnValue = res;
  }).catch(err => {
    event.returnValue = null;
  })
})

ipcMain.on('setUsermeta', (event, key, value) => {
  global.usermetaDB && global.usermetaDB.updateData(key, value).then(async () => {
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
  global.HistoryDB.getList().then(async (res) => {
    // console.log('HistoryDB')
    // console.log(res)
    event.returnValue = res;
  }).catch(err => {
    event.returnValue = [];
  })
});