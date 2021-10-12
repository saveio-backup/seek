import {
  ipcMain
} from 'electron'

import {
  UsermetaDB,
  HistoryDB
} from '../dbs/index_levelup';


/**
 * 
 * @param {string} dbVarName 
 *        dataBase variable name "remote.global". (eg:'usermetaDB, historyDB)
 * @param {string} subDirname
 *        Subdirectory in current directory. (Usually using a wallet address)
 * @param {SeekLevelDB} DB 
 *         Database subclass inherited from SeekLevelDB 
 * 
 */

const reInitDB = (dbVarName, subDirname, DB) => {

  return new Promise((reslove, reject) => {
    if ((!global[dbVarName]) || global[dbVarName].subDirname != subDirname) {
      global[dbVarName] && global[dbVarName].close();
      try {
        global[dbVarName] = new DB(subDirname);
        global[dbVarName].initDB(() => {
          reslove('Done');
        });
      } catch (error) {
        reslove('Done');
      }
    } else {
      // no Need init there has been init in main process
      reslove('Done');
    }
  })

}


ipcMain.on('initUsermetaDB', async (event, subDirname) => {

  await reInitDB('usermetaDB', subDirname, UsermetaDB);
  await reInitDB('HistoryDB', subDirname, HistoryDB);
  event.returnValue = 'Done';

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