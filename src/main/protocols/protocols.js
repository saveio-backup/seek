import {
  app,
  protocol,
  ipcMain
} from 'electron'
import {
  getCurrentView,
  getActive
} from '../windowManager/index'
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import failedPage from '../../../static/html/failed/failed.js';
import dnsErrorPage from '../../../static/html/failed/dnsError.js';
const log = require('electron-log')
protocol.registerSchemesAsPrivileged([{
  scheme: 'seek',
  privileges: {
    standard: true,
    secure: true,
    allowServiceWorkers: true,
    supportFetchAPI: true,
    corsEnabled: true
  }
}]);
protocol.registerSchemesAsPrivileged([{
  scheme: 'oni',
  privileges: {
    standard: true,
    secure: true,
    allowServiceWorkers: true,
    supportFetchAPI: true,
    corsEnabled: true
  }
}]);
const host = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080/#/` :
  `file://${__dirname}/index.html#/`
app.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    protocol.registerHttpProtocol('seek', seekHttpProtocol, err => {
      if (err) throw new Error('Failed to create protocol: seek. ' + err)
    });
  } else {
    protocol.registerFileProtocol('seek', seekStreamProtocol, err => {
      if (err) throw new Error('Failed to create protocol: seek. ' + err)
    })
  }
  protocol.registerFileProtocol('oni', saveStreamProtocol, err => {
    if (err) throw new Error('Failed to create protocol: seek. ' + err)
  })
})
// app.on('ready', () => {
//   protocol.registerStreamProtocol('seek', seekStreamProtocol, err => {
//     if (err) throw new Error('Failed to create protocol: seek. ' + err)
//   })
// })

function seekHttpProtocol(request, callback) {
  console.log('seekProtocol!!!!');
  // console.log(request);
  const url = request.url.replace('seek://', `${host}`);
  console.log('url now is : ', url);
  getActive(getCurrentView.browserWindow).webContents.reload();
  getActive(getCurrentView.browserWindow).loadURL(url)
}

function seekStreamProtocol(request, callback) {
  console.log('seek stream!!!!');
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  }
  const url = request.url.replace('seek://', `${host}`);
  getCurrentView.webContents.reload();
  getCurrentView.loadURL(url)
}

function saveStreamProtocol(request, callback) {
  // todo  download process
  const urlFormat = new URL(request.url);
  const {
    protocol,
    host,
    search,
    hash
  } = urlFormat;
  const pathname = (urlFormat.pathname === '/' || urlFormat.pathname === '') ? '/index.html' : urlFormat.pathname;
  console.log(`will-load-thirdpage ${host}`)
  getCurrentView.browserWindow.webContents.send('will-load-thirdpage', protocol + `//${host}`)
  ipcMain.once('load-third-page', (event, result) => {
    console.log('load-third-page!!!');
    try {
      const zip = new AdmZip(result)
      const parse = path.parse(result);
      zip.extractAllTo(path.join(parse.dir));
      callback({
        method: 'get',
        path: path.join(parse.dir, parse.name, pathname)
      })
    } catch (error) {
      console.error(error)
    }
  })
  ipcMain.once('loadErrorPage', (event, ErrorCode) => {
    console.log('loadErrorPage!!!');
    callback({
      method: 'get',
      path: path.join(__static, 'html/failed/blank.html')
    })
    getActive(getCurrentView.browserWindow).webContents.executeJavaScript(`document.documentElement.innerHTML = '${dnsErrorPage('',ErrorCode,'')}' `)
  })
}