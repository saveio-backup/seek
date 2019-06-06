import {
  ipcRenderer
} from "electron";
const methods = {
  install(Vue) {
    Vue.prototype.$exportWallet = function (cb) {
      Vue.prototype.$axios
        .get(Vue.prototype.$api.account + "/export/walletfile")
        .then(res => {
          if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
            ipcRenderer.send("export-file-dialog", res.data.Result.Wallet, 'Wallet');
          }
          ipcRenderer.once("export-finished", () => {
            if (cb) {
              console.log(cb);
              cb();
            } else {
              Vue.prototype.$message.$message({
                message: "Export Success!",
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
          Vue.prototype.$message.$message({
            message: "Export Success!",
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