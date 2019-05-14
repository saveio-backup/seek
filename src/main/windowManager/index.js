import {
  BrowserWindow,
  BrowserView
} from 'electron'
import {
  DEFAULT_URL,
  DEFAULT_PROTOCOL,
  Y_POSITION,
  X_POSITION
} from './defaultOption'
import {
  URL
} from 'url';
export const windows = {}; // map of {[parentWindow.id] => BrowserWindow}
global.windows = windows;
class View {
  constructor(win, url, option = {
    isActive: true
  }) {

    this.browserWindow = win;
    this.url = url;
    this.updateDisplayURL();
    this.isSave = new URL(this.displayURL).protocol === DEFAULT_PROTOCOL + ':'
    this.initBrowserView();
    this.isActive = Boolean(option.isActive)

    // event
    this.updateEvent();

  }


  get title() {
    return this.webContents.getTitle();
  }
  get realURL() {
    return this.url;
  }
  get webContents() {
    return this.browserView.webContents;
  }
  // get displayURL() {
  //   let url = null;
  //   if (this.realURL) {
  //     url = new URL(this.realURL);
  //   } else {
  //     url = new URL('about:blank')
  //   }
  //   if (url.host === 'localhost:9080') {
  //     return url.href.replace(url.origin, DEFAULT_PROTOCOL+'://')
  //   } else {
  //     return this.url
  //   }
  // }

