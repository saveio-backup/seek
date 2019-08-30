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
      }
    })
    const url = DEFAULT_URL + '#' + 'menuWindow';
    this.win.loadURL(url);
    if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
      this.win.webContents.openDevTools();
    }
  }
  hiddenMenu() {
    this.win.hide();
  }
  openMenu(params, opt) {
    if (params.id === 'syncInfo') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', params);
      this.win.setBounds({
        x: parentBounds.x + parentBounds.width - 210,
        y: parentBounds.y + Y_POSITION,
        width: 200,
        height: 60
      })
      this.win.showInactive();
    } else if (params.id === 'state') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', params);
      this.win.setBounds({
        x: parentBounds.x + 40,
        y: parentBounds.y - 150 + parentBounds.height,
        width: 210,
        height: 140
      })
      this.win.showInactive();
    }
  }
}