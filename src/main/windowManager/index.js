import {
  app,
  BrowserWindow,
  BrowserView,
  Menu,
  MenuItem
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
import failedPage from '../../../static/html/failed/failed.js'
import frontCfgObj from './frontCfgObj'
export const windows = {}; // map of {[parentWindow.id] => BrowserWindow}
export let getCurrentView = null;
export let dialogViewObj = null;
// global.windows = windows;
class View {
  constructor(win, url, option = {
    isActive: true
  }) {
    // getCurrentView = getActive(win);
    this.browserWindow = win;
    this.url = url;
    this.isLoading = false;
    this.updateDisplayURL();
    this.isSave = new URL(this.displayURL).protocol === DEFAULT_PROTOCOL + ':'
    this.initBrowserView();
    this.isActive = Boolean(option.isActive)
    this.option = option;
    this.willLoadUrl = '';

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
    return new Promise((resolve, reject) => {
      this.browserView = new BrowserView({
        webPreferences: {
          preload: path.join(path.join(__static, 'webpackPreloadOutput.js')),
          // preload: './static/preload.js',
          contextIsolation: false,
          webviewTag: false,
          sandbox: webOpt.sandbox,
          // sandbox: false,
          // enableRemoteModule: !webOpt.sandbox, // disable remote module
          // enableRemoteModule: true, // disable remote module
          nodeIntegration: !webOpt.sandbox,
          // nodeIntegration: true,
          defaultEncoding: 'utf-8',
          enableRemoteModule: true,
          //webSecurity: true,
          //allowRunningInsecureContent: false,
        }
      });
      this.browserView.webContents.once('dom-ready', () => {
        resolve();
      });
      global.settingDB.queryData('console').then(async (res) => {
        if (res) {
          this.browserView.webContents.openDevTools();
        }
      })
    })
    // if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
    //   this.browserView.webContents.openDevTools();
    // }
  }
  forceUpdate() {
    if (this && this.browserView) {
      this.url = this.webContents.getURL();
      this.updateDisplayURL();
      this.isSave = this.displayURL ? new URL(this.displayURL).protocol === DEFAULT_PROTOCOL + ':' : false
      this.browserWindow.webContents.send('forceUpdate');
    }
  }
  updateDisplayURL() {
    let url = this.url ? new URL(this.url) : new URL('about:blank');
    let hrefFormated, defaultURLFormated;
    hrefFormated = (url.href).replace(/(\\|\/)/g, '/').replace('\/\/\/', '\/\/');
    defaultURLFormated = (DEFAULT_URL).replace(/(\\|\/)/g, '/').replace('\/\/\/', '\/\/');
    if (this.url.endsWith('.pdf')) {
      // if is pdf file change displayURL
      let index = this.url.indexOf('?file=');
      this.displayURL = (this.url.slice(index + 6));
    } else if (url.host === 'localhost:9080') {
      const urlReg = new RegExp(url.origin + url.pathname + '(#/)?');
      this.displayURL = (url.href.replace(urlReg, DEFAULT_PROTOCOL + '://'));
    } else if (decodeURIComponentExtend(hrefFormated).indexOf(decodeURIComponentExtend(defaultURLFormated)) >= 0) { // use decodeURIComponent to replace('%20',' ')
      const urlReg = new RegExp(/(file:.+#)(\/?.*$)/);
      this.displayURL = (hrefFormated.replace((hrefFormated.match(urlReg) || [])[1], DEFAULT_PROTOCOL + '://').replace('\/\/\/', '\/\/'));
    } else {
      this.displayURL = (this.url || this.willLoadUrl || '');
    }
  }
  updateEvent() {
    const vm = this;
    this.webContents.on('before-input-event', (e, input) => {
      if (input.control && input.key === 'r') {
        e.preventDefault();
        getActive(this.browserWindow).browserView.webContents.reload();
      }
    })
    this.webContents.on('context-menu', (e, props) => {
      const menuItems = [];
      menuItems.push({
          role: 'copy',
          label: global.lang.contextMenu.copy,
          enabled: props.editFlags.canCopy,
          accelerator: 'CommandOrControl+C'
        }, {
          role: 'paste',
          label: global.lang.contextMenu.paste,
          enabled: props.editFlags.canPaste,
          accelerator: 'CommandOrControl+V'
        }, {
          label: global.lang.contextMenu.refresh,
          click: () => {
            this.webContents.reload();
          },
          // accelerator: 'CommandOrControl+J'
        }, {
          label: 'Devtools',
          label: global.lang.contextMenu.devtools,
          click: () => {
            this.webContents.openDevTools();
          }
        }
        // { // bug to fix
        //   label: 'Print',
        //   click: () => {
        //     this.webContents.print();
        //   }
        // }
      )
      let menu = Menu.buildFromTemplate(menuItems);
      menu.popup();
    })
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
      console.log('get-----=====---')
      this.favicon = favicons && favicons[0] ? favicons[0] : null;
      this.updateDisplayURL();
      this.addHistory({
        e,
        href: vm.displayURL
      });
      this.browserWindow.webContents.send('forceUpdate');
    })
    this.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return;
      if (errorDescription == 'ERR_ABORTED' || errorCode == -3) return;
      if (errorCode == 0) return;
      if (!validatedURL) return;
      console.log('load error!!');
      console.log(errorDescription);
      console.log(`uri is ${validatedURL}`);
      this.webContents.executeJavaScript(`document.documentElement.innerHTML = '${failedPage(validatedURL)}' `)
    })
    this.webContents.on('new-window', (e, url) => {
      this.onNewWindow(url, e)
    })
    this.webContents.on('dom-ready', () => {
      console.log('dom-ready');
      // this.addHistory(e);

      this.forceUpdate()
      if (this.option.focus) {
        this.browserWindow.webContents.send('focus');
      }
    });
    this.webContents.on('did-navigate', (e, url) => {
      console.log('did navigate, forceUpdate')
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
      console.log('navigation in page');
      this.forceUpdate()
    });
  }
  addHistory({
    e,
    href
  }) {
    // the timeout for get title when route link change title be changed
    setTimeout(() => {
      // the try catch when brwoserView be closed
      try {
        const title = e.sender.webContents.getTitle();
        const timestamp = (new Date()).getTime();
        // const href = e.sender.history[(e.sender.history.length - 1)];
        const src = this.favicon;
        console.log(title, '--->', timestamp, '--->', href, '---------->', src);
        let res = /^seek:\/\/(history|Login|CreateAccount|ImportAccount|settings|loginLog)/.test(href)
        if (res) {
          return;
        }
        global.HistoryDB.add({
          title,
          timestamp,
          href,
          src
        });
      } catch (e) {

      }
    }, 1000);
  }
  onNewWindow(url, e, framename, disposition) {
    console.log('create window');
    const win = this.browserWindow;
    getCurrentView = getActive(win);
    e && e.preventDefault();
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
    if (url.toLowerCase().startsWith('oni://share/')) {
      console.log('share URL!!!!')
      dialogViewObj.browserView.webContents.send('setDownloadUrl', url);
      dialogViewObj.setMenuSelector('downloadDialog');
      dialogViewObj.addBrowserView();
      return;
    }
    //if is pdf loading pdf html
    if (url.toLowerCase().endsWith('.pdf')) {
      this.resize();
      this.loadURL(`${__static}\\html\\pdf\\web\\viewer.html?file=${url}`);
      this.setBroserView();
      return;
    } else if (url.toLowerCase().endsWith('.md') && !url.toLowerCase().startsWith(`seek://`)) {
      url = `${DEFAULT_URL}#/Markdown?url=${url}`;
    }

    const urlFormat = this.formatURL(url);
    if (urlFormat.protocol === DEFAULT_PROTOCOL + ':') { // is ours custom 'seek://' html page?
      console.log('urlFormat.protocol === DEFAULT_PROTOCOL + :')
      newIsSave = true;
    } else if (urlFormat.host === 'localhost:9080') {
      console.log("urlFormat.host === 'localhost:9080'");
      newIsSave = true;
    } else if (decodeURIComponentExtend(urlFormat.href).replace(/(\\|\/)/g, '').toLowerCase().indexOf(DEFAULT_URL.replace(/(\\|\/)/g, '').toLowerCase()) >= 0) {
      newIsSave = true;
    } else {
      newIsSave = false;
    }
    if (this.isSave !== newIsSave) {
      let tempBrowserView = this.browserView;
      this.browserView = null;
      console.log('newIsSave: ', newIsSave);
      event && event.preventDefault();
      // this.browserView = null;
      this.isSave = newIsSave;
      // this.url = url; // Set this.url will not take effect, because forceUpdate will reset
      this.willLoadUrl = urlFormat.href; // store new url which we will load while we load new url but WebContents is not ready
      this.initBrowserView({
        sandbox: !newIsSave
      }).then(() => {
        // we must destroy this old process(browserView) after init a new process(browserView),
        //if we destroy this old process before that, it will crash in macOS
        tempBrowserView.destroy();
        tempBrowserView = null;
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
    // this.browserWindow.findView = view;
    this.browserWindow.defaultUrl = DEFAULT_URL;
    // this.browserWindow.addPath = path;
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
  openThirdPage(url) {
    const views = this.browserWindow.views;
    let activeView = null;
    try {
      const host = new URL(url).host;
      for (let i = views.length - 1; i >= 0; i--) {
        const view = views[i];
        if (new URL(view.url).host === host) {
          activeView = view;
          break;
        }
      }
      if (activeView) {
        activeView.setActive();
      } else {
        createView(this.browserWindow, url, {
          isActive: true
        })
      }
    } catch (error) {
      createView(this.browserWindow, url, {
        isActive: true
      })
    }
    // const host = new Url
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
    if (this.isActive) {
      this.setActive();
    }
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
    getCurrentView = getActive(this.browserWindow);
  }
  setBroserView() {
    this.browserWindow.setBrowserView(this.browserView);
  }
  cleanBrowserView() {
    this.browserWindow.setBrowserView(null);
  }
  destroy(index) {
    console.log("mian destroy ceshi");
    removeView(this.browserWindow, this, index)
  }
  create(option) {
    createView(this.browserWindow, undefined, option)
  }
  createHelpDocument(option) {
    createView(this.browserWindow, decodeURIComponentExtend(`${DEFAULT_URL}#/Markdown?url=${__static}/README.md`), option)
  }
  createNewView(win, url = DEFAULT_URL + '#/', option) {
    createView(win, url, option);
  }
}
export async function createWindow(url) {

  /**
   * Initial window options
   */
  let themeColor = ""
  themeColor = await global.settingDB.queryData('themeColor')
  let mainWindow = new BrowserWindow({
    height: 850,
    frame: false,
    useContentSize: true,
    minWidth: 1200,
    minHeight: 800,
    width: 1200,
    backgroundColor: themeColor=="dark"? '#333333':'#dfe2e9',
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    fullscreenable: true,
    fullscreenWindowTitle: true,
    frame: false,
    webPreferences: {
      preload: path.join(path.join(__static, 'webpackPreloadOutput.js')),
      //webSecurity: true,
      sandbox: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      //allowRunningInsecureContent: false,
    }
  })
  windows[mainWindow.id] = mainWindow; // add BrowserWindow Instance to windows
  mainWindow.menuWindow = new MenuWindow(mainWindow);
  mainWindow.url = url;
  mainWindow.loadURL(url)
  mainWindow.webContents.on('before-input-event', (e, input) => {
    registerKeyBinding(mainWindow, input);
  })
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
  global.settingDB.queryData('console').then(async (res) => {
    if (res) {
      mainWindow.webContents.openDevTools();
    }
  })
  // if (process.env.NODE_ENV === 'development' || frontCfgObj().console) {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.views = new Proxy([], handlerViews) // Proxy Array<View> 
  mainWindow.on('closed', () => {
    mainWindow = null
  })

   //createView(mainWindow, 'https://www.google.com/');
  // createView(mainWindow, 'https://ont.io');
  // createView(mainWindow,'https://telegram.org/');
  // createView(mainWindow, 'http://127.0.0.1:8080/')

   createView(mainWindow);

   dialogViewObj = new dialogView(mainWindow);

    mainWindow.driftViews = []; // add lists to manage drift BrowserView (eg: dialogView)
   mainWindow.driftViews.push(dialogViewObj);
}

// seam as handlerViews
const FIXED_KEYS = ['displayURL']; // 'displayURL' would be set while user input value in page
const handlerView = {
  set(view, prop, value) {
    view[prop] = value;
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
  console.log(view.browserView);
  console.log(view);
  console.log(index);
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
  //view.browserView.destroy();
  win.removeBrowserView(view.browserView)
  view.browserView = null;
  win.views[index] = null;
  win.views.splice(index, 1);

  if (win.views.length === 0) {
    console.log('win views length   === 0')
    delete windows[win.id];
    win.destroy();
  }

  (Object.entries(windows).length === 0) && app.quit(); // if there is no BrowserWindow in windows, quit seek.

}

function resizeAll(win) {
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

function decodeURIComponentExtend(url) {
  try {
    return decodeURIComponent(url);
  } catch (error) {
    return '';
  }
}

function registerKeyBinding(win, input) {
  if (input.control && input.key === 'r') {    
    getActive(win).browserView.webContents.reload();
  }
}