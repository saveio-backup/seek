import {
  BrowserView
} from 'electron'

import {
  Y_POSITION,
  X_POSITION,
  DEFAULT_URL
} from './defaultOption'
import frontCfgObj from './frontCfgObj'

class dialogView {
  constructor(win) {
    this.browserView = null;
    this.browserWindow = this.getTopWindow(win);
    // this.loadDialog();
    this.createBrowserView();
  }
  async loadUrl(url) {
    if (!url) return;
    const newUrl = DEFAULT_URL + '#' + url;
    console.log('-------->', newUrl);
    if (this.browserView == null) {
      this.createBrowserView();
    }
    try {
      this.browserView.webContents.loadURL(newUrl);
    } catch (error) {
      console.error(error);
    }
    this.browserWindow.addBrowserView(this.browserView);
  }
  addBrowserView() {
    this.browserWindow.addBrowserView(this.browserView);
    this.resize();
    this.browserWindow.addBrowserView(this.browserView); // mac bug
  }
  removeBrowserView() {
    console.log('ready delete')
    this.browserWindow.removeBrowserView(this.browserView);
  }
  setMenuSelector(selector) {
    this.browserView.webContents.send('setSelector', selector)
  }
  createBrowserView() {
    this.initBrowserView();
    this.updateEvent();
    this.resize();
    this.loadDialog();
    if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
      this.browserView.webContents.openDevTools();
    }
  }
  async loadDialog() {
    const dialogUrl = DEFAULT_URL + '#' + 'dialog';
    try {
      await this.browserView.webContents.loadURL(dialogUrl);
    } catch (error) {
      console.error(error);
    }
  }
  updateEvent() {

  }
  initBrowserView() {
    this.browserView = new BrowserView({
      webPreferences: {
        contextIsolation: false,
        webviewTag: false,
        sandbox: false,
        enableRemoteModule: true, // disable remote module
        nodeIntegration: true,
        defaultEncoding: 'utf-8'
      }
    });
  }

  updateEvent() {

  }

  resize() {
    const win = this.browserWindow;
    var {
      width,
      height
    } = win.getContentBounds();
    this.browserView.setBounds({
      x: X_POSITION,
      y: Y_POSITION,
      width: width - X_POSITION,
      height: height - Y_POSITION
    });
    this.browserView.setAutoResize({
      width: true,
      height: true
    });
  }

  getTopWindow(win) {
    while (win.getParentWindow()) {
      win = win.getParentWindow();
    }
    return win
  }
}

export default dialogView;