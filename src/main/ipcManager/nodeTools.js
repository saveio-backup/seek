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
ipcMain.on('hex-to-string', (event, content) => {
  let buf = Buffer.from(content || '', 'hex');
  buf = buf.toString('utf-8');
  event.returnValue = buf;
})