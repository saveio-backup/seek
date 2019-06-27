import {
  ipcMain,
  dialog
} from 'electron'

import { dialogViewObj } from './../windowManager/index'

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


ipcMain.on('open-info-dialog', (event, {title="success",info}) => {
  // dialogViewObj.removeBrowserView();
  const options = {
    type: 'info',
    title: title,
    message: info,
  }
  dialog.showMessageBox(options, function (index) {
  })
})