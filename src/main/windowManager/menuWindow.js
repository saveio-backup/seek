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
        allowRunningInsecureContent: true
      }
    })
    const url = DEFAULT_URL + '#' + 'menuWindow';
    this.win.loadURL(url);
    if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
      this.win.webContents.openDevTools();
    }
  }
  openMenu(menuid, opt) {
    if (menuid === 'netstate') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', 'netstate');
      this.win.setBounds({
        x: parentBounds.x + parentBounds.width - 200,
        y: parentBounds.y + Y_POSITION,
        width: 200,
        height: 200
      })
      this.win.show();
    } else if (menuid === 'xxx') {
    }
  }
}