  initBrowserView(webOpt = {
    sandbox: !this.isSave
  }) {
    this.browserView = new BrowserView({
      webPreferences: {
        contextIsolation: false,
        webviewTag: false,
        sandbox: webOpt.sandbox,
        // sandbox:false,
        enableRemoteModule: !webOpt.sandbox, // disable remote module
        // enableRemoteModule:true,
        nodeIntegration: !webOpt.sandbox,
        // nodeIntegration:true,
        defaultEncoding: 'utf-8'
      }
    });
    this.browserView.webContents.openDevTools();
  }
  forceUpdate() {
    this.url = this.webContents.getURL();
    this.updateDisplayURL();
    this.isSave = this.displayURL ? new URL(this.displayURL).protocol === DEFAULT_PROTOCOL + ':' : false
    this.browserWindow.webContents.send('forceUpdate');
  }
  updateDisplayURL() {
    let url = this.url ? new URL(this.url) : new URL('about:blank');
    if (url.host === 'localhost:9080') {
      const urlReg = new RegExp(url.origin + url.pathname + '(#/)?');
      this.displayURL = url.href.replace(urlReg, DEFAULT_PROTOCOL + '://')
    } else if(url.protocol === 'file:'){
      const urlReg = new RegExp('file://' + url.pathname + '(#/)?');
      this.displayURL = url.href.replace(urlReg, DEFAULT_PROTOCOL + '://')
    }
    else {
      this.displayURL = this.url
    }
  }
  updateEvent() {
    this.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('load Error!!!!!!!!')
      console.error(errorDescription)
    })
    this.webContents.on('new-window', this.onNewWindow.bind(this))
    this.webContents.on('dom-ready', () => {
      console.log('dom-ready, forceUpdate')
      this.forceUpdate()
    });
    this.webContents.on('did-navigate', (e, url) => {
      console.log('did navigage, forceUpdate')
      console.log(url);
      this.forceUpdate()
    });
    this.webContents.on('will-navigate', (e, url) => {
      console.log('will-navigate')
      console.log(url);
      this.onNewUrl(url, e)
    })
    this.webContents.on('did-start-navigation', (e, url) => {
      console.log('did start navigation')
      console.log(url)
    })
    // handler hashchange
    this.webContents.on('did-navigate-in-page', () => {
      console.log('did-navigate-in-page, forceUpdate')
      this.forceUpdate()
    });
  }
  onNewWindow(e, url, framename, disposition) {
    e.preventDefault();
    const isActive = (disposition !== 'background-tab');
    console.log('create window');
    console.log(url);
    createView(this.browserWindow, url, {
      isActive
    })
  }
  onNewUrl(url, event) {
    console.log('onNewUrl', url)
    let newIsSave = null;
    const urlFormat = this.formatURL(url);
    if (urlFormat.protocol === DEFAULT_PROTOCOL + ':') { // is ours custom 'seek://' html page?
      newIsSave = true;
    } else if (urlFormat.host === 'localhost:9080' || urlFormat.protocol === 'file:') {
      newIsSave = true;
    } else {
      newIsSave = false;
    }
    console.log('newIsSave: ', newIsSave);
    if (this.isSave !== newIsSave) {
      event && event.preventDefault();
      // this.browserView = null;
      this.isSave = newIsSave;
      // this.url = url; // Set this.url will not take effect, because forceUpdate will reset
      this.initBrowserView({
        sandbox: !newIsSave
      });
      this.updateEvent();
      this.resize();
      this.loadURL(urlFormat.href);
      this.setBroserView();
    } else {
      this.loadURL(url);
    }
  }
  // openComponent() {
  //   // const fix = DEFAULT_URL + '#/';
  //   // let arr = [fix + 'Wallet', fix + 'Filemanager', fix + 'Miner', fix + 'Wallet', fix + 'Filemanager', fix + 'Miner']
  //   let arr1 = ['https://electronjs.org/docs/api/browser-window', 'https://regexper.com/#123%28%5C%23%5C%2F%29%3F', 'https://simulatedgreg.gitbooks.io/electron-vue/content/cn/using-static-assets.html', 'https://element.eleme.io/#/zh-CN/component/input']
  //   arr1.map(item => {
  //     createView(this.browserWindow, item, {
  //       isActive: true
  //     })
  //   })
  // }
  openComponent(path) {
    const views = this.browserWindow.views;
    const view = views.find(item => {
      console.log('item.replace:',item.url.replace(/(\\|\/)/g,''))
      console.log('DEFAULT_URL replace',DEFAULT_URL.replace(/(\\|\/)/g,'') + '#' + path)
      return item.url.replace(/(\\|\/)/g,'').indexOf(DEFAULT_URL.replace(/(\\|\/)/g,'') + '#' + path) >= 0
    })
    this.browserWindow.findView = view;
    this.browserWindow.defaultUrl = DEFAULT_URL;
    this.browserWindow.addPath = path;
    if (view) {
      view.setActive();
    } else {
      console.log('createview');
      console.log(DEFAULT_URL + '#/' + path)
      createView(this.browserWindow, DEFAULT_URL + '#/' + path, {
        isActive: true
      })
    }
  }
  loadURL(newURL) {
    console.log('loadURL!!!!');
    if (newURL) {
      console.log('newURL is', newURL)
    }
    let newURLFormat = null;
    if (newURL) {
      newURLFormat = this.formatURL(newURL);
    } else {
      newURLFormat = this.formatURL(this.realURL);
    }
    console.log('newURLFormat get:', newURLFormat);
    this.browserView.webContents.loadURL(newURLFormat.href)
  }
  formatURL(newURL) {
    console.log('formatURL', newURL)
    let newURLFormat = null;
    let browserWindowURLFomat = new URL(this.browserWindow.url);
    try {
      newURLFormat = new URL(newURL)
      if (newURLFormat.pathname.indexOf('/') !== 0) {
        newURLFormat.href = 'http://' + newURLFormat.href;
      }
      if ((newURLFormat.href === browserWindowURLFomat.href) || (newURLFormat.href === (browserWindowURLFomat.origin + '/'))) {
        newURLFormat.href = DEFAULT_URL + '#/home';
      }
    } catch (error) {
      newURLFormat = new URL('http://' + newURL)
    } finally {}
    console.log('return newURLFormat', newURLFormat)
    return newURLFormat;
  }
  initView() {
    this.resize();
    this.setBroserView()
    if (this.isActive) this.setActive();
  }
  resize() {
    const win = this.browserWindow;
    win.setBrowserView(this.browserView)
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
  setActive(viewIndex) {
    this.browserWindow.views.map((viewItem, index) => {
      if (viewIndex === index) {
        viewItem.isActive = true;
      } else if (viewItem.isActive === true) {
        viewItem.isActive = false;
      }
    });
    this.isActive = true; // viewIndex maybe undefined
    this.browserWindow.setBrowserView(this.browserView);
  }
  setBroserView() {
    this.browserWindow.setBrowserView(this.browserView);
  }
  cleanBrowserView() {
    this.browserWindow.setBrowserView(null);
  }
  destroy(index) {
    removeView(this.browserWindow, this, index)
  }
  create() {
    createView(this.browserWindow)
  }
}
export function createWindow(url) {

  /**
   * Initial window options
   */

  let mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    minWidth: 1200,
    minHeight: 563,
    width: 1200,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    fullscreenable: true,
    fullscreenWindowTitle: true,
    webPreferences: {
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })
  windows[mainWindow.id] = mainWindow; // add BrowserWindow Instance to windows
  mainWindow.url = url;
  mainWindow.loadURL(url)

  // Vue can't update DOM while Main process changed (Though it could update it's data)
  // so use Proxy to send IPC :(
  let handlerViews = {
    set(views, prop, value) {
      views[prop] = value;
      mainWindow.webContents.send('forceUpdate');
      return true;
    }
  }
  mainWindow.webContents.openDevTools();
  mainWindow.views = new Proxy([], handlerViews) // Proxy Array<View> 
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // createView(mainWindow, 'https://www.google.com/');
  // createView(mainWindow, 'https://ont.io');
  // createView(mainWindow,'https://telegram.org/');
  // createView(mainWindow, 'http://127.0.0.1:8080/')
  createView(mainWindow);
}

// seam as handlerViews
const FIXED_KEYS = ['displayURL']; // 'displayURL' would be set while user input value in page
const handlerView = {
  set(view, prop, value) {
    view[prop] = value;
    // console.log(prop, ' changed,', 'value', value, 'forceUpdate');
    view.forceUpdate();
    if (FIXED_KEYS.some(item => {
        return item === prop
      })) {
      view[prop] = value;
    }
    return true;
  }
}
export function createView(win, url = DEFAULT_URL + '#/') {
  console.log('createView');
  console.log(url);
  win = getTopWindow(win);
  let view = new Proxy(new View(win, url), handlerView)
  url = new URL(url)
  view.loadURL();
  win.views.push(view);
  view.initView();
}

/* function getWindow(sender) {
  return getTopWindow(electron.BrowserWindow.fromWebContents(sender))
} */

// helper ensures that if a subwindow is called, we use the parent
function getTopWindow(win) {
  while (win.getParentWindow()) {
    win = win.getParentWindow();
  }
  return win
}

function removeView(win, view, index) {
  win = getTopWindow(win);
  if (view.isActive) {
    if (win.views[index + 1]) {
      win.views[index + 1].setActive()
    } else if (win.views[index - 1]) {
      win.views[index - 1].setActive()
    }
  }
  view = null;
  win.views.splice(index, 1);
}