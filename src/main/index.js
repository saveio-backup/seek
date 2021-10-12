'use strict'

import {
  app,
  BrowserWindow,
  dialog
} from 'electron'
// 初始化
require('@electron/remote/main').initialize();
import './ipcManager'
import './protocols/protocols' // custom protocol
import {
  SettingDB,
  HistoryDB,
  UsermetaDB
} from './dbs/index_levelup'
import './dbs/index_levelup'
import frontCfgObj from './windowManager/frontCfgObj'
import {
  windows,
  createWindow
} from './windowManager/'
import zh from './i18n/zh/index';
import en from './i18n/en/index';
const i18n = {
  zh,
  en
}
const log = require('electron-log')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
// const gotTheLock = app.requestSingleInstanceLock()
// if (!gotTheLock) {
//   app.quit();
// }
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080/#/navigation` :
  `file://${__dirname}/index.html#/navigation`

import initDocs from './initDocs.js'; // Different version compatibility files
import * as node from "./node"

app.on('will-finish-launching', () => {
  app.on('open-file', (e, urlStr) => {
    try {
      log.error('urlStr:', urlStr);
      const fw = BrowserWindow.getFocusedWindow();
      if (fw) {
        windows['1'].driftViews[0].browserView.webContents.send('setDecodeFilePath', urlStr);
      } else {
        setTimeout(() => {
          windows['1'].driftViews[0].browserView.webContents.send('setDecodeFilePath', urlStr);
        }, 3000)
      }
    } catch (e) {
      log.error(e);
    }
  })
});
app.on('ready', function () {
  initDocs.init(app.getPath("appData"), app.getName()).then(() => {
    global.settingDB = new SettingDB(); // store SettingDB in global var
    // global.usermetaDB = new UsermetaDB(); // store UsermetaDB in global var 


    global.settingDB.initDB(async () => {
      const currentAddress = await global.settingDB.queryData('currentAddress');
      const lang = await global.settingDB.queryData('lang')
      node.setupConfig(app.getPath("appData"), app.getName());
      node.setFrontConfig(app.getPath("appData"), app.getName());
      (!frontCfgObj().devEdgeEnable) && node.run(app.getPath("appData"), app.getName());
      createWindow(winURL);
      global.HistoryDB = new HistoryDB(currentAddress); // store HistoryDB in global var
      global.usermetaDB = new UsermetaDB(currentAddress);
      global.HistoryDB.initDB();
      global.usermetaDB.initDB();
      global.lang = i18n[lang];
    })
  });
})

app.on('window-all-closed', () => {
  console.log('all closed!!!!!!!!')
  app.quit()
})
app.on('activate', () => {
  if (Object.keys(windows).length === 0) {
    createWindow(winURL);
  }
});
app.on('second-instance', (e, argv) => {
  try {
    log.debug("second-instance==============")
    log.debug("e")
    log.debug(e)
    log.debug("window")
    log.debug(windows);
    log.debug("window['1']");
    log.debug(windows['1']);
    log.debug("window['1'].driftViews");
    log.debug(windows['1'].driftViews);
    log.debug("window['1'].driftViews");
    log.debug(windows['1'].driftViews[0]);
    log.debug("window['1'].driftViews[0].browserView");
    log.debug(windows['1'].driftViews[0].browserView);
    log.debug("window['1'].driftViews[0].browserView.webContents");
    log.debug(windows['1'].driftViews[0].browserView.webContents);
    log.debug("argv")
    log.debug(argv)
    windows['1'].driftViews[0].browserView.webContents.send('setDecodeFilePath', argv[(argv.length - 1)]);
  } catch (e) {
    log.error(e);
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */