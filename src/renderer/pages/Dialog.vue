<template>
	<div class="dialogWrapper">
		<export-private-key
			@closeDialog="closeDialog"
			v-if="menuSelector === 'exportPrivateKey'"
		></export-private-key>
		<logout
			@closeDialog="closeDialog"
			v-if="menuSelector === 'logout'"
		></logout>
		<is-create-channel
			@closeDialog="closeDialog"
			v-if="menuSelector === 'createChannel'"
		></is-create-channel>
		<div
			class="downloadDialog"
			v-if="menuSelector === 'downloadDialog'"
		>
			<el-dialog
				width='550px'
				:before-close="closeDialog"
				:close-on-click-modal='false'
				:visible.sync="switchToggle.downloadDialog"
				center
			>
				<div slot="title">
					<h2>New Download</h2>
					<div class="dialog-title-border"></div>
				</div>
				<download-dialog
					:parentDownloadUrl='downloadUrl'
					@closeDialog="closeDialog"
				>
				</download-dialog>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import { ipcRenderer, remote } from "electron";
import exportPrivateKey from "./Dialog/ExportPrivateKey.vue";
import logout from "./Dialog/Logout.vue";
import isCreateChannel from "./Dialog/IsCreateChannel.vue";
import downloadDialog from "../components/DownloadDialog.vue";
export default {
	name: "Dialog",
	components: {
		exportPrivateKey,
		logout,
		isCreateChannel,
		downloadDialog
	},
	data() {
		const COUNT_INTERVAL = 5000;
		return {
			switchToggle: {
				downloadDialog: true
			},
			menuSelector: "",
			win: null,

			channelNum: null,
			Balance: null,
			intervalObj: {
				COUNT_INTERVAL: COUNT_INTERVAL,
				setTimeObj: null,
				setTimeAddressObj: null,
				setTimeProcessObj: null,
				setTimeTransferObj: null
			},
			Address: "",
			// Progress: 0,
			downloadUrl: "", // downloadDialog url
			isNeedSync: false,
			// transfer correlation
			transferObj: {

			},
			setTimeoutObj: {
				upload: null,
				download: null,
				complete: null
			},
			readyUpload: []
		};
	},
	computed: {
		// uploading file
		uploadingTransferList() {
			return this.$store.state.Transfer.uploadingTransferList || [];
		},
		// uploading file list add wait for upload file list
		uploadTransferList: function() {
			let arr = this.$store.state.Transfer.uploadTransferList || [];
			return arr;
		},
		// downloading file list
		downloadTransferList: function() {
			let arr = this.$store.state.Transfer.downloadTransferList || [];
			this.rendToFileManage({
				type: 'downloadList',
				result: arr
			});
			return arr;
		},
		// complete transfer file list
		completeTransferList: function() {
			let arr = this.$store.state.Transfer.completeTransferList || [];
			this.rendToFileManage({
				type: 'completeList',
				result: arr
			});
			return arr;
		},
		// wait for upload file list
		waitForUploadList: function() {
			let arr = this.$store.state.Transfer.waitForUploadList || [];
			return arr;
		},
		waitForUploadOrderList: function() {
			return this.$store.state.Transfer.waitForUploadOrderList || [];
		},
		localStatus: function() {
			return this.$store.state.Transfer.localStatus;
		},
		realUploadingLength: function() {
			return this.$store.state.Transfer.realUploadingLength;
		}
	},
	mounted() {
		ipcRenderer.on("setSelector", (e, selector) => {
			this.menuSelector = selector;
			this.$forceUpdate();
		});
		ipcRenderer.on("setDownloadUrl", (e, url) => {
			this.downloadUrl = url;
		});
		ipcRenderer.on("runDialogEvent", (e, {name, data}) => {
			// this.downloadUrl = url;
			this[name](data);
		});
		localStorage.setItem("DNSAdress", "");
		this.isNeedCreateChannel();
	},
	watch: {
		uploadingTransferList(val, oldVal) {
			if(this.realUploadingLength < this.$config.maxNumUpload) {
				this.waitForUploadFileToUpload();
			}
			this.rendToFileManage({
				type: 'uploadList',
				result: val
			});
		},
		Address(newVal, oldVal) {
			this.Balance = null;
			this.channelNum = null;
			localStorage.setItem("DNSAdress", "");
			// this.getProcess();
			if(newVal != '') {
				this.getPollingData();
			} else {
				clearInterval(this.intervalObj.setTimeObj);
			}
		},
		Balance(newVal, oldVal) {
			if (!oldVal && newVal && this.channelNum === 0) {
				this.toGetDns()
			}
		},
		channelNum(newVal, oldVal) {
			if (this.Balance && newVal === 0 && oldVal === null) {
				this.toGetDns()
			}
		},
		uploadTransferList(newVal, oldVal) {
			clearTimeout(this.setTimeoutObj.upload);
			this.setTimeoutObj.upload = setTimeout(() => {
				for (let value of newVal) {
					this.transferObj[value.Id] = value;
				}
			}, 50);
		},
		downloadTransferList(newVal, oldVal) {
			clearTimeout(this.setTimeoutObj.download);
			this.setTimeoutObj.download = setTimeout(() => {
				for (let value of newVal) {
					this.transferObj[value.Id] = value;
				}
			}, 50);
		},
		completeTransferList(newVal, oldVal) {
			clearTimeout(this.setTimeoutObj.complete);
			let haveComplete = false;
			this.setTimeoutObj.complete = setTimeout(() => {
				for (let value of newVal) {
					if (
						value.Id &&
						this.transferObj[value.Id] &&
						this.transferObj[value.Id].Status !== 3
					) {
						this.message({
							info: `${value.FileName} ${
								this.transferObj[value.Id].Type === 1
									? "Upload Success"
									: "Download Success"
							}`,
							type: "success"
						});
						haveComplete = true;
					}
					if(haveComplete) {
						this.$store.dispatch("setSpace");
					}
					this.transferObj[value.Id] = value;
				}
			}, 50);
		},
		waitForUploadList(val, oldVal) {
			this.rendToFileManage({
				type: 'waitForUploadList',
				result: val
			});
		},
		waitForUploadOrderList(val, oldVal) {
			this.rendToFileManage({
				type: 'waitForUploadOrderList',
				result: val
			});
		},
		localStatus(val, oldVal) {
			this.rendToFileManage({
				type: 'localStatus',
				result: val
			});
		},
		realUploadingLength(val, oldVal) {
			this.rendToFileManage({
				type: 'realUploadingLength',
				result: val
			});
		}
	},
	methods: {
		getStartWaitForUploadPromise(arr) {
			// to upload
			const commitAll = []; // will to upload file promise 
			for (let file of arr) {
				commitAll.push(this.getToUploadFilePromise(file));
			}
			return commitAll;
		},
		waitForUploadFileToUpload() {
			let needUploadLen = this.$config.maxNumUpload - this.realUploadingLength;
			if(this.waitForUploadOrderList.length === 0 || this.readyUpload.length !== 0 || needUploadLen <= 0) return;
			// update readyUpload
			let realUploadLen = Math.min(needUploadLen, this.waitForUploadOrderList.length);
			this.readyUpload = this.waitForUploadOrderList.slice(0, realUploadLen);

			// get upload list in the waitForUploadList
			let filterWaitForUploadList = this.waitForUploadList.filter(item => {
				return this.readyUpload.indexOf(item.Id) !== -1;
			})
			// get upload list in the waitForUploadList
			let filterUploadingList = this.uploadingTransferList.filter(item => {
				return this.readyUpload.indexOf(item.Id) !== -1;
			});

			let commitAll = [];
			commitAll.concat(this.getStartWaitForUploadPromise(filterWaitForUploadList));
			commitAll.concat(this.getContinueUploadPromise(filterUploadingList));
			this.toStartUpload(commitAll);
		},
		toStartUpload(commitAll) {
			const vm = this;
			this.$axios.all(commitAll).then(resArr => {
				let newWaitForList = this.waitForUploadList.filter(item => {
					return this.readyUpload.indexOf(item.Id) < 0
				})
				this.$store.dispatch('setUpload');
				this.$store.commit('SET_WAIT_FOR_UPLOAD_LIST', newWaitForList);
				this.$store.commit('REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST', this.readyUpload);
				this.$store.commit('REMOVE_UPLOADING', this.readyUpload);
				this.$store.commit('REMOVE_PAUSING', this.readyUpload);
				this.rendToFileManage({
					type: 'localStatus',
					result: vm.localStatus
				});

				// to do: wait for 2s for wait for get upload file done
				setTimeout(() => {
					this.readyUpload = [];
				}, 2000);
				
				// error message
				let errorArr = [];
				let errorMsg = '';
				for (let value of resArr) {
					if (value.Error !== 0) {
						errorMsg += `<p>`;
						errorMsg += `${value.FileName || ""}`;
						errorMsg += this.$i18n.error[value.Error]
							? this.$i18n.error[value.Error][this.$language]
							: `error code is ${value.Error}`;
						errorMsg += `</p>`;
					}
				}
				if(errorMsg !== "") {
					this.message({
						info: errorMsg,
						type: "error",
						dangerouslyUseHTMLString: true
					});
				}
			})
		},
		getContinueUploadPromise(arr) {
			const commitAll = [];
			let continueArr = [];
			let retryArr = []
			for(let value of arr) {
				if(value.Status === 4) {
					retryArr.push(value.Id);
				} else {
					continueArr.push(value.Id);
				}
			}
			if(retryArr.length > 0) {
				let params = {
					Ids: retryArr
				}
				commitAll.push(
					this.$axios.post(this.$api.uploadRetry, params)
				)
			}
			if(continueArr.length > 0) {
				let params = {
					Ids: continueArr
				}
				commitAll.push(
					this.$axios.post(this.$api.uploadResume, params)
				)
			}
			return commitAll;
		},
		getToUploadFilePromise(data) {
			return this.$axios.post(this.$api.upload, data);
		},
		toGetDns() {
			this.$axios
				.get(this.$api.getAllDns)
				.then(res => {
					if (res.Error === 0) {
						if(res.Result.length > 0) {
							ipcRenderer.send("dialog-open", "createChannel");
						}
					}
				});
		},
		closeDialog({ timeout = 0 }) {
			this.menuSelector = "";
			if (timeout === 0) {
				ipcRenderer.send("dialog-close");
			} else {
				setTimeout(() => {
					ipcRenderer.send("dialog-close");
				}, timeout);
			}
		},
		// is not need create channel
		isNeedCreateChannel() {
			clearInterval(this.intervalObj.setTimeAddressObj);
			this.getAddress();
			this.intervalObj.setTimeAddressObj = setInterval(() => {
				this.getAddress();
			}, this.intervalObj.COUNT_INTERVAL);
		},
		// get wallet address
		getAddress() {
			this.$axios.get(this.$api.account).then(async res => {
				if (res.Error === 0) {
					if (res.Result.Address) {
						this.Address = res.Result.Address;
						this.renderDateToBrowserView({ result: res.Result, type: "account", rendTo: 1 });
					}
				} else {
					this.Address = '';
					this.renderDateToBrowserView({ result: res.Result, type: "account", rendTo: 1 });
				}
			});
		},
		// get current sync process
		getProcess() {
			// clearInterval(this.intervalObj.setTimeProcessObj);
			// this.intervalObj.setTimeProcessObj = setInterval(() => {
				this.$axios.get(this.$api.channelInitProgress).then(progressResult => {
					if (progressResult.Error === 0) {
						if(progressResult.Result.End - progressResult.Result.Now > 50) {
							progressResult.Result.isSync = true;
						} else {
							this.isNeedSync = false;
							progressResult.Result.isSync = false;
						}
						if(progressResult.Result.End - progressResult.Result.Now > 100000) {
							this.isNeedSync = true;
							progressResult.Result.isNeedSync = this.isNeedSync;
						} else {
							progressResult.Result.isNeedSync = this.isNeedSync;
						}
						this.renderDateToBrowserView({ result: progressResult.Result, type: "progress", rendTo: 1 });
					}
				});
			// }, this.intervalObj.COUNT_INTERVAL);
		},
		// get balance for show create channel dialog
		getBalance() {
			const vm = this;
			this.$axios.get(this.$api.balance + "/" + this.Address).then(res => {
				if (res.Error === 0) {
					this.renderDateToBrowserView({ result: res.Result, type: "balance" });
					for (let i = 0; i < res.Result.length; i++) {
						const item = res.Result[i];
						if (item.Symbol === "SAVE") {
							vm.Balance = item.Balance;
							break;
						}
					}
				}
			});
		},
		// get revenue
		getRevenue() {
			this.$axios
				.get(this.$api.revenue, {
					timeout: (this.$config.outTime * 5000 + 15000)
				})
				.then(res => {
					if (res.Error === 0) {
						this.renderDateToBrowserView({
							result: res.Result,
							type: "revence"
						});
					}
				});
		},
		// get channel
		getChannel() {
			this.$axios
				.get(this.$api.channel, {
					timeout: (this.$config.outTime * 5000 + 15000)
				})
				.then(res => {
					if (res.Error === 0) {
						this.renderDateToBrowserView({
							result: res.Result,
							type: "channel"
						});
						if (
							res.Result &&
							res.Result.Channels &&
							res.Result.Channels.length > 0
						) {
							this.channelNum = res.Result.Channels.length;
							// clearInterval(this.intervalObj.setTimeObj);
							// return;
						}
						this.channelNum =
							res.Result && res.Result.Channels && res.Result.Channels.length;
					}
				});
		},
		// get connect state
		getState() {
			this.$axios
				.get(this.$api.networkStatus)
				.then(res => {
					if (res.Error === 0) {
						this.renderDateToBrowserView({
							result: res.Result,
							type: "state",
							rendTo: 1
						});
					}
				})
				.catch(e => {
					let result = {
						ChainState: 0,
						DNSState: 0,
						DspProxyState: 0,
						ChannelProxyState: 0
					};
					this.renderDateToBrowserView({
						result: result,
						type: "state",
						rendTo: 1
					});
				})
		},
		/**
		 * params:
		 * rendTo: send to type 
		 * 				description: 1: browserView and browserWindow 
		 * 										 0: browserView
		 */
		getArr() {
			let arr = [];
			let views = {};
			//  remote.BrowserWindow.getAllWindows()[0].views;
			for(let win of remote.BrowserWindow.getAllWindows()) {
				if(win.views) {
					views = win.views;
				}
			}
			for (let view of views) {
				if (view.displayURL.indexOf("seek://") === 0) {
					arr.push(view.browserView.webContents.id);
				}
			}
			return arr;
		},
		/**
		 * params:
		 * result: send data
		 * type: data type
		 * rendTo: send to type 
		 * 				description: 1: browserView and browserWindow 
		 * 										 0: browserView
		 */
		renderDateToBrowserView({ result, type, rendTo = 0 }) {
			let arr = this.getArr(rendTo);
			for (let value of arr) {
				ipcRenderer.sendTo(value, "get-data", { result, type, page: 'tab' });
			}
			let arrWin = remote.BrowserWindow.getAllWindows();
			for(let win of arrWin) {
				if(win.webContents.getURL().indexOf("/#/navigation") > 0) {
					if(rendTo === 1) {
						let winRender = Object.assign({}, result, {type: 'windowRender'});//browserWindow render type is windowRender,browserView render type is browserView || undefined
						let winContentId = win.webContents.id;
						ipcRenderer.sendTo(winContentId, "get-data", { result:winRender, type });
					}
				} else {
					let winRender = Object.assign({}, result, {type: 'windowRender'});//browserWindow render type is windowRender,browserView render type is browserView || undefined
					let winContentId = win.webContents.id;
					ipcRenderer.sendTo(winContentId, "get-data", { result:winRender, type });
				}
			}
		},
		// get channel、balance、revenue list data and check have channel and wallet money
		getPollingData() {
			this.getTransferPollData();

			clearInterval(this.intervalObj.setTimeObj);
			this.getProcess();
			this.getChannel();
			this.getBalance();
			this.getRevenue();
			this.getState();
			this.intervalObj.setTimeObj = setInterval(() => {
				this.getProcess();
				this.getChannel();
				this.getBalance();
				this.getRevenue();
				this.getState();
			}, this.intervalObj.COUNT_INTERVAL);
		},
		getTransferPollData() {
			this.$store.dispatch("getWaitForUploadList"); // get wait for upload list
			this.$store.dispatch("setUpload");
			this.$store.dispatch("setDownload");
		},
		getWin() {
			let arrWin = remote.BrowserWindow.getAllWindows();
			for(let winItem of arrWin) {
				if(winItem.webContents.getURL().indexOf("/#/navigation") > 0) {
					this.win = winItem
				}
			}
		},
		rendToFileManage({ result, type }) {
			if(!this.win) {
				this.getWin();
			}
			let views = {}
			//  remote.BrowserWindow.getAllWindows()[0].views;
			for(let win of remote.BrowserWindow.getAllWindows()) {
				if(win.views) {
					views = win.views;
				}
			}
			
			let activeView = views.find(view => view.displayURL.toLowerCase().startsWith('seek://filemanager'));
			if(!activeView) return;
			 let winContentId = activeView.webContents.id;
			 ipcRenderer.sendTo(winContentId, 'get-data', {result, type})
		},
		// rendTo active browser display message
		message({ info, type, dangerouslyUseHTMLString }) {
			// let views = this.win.views;
			let views = {}
			//  remote.BrowserWindow.getAllWindows()[0].views;
			for(let win of remote.BrowserWindow.getAllWindows()) {
				if(win.views) {
					views = win.views;
				}
			}

			let activeView = views.find(view => view.isActive);
			const webContentsId = activeView.browserView.webContents.id;
			ipcRenderer.sendTo(webContentsId, "current-active-show-message", {
				info,
				type,
				dangerouslyUseHTMLString
			});
		},
		setUpload() {
			this.$store.dispatch("setUpload");
		},
		setDownload() {
			this.$store.dispatch("setDownload");
		},
		setComplete() {
			this.$store.dispatch("setComplete");
		},
		setWaitForUploadList(data) {
			this.$store.commit('GET_WAIT_FOR_UPLOAD_LIST', data);
		},

		/**
		 * params:
		 * data(type array): 
		 */
		pushWaitForUploadOrderList(data) {
			this.$store.commit('PUSH_WAIT_FOR_UPLOAD_ORDER_LIST', data);
		},
		unshiftWaitForUploadOrderList(data) {
			this.$store.commit('UNSHIFT_WAIT_FOR_UPLOAD_ORDER_LIST', data);
		},
		removeWaitForUploadOrderList(data) {
			this.$store.commit('REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST', data);
		},
		addPausing(data) {
			this.$store.commit('ADD_PAUSING', data);
		},
		removePausing(data) {
			this.$store.commit('REMOVE_PAUSING', data);
		},
		addUploading(data) {
			this.$store.commit('ADD_UPLOADING', data);
		},
		removeUploading(data) {
			this.$store.commit('REMOVE_UPLOADING', data);
		},
		settingUpdate(data) {
			this.__proto__.__proto__.$config.maxNumUpload = data.maxNumUpload;
			let remoteUploadingList = [];
			for(let value of this.uploadTransferList) {
				if(value.Id.indexOf('waitfor_') !== 0) {
					if(value.Status === 1 || value.Status === 2) {
						remoteUploadingList.push(value.Id)
					}
				}
			}
			if(remoteUploadingList.length > this.$config.maxNumUpload) {
				let pauseList = remoteUploadingList.splice(this.$config.maxNumUpload);
				this.addUploading(pauseList);
				this.unshiftWaitForUploadOrderList(pauseList);
				this.toPause(pauseList);
			}
		},
		toPause(arr) {
			const vm = this;
			let params = {
				Ids: arr
			}
			this.$axios.post(this.$api.uploadPause, params, {
				timeout: (this.$config.outTime * 2000 + 18000) * params.Ids.length
			})
			.finally(res => {
				vm.rendToFileManage({
					type: 'localStatus',
					result: vm.localStatus
				});
			})
		}
	}
};
</script>

<style scoped>
.dialogWrapper {
	width: 100%;
	height: 100%;
}
.downloadDialog {
	width: 100%;
	height: 100%;
}
</style>
