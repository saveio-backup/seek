'use strict'

import {
  app,
  protocol
} from 'electron'
import './ipcManager'
import './protocols/protocols' // custom protocol

import {
  windows,
  createWindow
} from './windowManager/'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
const gotTheLock = app.requestSingleInstanceLock()
if(!gotTheLock){
  app.quit();
}
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080/#/navigation` :
  `file://${__dirname}/index.html#/navigation`

import * as node from "./node"
node.setupConfig(app.getPath("appData"), app.getName())
node.setFrontConfig(app.getPath("appData"), app.getName())
app.on('ready', function () {
  node.run(app.getPath("appData"), app.getName())
  createWindow(winURL)
})

app.on('window-all-closed', () => {
  app.quit()
})
app.on('activate', () => {
  if (Object.keys(windows).length === 0) {
    createWindow(winURL)
  }
})
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