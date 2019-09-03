import {
  ipcMain,
  dialog
} from 'electron'
import {
  SeekDB
} from '../dbs/index';
import fs from 'fs';
import path from 'path';
const seekDB = new SeekDB();
seekDB.getDB();

// File operation
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    filters: [{
      name: 'Text Type',
      extensions: ['dat', 'txt', 'text']
    }],
    properties: ['openFile']
  }, (files) => {
    if (files) {
      const contents = fs.readFileSync(files[0], 'utf-8');
      event.sender.send('selected-file', contents)
    }
  })
})
ipcMain.on('open-wallet-dialog', (event) => {
  dialog.showOpenDialog({
    filters: [{
      name: 'Text Type',
      extensions: ['dat', 'txt', 'text']
    }],
    properties: ['openFile']
  }, (files) => {
    if (files) {
      const contents = fs.readFileSync(files[0], 'utf-8');
      event.sender.send('selected-wallet', contents)
    }
  })
})
ipcMain.on('export-file-dialog', (event, contents, defaultName) => {
  const option = {
    title: 'Export your file',
    defaultPath: `${defaultName}.dat`
  }
  dialog.showSaveDialog(option, (filename) => {
    if (!filename) return;
    fs.writeFileSync(filename, contents, 'utf-8');
    event.sender.send('export-finished');
  })
})
ipcMain.on('upload-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'treatPackageAsDirectory', 'multiSelections']
  }, (files) => {
    if (files) {
      let arr = [];
      for (let value of files) {
        const fileName = path.basename(value)
        const filePath = value;
        let fileBytes = fs.statSync(filePath).size;
        arr.push({
          fileName,
          filePath,
          fileBytes
        })
      }
      event.sender.send('selected-upload', {
        files: arr
      })
    }
  })
})


// seekDB
ipcMain.on('getAllSettings', event => {
  seekDB.querySettings('All').then(res => {
    event.returnValue = res;
  })
})
ipcMain.on('getSettings', (event, key) => {
  seekDB.querySettings(key).then(res => {
    event.returnValue = res;
  })
})
ipcMain.on('updateSettings', (event, key, value) => {
  console.log('key', key);
  console.log('value', value);
  seekDB.updateSettings(key, value).then(() => {
    event.returnValue = {
      status: true
    };
  }).catch((reject) => {
    event.returnValue = {
      status: false,
      msg: reject
    };
  })
})