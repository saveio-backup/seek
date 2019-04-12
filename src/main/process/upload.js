import {
  ipcMain,
  dialog
} from 'electron'
import fs from 'fs'
import path from 'path';
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