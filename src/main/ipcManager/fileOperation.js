import {
  ipcMain,
  dialog
} from 'electron'
import fs from 'fs';
import path from 'path';


// File operation
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
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
    properties: ['openFile']
  }, (files) => {
    if (files) {
      const fileName = path.basename(files[0])
      const filePath = files[0];
      let fileBytes = fs.statSync(filePath).size;
      event.sender.send('selected-upload', {
        fileBytes,
        fileName,
        filePath
      })
    }
  })
})