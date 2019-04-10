const {
  ipcMain,
  dialog
} = require('electron')
ipcMain.on('export-wallet-dialog', (event, contents) => {
  const option = {
    title: 'Export your Wallet',
    defaultPath: 'wallet.dat'
  }
  dialog.showSaveDialog(option, (filename) => {
    if (!filename) return;
    require('fs').writeFileSync(filename, contents, 'utf-8');
  })
})