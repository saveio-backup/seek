import {
  app
} from 'electron'
import path from 'path'
import fs from 'fs';

const sqlite3 = require('sqlite3').verbose();
const DEFAULT_USERSUMMARY_CONFIG = {
  Usermeta: {
    type: 'JSON',
    value: {
      Label: '',
      Address: 'newAddr',
      DNSAddress: '',
      PublicKey: '',
    },
    modify: true
  },
  Settings: {
    type: 'JSON',
    value: {
      console: true,
      devEdgeEnable: false
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
let g_seekDB;

class SeekDB {
  constructor() {
    this.db = null;
  }

  initDB(callback) {
    initDir();
    this.callback = callback;
    this.db = createDB(DB_NAME, {
      createTableCallback: this.createTable.bind(this, DEFAULT_TABLE_NAME)
    })
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
          this.callback();
        }
      })
    }

  }

  updateData(key, value) {
    return new Promise(res => {
      this.db.get(`SELECT Usermeta FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          res('No such column')
        } else {
          const result = JSON.parse(row.Usermeta);
          result[key] = value;
          this.db.run(`UPDATE ${DEFAULT_TABLE_NAME} 
          SET Usermeta = '${JSON.stringify(result)}'
          `, (err, res) => {
            if (err) {
              console.error('UPDATE error');
              console.error(err);
            } else {
              console.log('UPDATE SUCCESS');
              console.log(res);
            }
          })
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
          if (row) {
            res(JSON.parse(row.Usermeta)[key]);
          } else {
            res('')
          }
        }
      })
    })
  }

  updateSettings(key, value) {
    return new Promise(res => {
      this.db.get(`SELECT Settings FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          res('No such column')
        } else {
          const result = JSON.parse(row.Settings);
          result[key] = value;
          this.db.run(`UPDATE ${DEFAULT_TABLE_NAME} 
          SET Settings = '${JSON.stringify(result)}'
          `, (err, res) => {
            if (err) {
              console.error('UPDATE error');
              console.error(err);
            } else {
              console.log('UPDATE SUCCESS');
              console.log(res);
            }
          })
        }
      })
    })
  }

  querySettings(key) {
    return new Promise((res) => {
      this.db.get(`SELECT Settings FROM ${DEFAULT_TABLE_NAME}`, (err, row) => {
        if (err && (err.toString().indexOf('no such column') >= 0)) {
          res('No such column')
        } else {
          if (row) {
            res(JSON.parse(row.Settings)[key]);
          } else {
            res('')
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
  g_seekDB = path.join(app.getPath("appData"), app.getName(), "seekDB");
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

export {
  SeekDB
}