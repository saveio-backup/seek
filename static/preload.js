import axios from "axios";
import api from "../src/renderer/assets/config/api";
import failedPage from "./html/failed/failed";
import fs from "fs";
import { ipcRenderer } from "electron";
const remote = require('@electron/remote')
const Version = "00";
const thirdPageUid = {};
ipcRenderer.on("will-load-thirdpage", (event, url, uuid, loadViewId) => {
	const loadView = remote.getCurrentWindow().views.find(item => item.browserView.id === loadViewId);
	loadThirdPage(url, uuid, loadView);
});
ipcRenderer.on("will-cancel-downloadpage", (event, url) => {
	console.log("get will-cancel-downloadpage !!!!!!");
	cancelDownload(url);
});
class Seek {
	constructor() {}
	static getAccount() {
		return new Promise((resolve, reject) => {
			axios
				.get(api.account)
				.then(res => {
					resolve(res.data);
				})
				.catch(err => {
					reject(err);
				});
		});
	}
	static preExecNativeContract(data) {
		data = JSON.parse(data);
		data.Version = Version;
		return new Promise((resolve, reject) => {
			axios
				.post(api.preexecContract, data)
				.then(res => {
					resolve(res.data);
				})
				.catch(err => {
					reject(err);
				});
		});
	}
	static preExecJsonNativeContract(data) {
		data = JSON.parse(data);
		data.Version = Version;
		return new Promise((resolve, reject) => {
			axios
				.post(api.preexecJsonContract, data)
				.then(res => {
					resolve(res.data);
				})
				.catch(err => {
					reject(err);
				});
		});
	}
	static invokeNativeContract(data, callback) {
		return new Promise((resolve, reject) => {
			const uid = uniqId();
			const viewid = currentView().webContents.id;
			let path = `orderpay/?data=${encodeURIComponent(data)}&channel=${uid}&viewid=${viewid}`;
			this.openComponent({
				path
			});

			// callback &&
      ipcRenderer.on(uid, (event, tx) => {
        resolve(tx);
      });
		});
	}
	static downloadUrl({ path }, callback) {
		if (path.toLowerCase().startsWith("oni://share/")) {
			this.openNewUrl({
				path
			});
			callback({
				Error: 0,
				Desc: ""
			});
		} else {
			callback({
				Error: 90000,
				Desc: "格式不正确"
			});
		}
	}
	static openNewUrl({ path }) {
		let view = remote.getCurrentWindow().views.find(item => item.isActive);
		view.url = path;
		view.onNewUrl(path);
	}
	static openChannel(flag) {
		const path = "seek://Home?exec=openAddChannel";
		let view = remote.getCurrentWindow().views.find(item => item.isActive);
		view.url = path;
		view.onNewUrl(path);
	}
	static openComponent({ path }) {
		remote
			.getCurrentWindow()
			.views.find(item => item.isActive)
			.openComponent(path);
	}
	static openThirdPage(url) {
		remote
			.getCurrentWindow()
			.views.find(item => item.isActive)
			.openThirdPage(url);
	}
	static openNewWindow(url) {
		remote
			.getCurrentWindow()
			.views.find(item => item.isActive)
			.onNewWindow(url);
	}
	static getFilePeerCount(hash) {
		return new Promise((resolve, reject) => {
			axios
				.get(api.dspFilePeersCount + "/" + hash)
				.then(res => {
					resolve(res.data);
				})
				.catch(err => {
					reject(err);
				});
		});
	}
	static getLangSettings() {
		return ipcRenderer.sendSync("getSettings", "lang");
	}
	static getConfigByKey(key) {
		return ipcRenderer.sendSync("getConfigByKey", key);
	}
}

function currentView() {
	return remote.getCurrentWindow().views.find(item => item.isActive);
}

