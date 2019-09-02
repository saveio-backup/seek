import {
  BrowserWindow
} from 'electron'
import {
  Y_POSITION,
  X_POSITION,
  DEFAULT_URL
} from './defaultOption'
import frontCfgObj from './frontCfgObj.js'
export default class MenuWindow {
  constructor(parentWindow) {
    this.parentWindow = parentWindow;
    this.win = new BrowserWindow({
      parent: parentWindow,
      frame: false,
      resizable: false,
      maximizable: false,
      show: false,
      fullscreenable: false,
      webPreferences: {
        defaultEncoding: 'utf-8',
        webSecurity: true,
        sandbox: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        allowRunningInsecureContent: false
      },
      transparent: true
    })
    const url = DEFAULT_URL + '#' + 'menuWindow';
    this.win.loadURL(url);
    if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
      this.win.webContents.openDevTools();
    }
    this.setTimeoutObj = null
  }
  hiddenMenu() {
    clearTimeout(this.setTimeoutObj)
    this.setTimeoutObj = setTimeout(() => {
      console.log('hiddenMenu---------------->')
      this.win.hide();
    }, 100);
  }
  openMenu(params, opt) {
    clearTimeout(this.setTimeoutObj)
    if (params.id === 'syncInfo') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', params);
      this.win.setBounds({
        x: parentBounds.x + parentBounds.width - 225,
        y: parentBounds.y + Y_POSITION - 5,
        width: 230,
        height: 90
      })
      this.win.showInactive();
    } else if (params.id === 'state') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', params);
      this.win.setBounds({
        x: parentBounds.x + 25,
        y: parentBounds.y - 165 + parentBounds.height,
        width: 240,
        height: 170
      })
      this.win.showInactive();
    }
  }
}