import {
  app,
  protocol,
  ipcMain
} from 'electron'
import {
  getCurrentView,
  getActive
} from '../windowManager/index'
import path from 'path';
import AdmZip from 'adm-zip';
import dnsErrorPage from '../../../static/html/failed/dnsError.js';
import uuid from 'node-uuid';
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

function seekHttpProtocol(request, callback) {
  console.log('seekProtocol!!!!');
  const url = request.url.replace('seek://', `${host}`);
  console.log('url now is : ', url);
  getActive(getCurrentView.browserWindow).webContents.reload();
  getActive(getCurrentView.browserWindow).loadURL(url)
}

function seekStreamProtocol(request, callback) {
  console.log('seek stream!!!!');

  /* const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  } */

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

  const thirdpageUid = uuid.v4(); // every thirdpage has own uuid
  getCurrentView.browserWindow.webContents.send('will-load-thirdpage', protocol + `//${host}`, thirdpageUid)

  let contents = getActive(getCurrentView.browserWindow).webContents;

  contents.on('destroyed', () => {
    contents.isDestroyed() && (contents = null);
    !(getCurrentView.browserWindow.isDestroyed()) && getCurrentView.browserWindow.webContents.send('will-cancel-downloadpage', protocol + `//${host}`)
  })

  contents.on('will-navigate', () => {
    console.log('navigate to new url');
    getCurrentView.browserWindow.webContents.send('will-cancel-downloadpage', protocol + `//${host}`);
  })

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
  console.log('on loadErrorPage');
  ipcMain.once(thirdpageUid + '-loadErrorPage', (event, {
    errorCode = '',
    note = ''
  }) => {
    try {
      callback({
        method: 'get',
        path: path.join(__static, 'html/failed/blank.html')
      })
      contents && contents.executeJavaScript(`document.documentElement.innerHTML = '${dnsErrorPage({errorCode,note})}' `)
    } catch (error) {
      console.log(error);
    }
  })
}