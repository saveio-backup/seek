import {
  app
} from 'electron'
import levelup from 'levelup';
import leveldown from 'leveldown';
import path from 'path'
import fs from 'fs';


let g_baseDB = path.join(app.getPath("appData"), app.getName(), "seekLevelDB", "baseDB");

class BaseDB {

  /**
   * @param  {string} dbName
   *         set dataBase name 
   * 
   * @param {string} subDirname
   *        add Subdirectory in current directory
   */

   
  constructor(dbName, subDirname) {

    subDirname = subDirname || '';
    this.dbName = dbName;
    this.subDirname = subDirname; // set User wallet Address as dirname

  }


  /**
   *  Start the database instead of initializing 
   */


  startDB() {

    this.initDir(this.subDirname, this.dbName);
    const dbPath = path.join(g_baseDB, subDirname, dbName);
    this.db = levelup(leveldown(dbPath), (err) => {
      if (err) {
        console.log('level failed!!');
        console.log(err);
      } else {
        console.log('level success!');
      }
    });

  }


  /**
   * 
   * @param {string} key 
   * 
   * @param {any} value 
   * 
   */


  updateData(key, value) {


    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject("Please initDB before you operate it")
      };
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
      if (!this.db) {
        reject("Please initDB before you operate it")
      };
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
      if (!this.db) {
        reject("Please initDB before you operate it")
      };
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
      if (!this.db) {
        reject("Please initDB before you operate it")
      };
      this.db.close(() => {
        console.log('level close!!');
        resolve('I am closed');
      });
    })

  }


  /**
   * 
   * create dirctory if not exist
   * 
   * @param  {...string} dirname 
   *         The directory hierarchy to be built under the g_baseDB directory 
   * 
   */


  initDir(...dirname) {

    const subPath = path.join(g_baseDB, ...dirname);
    fs.mkdirSync(subPath, {
      recursive: true
    }, err => {
      console.log('subdirname error');
      console.error(err);
    });

  }

}

export default BaseDB;