async function loadThirdPage(url, uuid, loadView) {
	let detail = null;
	const localUrlPlugins = ipcRenderer.sendSync("getUsermeta", "LocalUrlPlugins");
	if (localUrlPlugins[url] && localUrlPlugins[url].detail) {
		let { Path, FileName, Url, Id } = localUrlPlugins[url].detail;
		if (fs.existsSync(Path)) {
			ipcRenderer.send("load-third-page", Path, FileName, Id, encodeURIComponent(Url));
			return;
		}
	}
	try {
		detail = await getTransferDetail(url);
	} catch (error) {
		console.log("loadThirdPage throw a error from await");
		console.log(error);
		detail = {
			data: null
		};
	}

	// const view = remote.getCurrentWindow().views.find(item => item.isActive)
	if (detail.data.Result) {
		thirdPageUid[uuid] = true;
		const data = detail.data.Result;
		if (data.Progress >= 0 && data.Progress < 1) {
			// task has exist
			if (data.Status === 0) {
				// but in Pause state
				axios
					.post(api.downloadResume, {
						Ids: [data.Id]
					})
					.then(res => {
						if (res.data.Error === 0) {
							setTimeout(() => {
								loadThirdPage(url, uuid, loadView);
							}, 2000);
						}
					});
			} else {
				// in processing
				loadView.pageLoadProgress = data.Progress; // set load progress
				setTimeout(() => {
					loadThirdPage(url, uuid, loadView);
				}, 2000);
			}
		} else if (data.Progress >= 1) {
			// task has finished
			// render page
			loadView.pageLoadProgress = data.Progress; // set load progress
			try {
				fs.statSync(data.Path);
				ipcRenderer.send("load-third-page", data.Path, data.FileName, data.Id, encodeURIComponent(data.Url));
			} catch (error) {
				console.error(`error ${error}`);
				loadView.pageLoadProgress = 0;
				downloadPage(url, uuid, loadView); // task exist but file not found
			}
		}
	} else if (thirdPageUid[uuid]) {
		console.log(`no result ${url}`);
		delete thirdPageUid[uuid];
		loadView.pageLoadProgress = 0;
		ipcRenderer.send(uuid + "-loadErrorPage", {
			note: "The task has been cancelled."
		});
	} else {
		thirdPageUid[uuid] = true;
		downloadPage(url, uuid, loadView);
	}
}

async function cancelDownload(url) {
	let detail = null;
	try {
		detail = await getTransferDetail(url);
	} catch (error) {
		console.log("loadThirdPage throw a error from await");
		console.log(error);
		detail = {
			data: null
		};
	}
	let Id = null;
	const data = detail.data.Result;
	if (data && data.Progress < 1) {
		Id = data.Id;
		axios
			.post(api.downloadCancel, {
				Ids: [Id]
			})
			.then(res => {
				console.log(res);
			});
	}
}

function downloadPage(url, uuid, loadView) {
	ipcRenderer.send("run-dialog-event", {
		name: "clearDownloadDone"
	});
	axios
		.post(api.download, {
			Url: url,
			MaxPeerNum: ipcRenderer.sendSync("getSettings", "maxPeerNum"),
			SetFileName: true
		})
		.then(res => {
			if (res.data.Error === 0) {
				setTimeout(() => {
					loadThirdPage(url, uuid, loadView);
				}, 2000);
			} else {
				console.log("emit loadErrorPage");
				ipcRenderer.send(uuid + "-loadErrorPage", {
					errorCode: res.data.Error
				});
			}
		});
}

function getTransferDetail(url) {
	const hexUrl = ipcRenderer.sendSync("string-to-hex", url);
	return new Promise((resolve, reject) => {
		axios
			.get(api.transferDetail + `/3/${hexUrl}`)
			.then(res => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			});
	});
}

function uniqId() {
	return Math.round(new Date().getTime() + Math.random() * 100);
}
process.once("loaded", () => {
	global.Seek = Seek;
	// global.ipcRenderer = ipcRenderer;
});
