
import {
  BrowserView
} from 'electron'

import {
  Y_POSITION,
  X_POSITION,
  DEFAULT_URL
} from './defaultOption'

class dialogView {
  constructor(win) {
    this.browserView = null;
    this.browserWindow = this.getTopWindow(win);
  }

  loadUrl(url) {
    if(!url) return;
    const newUrl = DEFAULT_URL + '#' + url;
    console.log('-------->',newUrl);
    if(this.browserView == null) {
      this.createBrowserView();
    }
    this.browserWindow.addBrowserView(this.browserView);
    this.browserView.webContents.loadURL(newUrl);
  }

  removeBrowserView() {
    console.log('ready delete')
    this.browserWindow.removeBrowserView(this.browserView);
  }

  createBrowserView() {
    this.initBrowserView();
    this.updateEvent();
    this.resize();
    this.browserView.webContents.openDevTools();
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