/* import sqlite3 from 'sqlite3'
import {
  app
} from 'electron'
import path from 'path'
const profile = path.join(app.getAppPath, 'Profile');
const db = new sqlite3.verbose().Database(profile);
db.serialize(()=>{
  db.run('CREATE TABLE browser')
}) */