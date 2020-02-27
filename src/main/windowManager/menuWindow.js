import {
  BrowserWindow
} from 'electron'
import {
  Y_POSITION,
  X_POSITION,
  DEFAULT_URL
} from './defaultOption'
export default class MenuWindow {
  constructor(parentWindow) {
    this.parentWindow = parentWindow;
    this.win = new BrowserWindow({
      parent: parentWindow,
      frame: false,
      transparent:true,
      resizable: false,
      maximizable: false,
      show: false,
      fullscreenable: false,
      hasShadow: false,
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
    this.win.on('blur',this.hiddenMenu.bind(this));
    // global.settingDB.queryData('console').then(async (res) => {
    //   if (res) {
    //     this.win.webContents.openDevTools();
    //   }
    // })
    // if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
    //   this.win.webContents.openDevTools();
    // }
  }
  hiddenMenu(from) {
    clearTimeout(this.setTimeoutObj)
    this.setTimeoutObj = setTimeout(() => {
      this.win.hide();
      this.blur();
    },150);
  }
  openMenu(params, opt) {
    clearTimeout(this.setTimeoutObj)
    if (params.id === 'syncInfo') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', params);
      this.win.setBounds({
        x: parentBounds.x + parentBounds.width - 235,
        y: parentBounds.y + Y_POSITION + 5,
        width: 230,
        height: 90
      })
      this.win.getParentWindow().focus();
      this.win.showInactive();
      // this.win.focus();
    } else if (params.id === 'state') {
      let parentBounds = this.parentWindow.getBounds();
      this.win.webContents.send('setMenuDialog', params);
      this.win.setBounds({
        x: parentBounds.x + 45,
        y: parentBounds.y - 145 + parentBounds.height,
        width: 240,
        height: 140
      })
      // this.win.getParentWindow().focus();
      this.win.showInactive();
      this.win.focus();
    }
  }
  focus() {
    this.parentWindow.blur();
    this.win.focus();
  }
  blur() {
    this.win.blur();
    this.parentWindow.focus();
  }
}