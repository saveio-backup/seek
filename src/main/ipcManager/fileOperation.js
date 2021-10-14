import {
  ipcMain,
  dialog
} from 'electron'
import fs from 'fs';
import path from 'path';

// File operation
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    filters: [{
      name: 'Text Type',
      extensions: ['dat', 'txt', 'text']
    }],
    properties: ['openFile']
  }).then((files) => {
    if (files.filePaths) {
      const contents = fs.readFileSync(files.filePaths[0], 'utf-8');
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
  }).then((files) => {
    if (files.filePaths) {
      const contents = fs.readFileSync(files.filePaths[0], 'utf-8');
      event.sender.send('selected-wallet', contents)
    }
  })
})
ipcMain.on('export-file-dialog', (event, contents, defaultName) => {
  const option = {
    title: 'Export your file',
    defaultPath: `${defaultName}.dat`
  }
  dialog.showSaveDialog(option).then((filename) => {
    if (!filename) return;
    if (!filename.filePath.endsWith('.dat')) {
      filename.filePath = filename.filePath + '.dat'
    }
    fs.writeFileSync(filename.filePath, contents, 'utf-8');
    event.sender.send('export-finished');
  })
})
ipcMain.on('upload-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'treatPackageAsDirectory', 'multiSelections']
  }).then((files) => {
    if (files.filePaths) {
      let arr = [];
      for (let value of files.filePaths) {
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

ipcMain.on('will-set-dir', (event) => {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then((dir) => {
    if (dir.filePaths) {
      event.sender.send('did-set-dir', dir.filePaths[0]);
    }
  })
})