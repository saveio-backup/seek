import {
  app,
  protocol
} from 'electron'
import levelup from 'levelup';
import leveldown from 'leveldown';
import path from 'path'
import fs from 'fs';
import uuid from "node-uuid";
import {
  DEFAULT_CHAINID
} from '../windowManager/defaultOption';
const DEFAULT_USERSUMMARY_CONFIG = {
  Usermeta: {
    type: 'JSON',
    value: {
      Label: '',
      Address: '',
      DNSAddress: '',
      PublicKey: '',
      Plugins: [],
      LocalUrlPlugins: {}
    },
    modify: true
  },
  Settings: { // default setting
    type: 'JSON',
    value: {
      currentAddress:'',
      console: false,
      devEdgeEnable: false,
      maxNumUpload: 5,
      maxPeerNum: 20,
      ChainId: DEFAULT_CHAINID,
      lang: 'en',
      themeColor: 'dark'
    },
    modify: true
  },
  HistoryRecord: {
    type: 'JSON',
    value: {
      visits: []
    },
    modify: true
  },
  Version: {
    type: 'JSON',
    value: {
      frontVersion: '0.0.0-0'
    },
    modify: true
  }
}

let g_seekLevelDB = path.join(app.getPath("appData"), app.getName(), "seekLevelDB");

class SeekLevelDB {
  constructor(dbName, subDirname) {
    subDirname = subDirname || '';
    initDir(subDirname, dbName);
    const dbPath = path.join(g_seekLevelDB, subDirname, dbName);
    this.subDirname = subDirname; // set User wallet Address as dirname
    this.db = levelup(leveldown(dbPath), (err) => {
      if (err) {
        console.log('level failed!!');
        console.log(err);
      } else {
        console.log('level success!');
      }
    });
    // try {
    //   this.db = levelup(leveldown(dbPath))
    // } catch (error) {
    //   console.log('level error');
    //   throw (error);
    // }
  }

  updateData(key, value) {
    return new Promise((resolve, reject) => {
      this.db.put(key, JSON.stringify(value), (err) => {
        if (err) {
          reject('Update Failed');
        } else {
          resolve('OK');
        }
      })
    })
  }

  queryData(key) {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) {
          if (err.notFound) {
            reject('Key NotFound');
          }
        } else {
          resolve(JSON.parse(value));
        }
      })
    })
  }

  getAllData() {
    return new Promise((resolve, reject) => {
      const kvLists = {};
      this.db.createReadStream({
          key: true,
          value: true
        })
        .on('data', (data) => {
          kvLists[data.key.toString()] = JSON.parse(data.value);
        }).on('end', () => {
          resolve(kvLists);
        }).on('error', (err) => {
          reject(err);
        })
    })
  }
  close() {
    return new Promise((resolve, reject) => {
      this.db.close(() => {
        console.log('level close!!');
        resolve('I am closed');
      });
    })
  }
}

class UsermetaDB extends SeekLevelDB {
  constructor(subDirname) {
    super('Usermeta', subDirname);
  }

  initDB(callback) {
    const keyLists = {};
    this.db.createKeyStream()
      .on('data', (key) => {
        keyLists[key.toString()] = true;
      }).on('end', () => {
        for (const item in DEFAULT_USERSUMMARY_CONFIG.Usermeta.value) {
          if (!keyLists.hasOwnProperty(item)) {
            console.log('keyLists has no item: ', item);
            this.updateData(item, DEFAULT_USERSUMMARY_CONFIG.Usermeta.value[item]);
          }
        }
        callback && callback();
      })
  }
}
class SettingDB extends SeekLevelDB {

  constructor() {
    super('Setting');
  }

  initDB(callback) {
    const keyLists = {};
    this.db.createKeyStream()
      .on('data', (key) => {
        keyLists[key.toString()] = true;
      }).on('end', () => {
        for (const item in DEFAULT_USERSUMMARY_CONFIG.Settings.value) {
          if (!keyLists.hasOwnProperty(item)) {
            console.log('keyLists has no item: ', item);
            this.updateData(item, DEFAULT_USERSUMMARY_CONFIG.Settings.value[item]);
          }
        }
        callback && callback();
      })
  }
}
class HistoryDB extends SeekLevelDB {

  constructor(callback) {
    super('History');
  }

  initDB(callback) {
    const keyLists = {};
    this.db.createKeyStream()
      .on('data', (key) => {
        keyLists[key.toString()] = true;
      }).on('end', () => {
        for (const item in DEFAULT_USERSUMMARY_CONFIG.HistoryRecord.value) {
          if (!keyLists.hasOwnProperty(item)) {
            this.updateData(item, DEFAULT_USERSUMMARY_CONFIG.HistoryRecord.value[item]);
          }
        }
        callback && callback();
      })
  }

  getList({
    offset,
    limit
  }) {
    const vm = this;
    console.log('offset, limit');
    // console.log(offset, '===============',limit);
    return vm.queryData('visits').then(list => {
      // if(Object.prototype.toString().call(list) !== '[Object Array]') resolve([]);
      let resLimit = (list.length - offset) > limit ? limit : (list.length - offset)
      let res = list.splice(offset, resLimit);
      return res;
    });
  }

  add({
    timestamp = (new Date()).getTime(),
    title = '--',
    href = '',
    src = ''
  }) {
    const vm = this;
    console.log('add history')
    // console.log(timestamp)
    // console.log(title)
    // console.log(href)
    vm.queryData('visits').then(list => {
      list.unshift({
        timestamp,
        title,
        href,
        src,
        id: uuid.v4()
      });
      vm.updateData('visits', list);
    })
  }

  deleteByIds() {

  }
}
class VersionDB extends SeekLevelDB {

  constructor() {
    super('Version');
  }

  initDB(callback) {
    const keyLists = {};
    this.db.createKeyStream()
      .on('data', (key) => {
        keyLists[key.toString()] = true;
      }).on('end', () => {
        for (const item in DEFAULT_USERSUMMARY_CONFIG.Version.value) {
          if (!keyLists.hasOwnProperty(item)) {
            this.updateData(item, DEFAULT_USERSUMMARY_CONFIG.Version.value[item]);
          }
        }
        callback && callback();
      })
  }
}


// create dirctory if not exist
function initDir(...dirname) {
  const subPath = path.join(g_seekLevelDB, ...dirname);
  fs.mkdirSync(subPath, {
    recursive: true
  }, err => {
    console.log('subdirname error');
    console.error(err);
  });

}
export {
  UsermetaDB,
  SettingDB,
  HistoryDB,
  VersionDB
}