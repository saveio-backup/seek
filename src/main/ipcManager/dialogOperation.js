import {
  ipcMain,
  dialog
} from 'electron'
import packageJson from '../../../package.json';
import {
  dialogViewObj
} from './../windowManager/index'

ipcMain.on('run-dialog-event', (event, result) => {
  // dialogViewObj.loadUrl(url);
  dialogViewObj.runDialogEvent(result);
})

// File operation
ipcMain.on('dialog-open', (event, selector) => {
  // dialogViewObj.loadUrl(url);
  dialogViewObj.setMenuSelector(selector);
  dialogViewObj.addBrowserView();
})

// File operation
ipcMain.on('dialog-close', (event) => {
  dialogViewObj.removeBrowserView();
})

ipcMain.on('showVersion', (event, info) => {
  // let version = localStorage.getItem('edgeVersion');
  const message = `Seeker Version: ${packageJson.version}
Edge Version: ${info}`
  dialog.showMessageBox({
    title: 'About',
    type: 'info',
    message: message
  });
})

ipcMain.on('open-info-dialog', (event, {
  title = "success",
  info
}) => {
  // dialogViewObj.removeBrowserView();
  const options = {
    type: 'info',
    title: title,
    message: info,
  }
  dialog.showMessageBox(options, function (index) {})
})