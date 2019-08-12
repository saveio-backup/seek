// import {
//   app
// } from 'electron'
// import log from 'electron-log'
// import path from 'path'
// import fs from 'fs';
// const sqlite3 = require('sqlite3').verbose();
// const DEFAULT_CONFIG = {
//   dbName: 'userData',
// }
// let db;
// let seekDB;

// function createDB() {
//   const profile = path.join(seekDB, "Profile");
//   db = new sqlite3.Database(profile, createTable);
// }

// function createTable() {
//   db.run(`CREATE TABLE IF NOT EXISTS student (
//     name varchar(32),
//     sex boolean
//     )`, (err) => {
//     if (err) return;
//   })
// }
// const dbContainer = [];
// initDir();
// // create dirctory if not exist
// function initDir() {
//   seekDB = path.join(app.getPath("appData"), app.getName(), "seekDB");
//   fs.mkdirSync(seekDB, {
//     recursive: true
//   }, err => {
//     log.error(err);
//   });
//   createDB();
// }
// class DBStore {
//   constructor(filename = 'userData') {
//     this.db = null;
//     this.createDB(filename);
//   }
//   createDB(filename) {
//     const dbPath = path.join(seekDB, filename);
//     this.db = new sqlite3.Database(dbPath, this.createTable, (err) => {
//       if (err) {
//         log.error(err)
//       }
//     })
//   }

// }
// export function queryRows(table, column, value) {
//   db.get(`SELECT ? FROM ? WHERE column == ?`, [column, table, value], (err, row) => {
//     if (err) {
//       console.error('queryRows!!');
//       console.error(err);
//     } else {
//       console.log('queryRows is ');
//       console.log(row);
//     }
//   })
// }

// function alterColumn(table, column, value) {
//   db.run(`ALTER TABLE ? ADD ? varchar(32)`, [table, column], (err) => {
//     if (err) return;
//     insertRows(table, column, value)
//   });
// }
// export function insertRows(table, column, value) {
//   db.run(`INSERT INTO ? 
//   (?) 
//   VALUES(?)`, [table, column, value], (err) => {});
//   closeDb();
// }

// export function closeDb() {
//   db.close();
// }