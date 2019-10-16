import {
  app
} from 'electron'
import {
  DEFAULT_CHAINID
} from '../windowManager/defaultOption';
import path from 'path'
import fs from 'fs';
const sqlite3 = require('sqlite3').verbose();
const DEFAULT_USERSUMMARY_CONFIG = {
  Usermeta: {
    type: 'JSON',
    value: {
      Label: '',
      Address: '',
      DNSAddress: '',
      PublicKey: '',
    },
    modify: true
  },
  Settings: {
    type: 'JSON',
    value: {
      console: false,
      devEdgeEnable: false,
      maxNumUpload: 5,
      ChainId: DEFAULT_CHAINID,
      lang: 'en'
    },
    modify: true
  },
  Config: {
    modify: false,
    type: 'JSON',
    value: {

    }
  }
}
const DB_NAME = 'commonData';
const DEFAULT_TABLE_NAME = 'summary';
let g_seekDB = path.join(app.getPath("appData"), app.getName(), "seekDB");

class SeekDB {
  constructor() {
    this.db = null;
    initDir();
  }

  initDB(callback) {
    this.callback = callback;
    this.db = createDB(DB_NAME, {
      createTableCallback: this.createTable.bind(this, DEFAULT_TABLE_NAME)
    })
  }
  getDB() {
    this.db = getDB(DB_NAME);
  }
  createTable(table = DEFAULT_TABLE_NAME) {
    let sqlStr = null;
    sqlStr = `CREATE TABLE IF NOT EXISTS ${table} 
      (
        Usermeta ${DEFAULT_USERSUMMARY_CONFIG.Usermeta.type},
        Settings ${DEFAULT_USERSUMMARY_CONFIG.Settings.type} 
      )
      `;
    this.db.run(sqlStr, this.insertColumn.bind(this));
  }

  insertColumn(err) {
    if (err) {
      console.log('create faile !!!!')
      console.error(err);
    } else {
      const stmt = this.db.prepare(`INSERT INTO ${DEFAULT_TABLE_NAME} 
        (Usermeta,Settings) SELECT 
        '${JSON.stringify(DEFAULT_USERSUMMARY_CONFIG.Usermeta.value)}',
        '${JSON.stringify(DEFAULT_USERSUMMARY_CONFIG.Settings.value)}'
        WHERE NOT EXISTS (SELECT Usermeta from summary)
        `, (err) => {
        if (err) {
          console.error('create Table error')
          console.error(err);
        }
      });
      stmt.run((err) => {
        if (err) {
          console.error('insert error');
          console.error(err);
        } else {
          Promise.all([this.updateData(null, null, true), this.updateSettings(null, null, true)]).then(res => {
            this.callback && this.callback();
          })
        }
      })
    }

  }

  updateData(key, value, integrate) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT Usermeta FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          resolve('No such column')
        } else {
          let result = JSON.parse(row.Usermeta);
          if (key && value) result[key] = value;
          if (integrate) result = Object.assign(DEFAULT_USERSUMMARY_CONFIG.Usermeta.value, result);
          this.db.run(`UPDATE ${DEFAULT_TABLE_NAME} 
          SET Usermeta = '${JSON.stringify(result)}'
          `, (err, res) => {
            if (err) {
              console.error('UPDATE error');
              console.error(err);
            } else {
              console.log('UPDATE SUCCESS');
            }
          })
          resolve('ok');
        }
      })
    })
  }

  queryData(key) {
    return new Promise((res) => {
      this.db.get(`SELECT Usermeta FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          res('No such column')
        } else {
          if (row && JSON.parse(row.Usermeta)[key]) {
            res(JSON.parse(row.Usermeta)[key]);
          } else if (row) {
            res(DEFAULT_USERSUMMARY_CONFIG.Usermeta.value[key]);
            this.updateData(key, DEFAULT_USERSUMMARY_CONFIG.Usermeta.value[key]);
          }
        }
      })
    })
  }

  updateSettings(key, value, integrate) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT Settings FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          reject('Setting failed. There is no such filed.')
        } else {
          let result;
          let settingsValue = JSON.parse(row.Settings);
          if (key && (value != undefined)) {
            settingsValue[key] = value;
          }
          if (integrate) {
            result = Object.assign(DEFAULT_USERSUMMARY_CONFIG.Settings.value, settingsValue);
          } else {
            result = settingsValue;
          }
          this.db.run(`UPDATE ${DEFAULT_TABLE_NAME} 
          SET Settings = '${JSON.stringify(result)}'
          `, (err, res) => {
            if (err) {
              console.error('UPDATE error');
              console.error(err);
              reject(err);
            } else {
              console.log('UPDATE SUCCESS');
            }
          })
          resolve('ok');
        }
      })
    })
  }

  querySettings(key) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT Settings FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          reject('No such column')
        } else if (err) {
          reject(err);
        } else {
          if (row && (key === 'All')) {
            resolve(JSON.parse(row.Settings));
          } else if (row && (key in JSON.parse(row.Settings))) {
            resolve(JSON.parse(row.Settings)[key])
          } else if (row) {
            resolve(DEFAULT_USERSUMMARY_CONFIG.Settings.value[key]);
            this.updateSettings(key, DEFAULT_USERSUMMARY_CONFIG.Settings.value[key])
          }
        }
      })
    })
  }

  updatedColumn(table) {
    const columns = {};
    this.db.all(`PRAGMA table_info(${table})`, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        for (let i = 0; i < res.length; i++) {
          columns[res[i]['name']] = true
        }
        for (const key in DEFAULT_USERSUMMARY_CONFIG) {
          if (!columns[key]) {
            alterColumn(this.db, table, key, DEFAULT_USERSUMMARY_CONFIG[key].type, DEFAULT_USERSUMMARY_CONFIG[key].value)
          }
        }
      }
    })
  }

  closeDb() {
    this.db.close();
  }
}

// create dirctory if not exist
function initDir(subDirname) {
  fs.mkdirSync(g_seekDB, {
    recursive: true
  }, err => {
    console.error(err);
  });
  if (subDirname) {
    const subPath = path.join(g_seekDB, subDirname);
    fs.mkdirSync(subPath, {
      recursive: true
    }, err => {
      console.error(err);
    });
  }
}

function createDB(DBName, config) {
  const dbPath = path.join(g_seekDB, DBName, config.subDirname || '');
  return new sqlite3.Database(dbPath, config.createTableCallback, (err) => {
    err && console.error(err)
  })
}

function getDB(DBName, config) {
  const dbPath = path.join(g_seekDB, DBName, config ? config.subDirname || '' : '');
  return new sqlite3.Database(dbPath, (err) => {
    err && console.error(err)
  })
}

export {
  SeekDB
}