const {
  ipcMain,
  dialog
} = require('electron')
const fs = require('fs')
ipcMain.on('open-wallet-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, (files) => {
    if (files) {
      console.log(files);
      const contents = fs.readFileSync(files[0], 'utf-8');
      event.sender.send('selected-wallet', contents)
    }
  })
})