const {
  ipcMain,
  dialog
} = require('electron');
const fs = require('fs');
ipcMain.on('export-wallet-dialog', (event, contents) => {
  const option = {
    title: 'Export your Wallet',
    defaultPath: 'wallet.dat'
  }
  dialog.showSaveDialog(option, (filename) => {
    if (!filename) return;
    fs.writeFileSync(filename, contents, 'utf-8');
    event.sender.send('export-finished');
  })
})