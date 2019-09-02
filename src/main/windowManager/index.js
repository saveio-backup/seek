import {
  app,
  BrowserWindow,
  BrowserView
} from 'electron'
import dialogView from './dialogView'
import path from 'path'
import {
  DEFAULT_URL,
  DEFAULT_PROTOCOL,
  Y_POSITION,
  X_POSITION
} from './defaultOption'
import {
  URL
} from 'url';
import MenuWindow from './menuWindow'
import log from 'electron-log'
import errorPage from '../../../static/html/failed/failed.js'
import frontCfgObj from './frontCfgObj'
import {
  SeekDB
} from '../dbs/index';
const seekDB = new SeekDB();
seekDB.initDB();
export const windows = {}; // map of {[parentWindow.id] => BrowserWindow}
export let getCurrentView = null;
export let dialogViewObj = null;
// global.windows = windows;
class View {
  constructor(win, url, option = {
    isActive: true
  }) {

    this.browserWindow = win;
    this.url = url;
    this.isLoading = false;
    this.updateDisplayURL();
    this.isSave = new URL(this.displayURL).protocol === DEFAULT_PROTOCOL + ':'
    this.initBrowserView();
    this.isActive = Boolean(option.isActive)
    this.option = option;

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
  get canGoBack() {
    return this.webContents.canGoBack()
  }

  get canGoForward() {
    return this.webContents.canGoForward()
  }

  initBrowserView(webOpt = {
    sandbox: !this.isSave
  }) {
    this.browserView = new BrowserView({
      webPreferences: {
        webviewTag: false,
        contextIsolation: false,
        preload: path.join(__static, 'preload.js'),
        sandbox: webOpt.sandbox,
        // sandbox:false,
        enableRemoteModule: !webOpt.sandbox, // disable remote module
        // enableRemoteModule:true,
        nodeIntegration: !webOpt.sandbox,
        // nodeIntegration:true,
        defaultEncoding: 'utf-8'
      }
    });
    seekDB.querySettings('console').then(res => {
      if (res) {
        this.browserView.webContents.openDevTools();
      }
    })
    // if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
    //   this.browserView.webContents.openDevTools();
    // }
  }
  forceUpdate() {
    if (this && this.browserView) {
      console.log('forceUpdate------->', this.webContents.getURL());
      this.url = this.webContents.getURL();
      this.updateDisplayURL();
      this.isSave = this.displayURL ? new URL(this.displayURL).protocol === DEFAULT_PROTOCOL + ':' : false
      this.browserWindow.webContents.send('forceUpdate');
    }
  }
  updateDisplayURL() {
    let url = this.url ? new URL(this.url) : new URL('about:blank');
    let hrefFormated, defaultURLFormated;
    hrefFormated = decodeURIComponent(url.href).replace(/(\\|\/)/g, '/').replace('\/\/\/', '\/\/');
    defaultURLFormated = decodeURIComponent(DEFAULT_URL).replace(/(\\|\/)/g, '/').replace('\/\/\/', '\/\/');
    if (this.url.endsWith('.pdf')) {
      // if is pdf file change displayURL 
      let index = this.url.indexOf('?file=');
      this.displayURL = decodeURIComponent(this.url.slice(index + 6));
    } else if (url.host === 'localhost:9080') {
      const urlReg = new RegExp(url.origin + url.pathname + '(#/)?');
      this.displayURL = decodeURIComponent(url.href.replace(urlReg, DEFAULT_PROTOCOL + '://'));
    } else if (hrefFormated.indexOf(defaultURLFormated) >= 0) {
      const urlReg = new RegExp(/(file:.+#)(\/?.*$)/);
      this.displayURL = decodeURIComponent(hrefFormated.replace((hrefFormated.match(urlReg) || [])[1], DEFAULT_PROTOCOL + '://').replace('\/\/\/', '\/\/'));
    } else {
      this.displayURL = decodeURIComponent(this.url);
    }
  }
  updateEvent() {
    this.webContents.on('did-start-loading', () => {
      // console.log('did start loading !!');
      this.isLoading = true;
      this.favicon = null;
      this.browserWindow.webContents.send('forceUpdate');
    })
    this.webContents.on('did-stop-loading', () => {
      // console.log('did stop loading')
      this.isLoading = false;
      this.browserWindow.webContents.send('forceUpdate');
    })
    this.webContents.on('page-favicon-updated', (e, favicons) => {
      this.favicon = favicons && favicons[0] ? favicons[0] : null
      this.browserWindow.webContents.send('forceUpdate');
    })
    this.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return;
      if (errorDescription == 'ERR_ABORTED' || errorCode == -3) return;
      if (errorCode == 0) return;
      this.webContents.executeJavaScript(`document.documentElement.innerHTML = '${errorPage(validatedURL)}' `)
    })
    this.webContents.on('new-window', this.onNewWindow.bind(this))
    this.webContents.on('dom-ready', () => {
      // console.log('dom-ready, forceUpdate')
      this.forceUpdate()
      if (this.option.focus) {
        this.browserWindow.webContents.send('focus');
      }
    });
    this.webContents.on('did-navigate', (e, url) => {
      // console.log('did navigate, forceUpdate')
      // console.log(url);
      this.forceUpdate()
    });
    this.webContents.on('will-redirect', (e, url) => {
      this.forceUpdate()
    });
    this.webContents.on('will-navigate', (e, url) => {
      console.log('will-navigate, url is ', url);
      this.onNewUrl(url, e)
    })
    this.webContents.on('did-start-navigation', (e, url) => {})
    // handler hashchange
    this.webContents.on('did-navigate-in-page', (e, url) => {
      this.forceUpdate()
    });
  }
  onNewWindow(e, url, framename, disposition) {
    console.log('create window');
    e.preventDefault();
    const isActive = (disposition !== 'background-tab');
    console.log(url);
    createView(this.browserWindow, url, {
      isActive
    })
  }
  onNewUrl(url, event) {
    console.log('on new Url')
    console.log(url)
    const win = this.browserWindow;
    getCurrentView = getActive(win);
    win.setBrowserView(this.browserView); //if have dialog browserView
    let newIsSave = null;
    if (url.toLowerCase().indexOf('oni://share/') >= 0) {
      console.log('share URL!!!!')
      dialogViewObj.browserView.webContents.send('setDownloadUrl', url);
      dialogViewObj.setMenuSelector('downloadDialog');
      dialogViewObj.addBrowserView();
      return;
    }
    //if is pdf loading pdf html
    if (url.toLowerCase().endsWith('.pdf')) {
      console.log('open pdf page!!!!')
      this.resize();
      this.loadURL(`${__static}\\html\\pdf\\web\\viewer.html?file=${url}`);
      this.setBroserView();
      return;
    } else if (url.toLowerCase().endsWith('.md') && !url.toLowerCase().startsWith(`seek://`)) {
      url = `${DEFAULT_URL}#/Markdown?url=${url}`;
    }

    const urlFormat = this.formatURL(url);
    if (urlFormat.protocol === DEFAULT_PROTOCOL + ':') { // is ours custom 'seek://' html page?
      newIsSave = true;
    } else if (urlFormat.host === 'localhost:9080') {
      newIsSave = true;
    } else if (decodeURIComponent(urlFormat.href).replace(/(\\|\/)/g, '').toLowerCase().indexOf(DEFAULT_URL.replace(/(\\|\/)/g, '').toLowerCase()) >= 0) {
      newIsSave = true;
    } else {
      newIsSave = false;
    }
    if (this.isSave !== newIsSave) {
      console.log('newIsSave: ', newIsSave);
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
  openComponent(path, option = {
    vueRouter: false
  }) {
    const views = this.browserWindow.views;
    const view = views.find(item => {
      if (process.env.NODE_ENV !== 'development') {
        return item.url.replace(/(\\|\/)/g, '').toLowerCase().indexOf(('index.html#' + path.replace(/(\\|\/)/g, '')).toLowerCase()) >= 0;
      }
      return item.url.replace(/(\\|\/)/g, '').toLowerCase().indexOf((DEFAULT_URL.replace(/(\\|\/)/g, '') + '#' + path.replace(/(\\|\/)/g, '')).toLowerCase()) >= 0
    })
    this.browserWindow.findView = view;
    this.browserWindow.defaultUrl = DEFAULT_URL;
    this.browserWindow.addPath = path;
    if (view) {
      if (option.vueRouter) {
        view.webContents.send('queryto', option.query)
      }
      view.setActive();
      // view.resize();
    } else {
      createView(this.browserWindow, DEFAULT_URL + '#/' + path, {
        isActive: true
      })
    }
  }
  loadURL(newURL) {
    let newURLFormat = null;
    if (newURL) {
      newURLFormat = this.formatURL(newURL);
    } else {
      newURLFormat = this.formatURL(this.realURL);
    }
    this.browserView.webContents.loadURL(newURLFormat.href);
  }
  formatURL(newURL) {

    let newURLFormat = null;

    // dev-> href: http://localhost:9080/#/navigation;
    // production-> href:
    let browserWindowURLFomat = new URL(this.browserWindow.url);
    try {
      newURLFormat = new URL(newURL)
      if ((newURLFormat.href === browserWindowURLFomat.href) || (newURLFormat.href === (browserWindowURLFomat.origin + '/'))) {
        newURLFormat.href = DEFAULT_URL + '#/Home';
      }
    } catch (error) {
      newURLFormat = new URL('seek://' + newURL)
    } finally {}
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
    this.resize();
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
  create(option) {
    createView(this.browserWindow, undefined, option)
  }
  createHelpDocument(option) {
    createView(this.browserWindow, decodeURIComponent(`${DEFAULT_URL}#/Markdown?url=${__static}/README.md`), option)
  }
}
export function createWindow(url) {

  /**
   * Initial window options
   */

  let mainWindow = new BrowserWindow({
    height: 800,
    frame: false,
    useContentSize: true,
    minWidth: 1200,
    minHeight: 563,
    width: 1200,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    fullscreenable: true,
    fullscreenWindowTitle: true,
    frame: false,
    webPreferences: {
      webSecurity: true,
      sandbox: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      allowRunningInsecureContent: false
    }
  })
  windows[mainWindow.id] = mainWindow; // add BrowserWindow Instance to windows
  mainWindow.menuWindow = new MenuWindow(mainWindow);
  mainWindow.url = url;
  mainWindow.loadURL(url)
  mainWindow.on('app-command', (e, cmd) => {
    console.log('on app command')
    onAppCommand(mainWindow, cmd)
  })
  mainWindow.on('resize', () => {
    // we shouldn't resizeAll, because it will make blank screen in macOS
    // resizeAll(mainWindow);
  })
  // Vue can't update DOM while Main process changed (Though it could update it's data)
  // so use Proxy to send IPC :(
  let handlerViews = {
    set(views, prop, value) {
      views[prop] = value;
      mainWindow.webContents.send('forceUpdate');
      return true;
    }
  }

  seekDB.querySettings('console').then(res => {
    if (res) {
      this.browserView.webContents.openDevTools();
    }
  })
  // if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.views = new Proxy([], handlerViews) // Proxy Array<View> 
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // createView(mainWindow, 'https://www.google.com/');
  // createView(mainWindow, 'https://ont.io');
  // createView(mainWindow,'https://telegram.org/');
  // createView(mainWindow, 'http://127.0.0.1:8080/')
  createView(mainWindow);
  dialogViewObj = new dialogView(mainWindow);
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
export function createView(win, url = DEFAULT_URL + '#/', option) {
  console.log(url);
  win = getTopWindow(win);
  let view = new Proxy(new View(win, url, option), handlerView)
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

export function getActive(win) {
  win = getTopWindow(win);
  return win.views.find(view => view.isActive)
}

function removeView(win, view, index) {
  win = getTopWindow(win);
  if (view.isActive) {
    console.log('current view is active!!!~~~')
    if (win.views[index + 1]) {
      win.views[index + 1].setActive()
    } else if (win.views[index - 1]) {
      win.views[index - 1].setActive()
    }
  } else {
    console.log('current view is not active!!!!!!!')
  }
  view.browserView.destroy();
  view.browserView = null;
  win.views[index] = null;
  win.views.splice(index, 1);
  win.views.length === 0 && win.destroy();
}

function resizeAll(win) {
  console.log('reseize all');
  let {
    width,
    height
  } = win.getContentBounds();
  const views = win.views;
  const length = views.length;
  for (let i = 0; i < length; i++) {
    views[i].browserView.setBounds({
      x: X_POSITION,
      y: Y_POSITION,
      width: width - X_POSITION,
      height: height - Y_POSITION
    });
    views[i].browserView.setAutoResize({
      width: true,
      height: true
    });
  }

}

function onAppCommand(win, cmd) {
  win = getTopWindow(win);
  console.log(cmd);
  switch (cmd) {
    case 'browser-backward':
      getActive(win).webContents.goBack();
      break
    case 'browser-forward':
      getActive(win).webContents.goForward();
      break
    default:
      break
  }
}