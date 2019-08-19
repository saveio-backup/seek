import {
  app,
  protocol
} from 'electron'
import {
  getCurrentView
} from '../windowManager/index'
import fs from 'fs';
import path from 'path';
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
// const host = process.env.NODE_ENV === 'development' ?
//   `http://localhost:9080/#/` :
//   `file://${__dirname}/index.html#/`
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
  getCurrentView.webContents.reload();
  getCurrentView.loadURL(url)
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