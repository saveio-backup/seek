import {
  ipcMain
} from 'electron'
ipcMain.on('string-to-hex', (event, content) => {
  console.log('string-to-hex');
  console.log(content);
  let buf = Buffer.from(content);
  buf = buf.toString('hex');
  event.returnValue = buf;
})