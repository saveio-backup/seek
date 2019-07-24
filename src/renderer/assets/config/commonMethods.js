import {
  ipcRenderer,
  remote
} from "electron";
const methods = {
  activeMessage({ info, type }) {
    let views = remote.getCurrentWindow().views;
    let activeView = views.find(view => view.isActive);
    const webContentsId = activeView.browserView.webContents.id;
    ipcRenderer.sendTo(webContentsId, 'current-active-show-message', { info: info, type: type })
  },
  install(Vue) {
    const vm = this;
    Vue.prototype.$exportWallet = function (event, cb) {
      Vue.prototype.$axios
        .get(Vue.prototype.$api.account + "/export/walletfile")
        .then(res => {
          ipcRenderer.send("export-file-dialog", res.Result.Wallet, 'Wallet');
          ipcRenderer.once("export-finished", () => {
            if (cb) {
              console.log(cb);
              cb();
            } else {
              vm.activeMessage({
                info: "Export Success!",
                type: "success"
              });
            }
          });
        })
        .catch(err => {
          console.error(err);
        });
    };
    Vue.prototype.$exportFile = function (contents, fileName) {
      ipcRenderer.send("export-file-dialog", contents, fileName);
      ipcRenderer.once("export-finished", () => {
        if (cb) {
          cb();
        } else {
          vm.activeMessage({
            info: "Export Success!",
            type: "success"
          });
        }
      });
    };
    Vue.prototype.$exportPrivatekey = function () {
      // Vue.prototype.$axios
      // .get(Vue.prototype.$api.account + "/export/private")
    };
    Vue.prototype.$clipText = function () {

    }
  }
}
export default methods;