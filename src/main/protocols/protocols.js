import {
  app,
  protocol,
  ipcMain
} from 'electron'
import {
  getCurrentView,
  getActive
} from '../windowManager/index'
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
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
    log.error('Failed to create protocol: seek. ' + err);
  })
})

function seekHttpProtocol(request, callback) {
  console.log('seekProtocol!!!!');
  const url = request.url.replace('seek://', `${host}`);
  console.log('url now is : ', url);
  getActive(getCurrentView.browserWindow).webContents.reload();
  getActive(getCurrentView.browserWindow).loadURL(url);
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
  getCurrentView.loadURL(url);
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
  getCurrentView.browserWindow.webContents.send('will-load-thirdpage', protocol + `//${host}`, thirdpageUid, getActive(getCurrentView.browserWindow).browserView.id);

  let contents = getActive(getCurrentView.browserWindow).webContents;

  contents.thirdPageLists = contents.thirdPageLists ? contents.thirdPageLists : [];

  // Load a new third-party page the time you were loading previous third-party page, you must cancel previous task.
  // !! warn !! this section may occur errors
  if (contents.thirdPageLists.length >= 1) {
    getCurrentView.browserWindow.webContents.send('will-cancel-downloadpage', protocol + `//${contents.thirdPageLists[contents.thirdPageLists.length-1].host}`);
    ipcMain.removeAllListeners([contents.thirdPageLists[contents.thirdPageLists.length - 1].thirdpageUid + '-loadErrorPage'])
    contents.thirdPageLists.pop();
  }
  contents.thirdPageLists.push({ // record thirdpage's info  to it's webContents.thirdPagelists
    host,
    thirdpageUid
  });

  contents.on('destroyed', () => {
    contents.isDestroyed() && (contents = null);
    !(getCurrentView.browserWindow.isDestroyed()) && getCurrentView.browserWindow.webContents.send('will-cancel-downloadpage', protocol + `//${host}`);
  })

  contents.on('will-redirect', () => {
    console.log('redirect to new url');

    // Load a new third-party page when you load a third-party page, you must cancel Previous task.
    if (contents.thirdPageLists.length >= 1) {
      getCurrentView.browserWindow.webContents.send('will-cancel-downloadpage', protocol + `//${contents.thirdPageLists[contents.thirdPageLists.length-1].host}`);
      ipcMain.removeAllListeners([contents.thirdPageLists[contents.thirdPageLists.length - 1].thirdpageUid + '-loadErrorPage']);
      contents.thirdPageLists.pop();
    }

  })

  ipcMain.once('load-third-page', (event, result, fileName, id, url) => {
    try {
      const zip = new AdmZip(result)
      const parse = path.parse(result);
      // const unzipTo = path.join(parse.dir, fileName + '_' + id)
      const unzipTo = path.join(parse.dir, url)
      console.log('unzipTo is');
      console.log(unzipTo);
      zip.extractAllTo(unzipTo);
      const fileRootName = fs.readdirSync(unzipTo)[0];
      // console.log('unzip success, will load path is:');
      // console.log(path.join(unzipTo, fileRootName, pathname));
      callback({
        method: 'get',
        path: path.join(unzipTo, fileRootName, pathname)
      })

    } catch (error) {
      // console.log('unzip error ');
      // console.log(error);
      log.error('load-third-page error:');
      log.error(error);
      callback({
        method: 'get',
        path: path.join(__static, 'html/failed/blank.html')
      })
      contents && contents.executeJavaScript(`document.documentElement.innerHTML = '${dnsErrorPage({errorCode:undefined,note:error})}' `)
    }
  })
  ipcMain.once(thirdpageUid + '-loadErrorPage', (event, {
    errorCode = '',
    note = ''
  }) => {
    console.log('on loadErrorPage');
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

function detachListener(content, urlFormat) {
  const {
    protocol,
    host,
    search,
    hash
  } = urlFormat;
  getCurrentView.browserWindow.webContents.send('will-cancel-downloadpage', protocol + `//${contents.thirdPageLists[contents.thirdPageLists.length-1].host}`);
  ipcMain.removeAllListeners([contents.thirdPageLists[contents.thirdPageLists.length - 1].thirdpageUid + '-loadErrorPage'])
  contents.thirdPageLists.pop();
}