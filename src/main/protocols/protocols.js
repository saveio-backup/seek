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
  // callback({
  //   url: domain,
  //   method: 'GET',
  //   uploadData: {
  //     contentType: 'text/html'
  //   }
  // });
}

function seekStreamProtocol(request, callback) {
  console.log('seek stream!!!!');
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  }
  const url = request.url.replace('seek://', `${host}`);
  // const url = path.join(__dirname, 'helloworld/hello.html');
  getCurrentView.webContents.reload();
  getCurrentView.loadURL(url)
  // callback({
  //   statusCode: '200',
  //   headers,
  //   path: url
  //   // data: fs.createReadStream(url)
  // })
}

function saveStreamProtocol(request, callback) {
  // todo  download process
  const urlFormat = new URL(request.url);
  console.log('urlFormat is');
  console.log(urlFormat);
  const {
    protocol,
    host,
    search,
    hash
  } = urlFormat;
  const pathname = (urlFormat.pathname === '/' || urlFormat.pathname === '') ? '/index.html' : urlFormat.pathname;
  /*   const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    } */
  getCurrentView.browserWindow.webContents.send('will-load-thirdpage', protocol + `//${host}`)
  ipcMain.once('load-third-page', (event, result) => {
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
  ipcMain.once('loadErrorPage', () => {
    callback({
      method: 'get',
      path: path.join(__static, 'html/failed/failed.html')
    })
  })
}