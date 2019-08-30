import {
  ipcMain
} from 'electron'
import AdmZip from 'adm-zip';
import fs from 'fs'
ipcMain.on('string-to-hex', (event, content) => {
  let buf = Buffer.from(content || '');
  buf = buf.toString('hex');
  event.returnValue = buf;
})
ipcMain.on('testUnzip', () => {
  const zip = new AdmZip('/Users/ridesky/Downloads/electron-v5.0.8-darwin-x64.zip')
  zip.extractAllTo('/Users/ridesky/Downloads/electron-v5.0.8-darwin-x64')
  console.log('unzip success');
})