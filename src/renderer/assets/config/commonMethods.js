import { ipcRenderer } from "electron";
const remote = require('@electron/remote')
import { version, clientUrl } from "../../../../package.json";
const PLANTFORM_TO_NUMBER_STRING = {
	win32: "1",
	drawin: "2",
	linux: "3"
};
const methods = {
	activeMessage({ info, type }) {
		let views = remote.getCurrentWindow().views;
		let activeView = views.find(view => view.isActive);
		const webContentsId = activeView.browserView.webContents.id;
		ipcRenderer.sendTo(webContentsId, "current-active-show-message", {
			info: info,
			type: type
		});
	},
	install(Vue) {
		Vue.prototype.$exportWallet = function(event, cb) {
			console.log("event, cb");
			console.log(event, cb);
			Vue.prototype.$axios
				.get(Vue.prototype.$api.account + "/export/walletfile")
				.then(res => {
					if (res.Error === 0) {
						ipcRenderer.send("export-file-dialog", res.Result.Wallet, "keystore");
						ipcRenderer.once("export-finished", () => {
							if (cb) {
								cb();
							} else {
								// vm.activeMessage({
								//   info: Vue.prototype.$t('dialog.exportSuccess'),
								//   type: "success"
								// });
							}
						});
					}
				})
				.catch(err => {
					console.error(err);
				});
		};
		Vue.prototype.$exportFile = function(contents, fileName, cb) {
			ipcRenderer.send("export-file-dialog", contents, fileName);
			ipcRenderer.once("export-finished", () => {
				if (cb) {
					cb();
				}
				// else {
				//   vm.activeMessage({
				//     info: "Export Success!",
				//     type: "success"
				//   });
				// }
			});
		};
		Vue.prototype.$exportPrivatekey = function() {
			// Vue.prototype.$axios
			// .get(Vue.prototype.$api.account + "/export/private")
		};
		Vue.prototype.$download = function(data, config) {
			ipcRenderer.send("run-dialog-event", {
				name: "clearDownloadDone"
			});
			return new Promise((resolve, reject) => {
				Vue.prototype.$axios
					.post(Vue.prototype.$api.download, data, config)
					.then(res => {
						resolve(res);
					})
					.catch(err => {
						reject(err);
					});
			});
		};
		Vue.prototype.$checkClientVersion = function() {
			// TODO while no account , it return no dsp
			return new Promise(async (resolve, reject) => {
				await Vue.prototype.$axios
					.post(Vue.prototype.$api.pluginQuery, {
						Url: clientUrl,
						Platform: PLANTFORM_TO_NUMBER_STRING[process.platform]
					})
					.then(res => {
						if (res.Error === 0) {
							const result = res.Result;
							if (version < result.Version) {
								console.log("res.Result is");
								console.log(JSON.stringify(res.Result));
								localStorage.setItem("lastVersion", JSON.stringify(res.Result));
								console.log("localSorgage lastVersion is");
								console.log(localStorage.getItem("lastVersion"));
								resolve(res.Result);
							} else {
								console.log("当前版本大于接口返回版本");
								localStorage.setItem("lastVersion", "{}");
								resolve(res.Result);
							}
						} else {
              console.log('Return No Dsp')
							localStorage.setItem("lastVersion", "{}");
							resolve(res.Result);
							resolve(null);
						}
					})
					.catch(() => {
						reject(null);
					});
			});
		};
	}
};
export default methods;
