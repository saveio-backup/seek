/* import {
  verbose as sqlite3
} from 'sqlite3'
// const sqlite3 = require('sqlite3').verbose();
import {
  app
} from 'electron'
import path from 'path'
console.log('verbose is');
console.log(new sqlite3().Database('fff'))
const profile = path.join(app.getAppPath, 'Profile');
const db = new sqlite3.verbose().Database('Profile');
db.serialize(() => {
  db.run('CREATE TABLE seekTest')
  // add('ridesky', 'thisnote')
})


function add(author, note, callback) {
  db.run("INSERT INTO notes (ts, author, note) " +
    "VALUES (?, ?, ?);",
    [new Date(), author, note],
    function (error) {
      if (error) {
        util.log('FAIL on add ' + error);
        callback(error);
      } else {
        callback(null);
      }
    });
}
module.exports = {
  add
} */