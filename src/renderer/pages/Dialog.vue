<template>
	<div class="dialogWrapper">
		<export-private-key
			@closeDialog="closeDialog"
			v-if="menuSelector === 'exportPrivateKey'"
		></export-private-key>
		<logout
			@closeDialog="closeDialog"
			@logoutCb="logoutCb"
			v-if="menuSelector === 'logout'"
		></logout>
		<is-create-channel
			@closeDialog="closeDialog"
			v-if="menuSelector === 'createChannel'"
		></is-create-channel>
		<channel-lose-efficacy
			@closeDialog="closeDialog"
			v-if="menuSelector === 'channelLoseEfficacy'"
		></channel-lose-efficacy>
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
					<h2>{{$t('dialog.newDownload')}}</h2>
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
import channelLoseEfficacy from "./Dialog/ChannelLoseEfficacy.vue";
import downloadDialog from "../components/DownloadDialog.vue";
// import io from 'socket.io-client';
export default {
	name: "Dialog",
	components: {
		exportPrivateKey,
		logout,
		isCreateChannel,
		downloadDialog,
		channelLoseEfficacy
	},
	data() {
		const COUNT_INTERVAL = 5000;
		return {
			switchToggle: {
				downloadDialog: true
			},

			menuSelector: "",
			// current main browserWindow
			win: null,
			downloadUrl: "", // downloadDialog url
			usable: true,

			// polling data
			channelNum: null,
			Balance: null,
			Address: "",
			intervalObj: {
				COUNT_INTERVAL: COUNT_INTERVAL,
				setTimeObj: null,
				setTimeAddressObj: null,
				setTimeProcessObj: null,
				setTimeTransferObj: null,
				setTimeUploadingTransferListObj: null,
				setTimeDownloadingTransferListObj: null,
				setTimelocalStatusObj: null
			},

			isNeedSync: false,

			// transfer correlation
			transferObj: {},
			setTimeoutObj: {
				upload: null,
				download: null,
				complete: null
			},
			maxNumUpload: 0,
			isNotDonePause: true,
			isNotDonePause2: true,

			// ready upload list
			readyUpload: [],
			readyDownload: [],
			websock: null,
			wsOpeation: {
				reconnectNumber: 0,
				setIntervalObj: null,
				errorTimeout: null
			},
			// for force update data ↓
			uploadingTransferListForce: 0,
			downloadingTransferListForce: 0
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
		// downloading file
		downloadingTransferList() {
			return this.$store.state.Transfer.downloadingTransferList || [];
		},
		// downloading file list
		downloadTransferList: function() {
			let arr = this.$store.state.Transfer.downloadTransferList || [];
			return arr;
		},
		// complete transfer file list
		completeTransferList: function() {
			let arr = this.$store.state.Transfer.completeTransferList || [];
			this.rendToFileManage({
				type: "completeList",
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
		},

		// wait for download file list
		waitForDownloadList: function() {
			let arr = this.$store.state.Transfer.waitForDownloadList || [];
			return arr;
		},
		waitForDownloadOrderList: function() {
			return this.$store.state.Transfer.waitForDownloadOrderList || [];
		},
		realDownloadingLength: function() {
			return this.$store.state.Transfer.realDownloadingLength;
		},
		downloadProgressTotal() {
			return this.$store.state.Transfer.downloadProgressTotal;
		},
		downloadProgressDone() {
			return this.$store.state.Transfer.downloadProgressDone;
		},
		uploadProgressTotal() {
			return this.$store.state.Transfer.uploadProgressTotal;
		},
		uploadProgressDone() {
			return this.$store.state.Transfer.uploadProgressDone;
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
		ipcRenderer.on("runDialogEvent", (e, { name, data }) => {
			// this.downloadUrl = url;
			this[name](data);
		});
		localStorage.setItem("DNSAdress", "");
		// this.isNeedCreateChannel();
		this.initWebSocket();
	},
	watch: {
		downloadProgressTotal(val) {
			this.rendToFileManage({
				type: "downloadProgressTotal",
				result: val
			});
		},
		downloadProgressDone(val) {
			this.rendToFileManage({
				type: "downloadProgressDone",
				result: val
			});
		},
		uploadProgressTotal(val) {
			this.rendToFileManage({
				type: "uploadProgressTotal",
				result: val
			});
		},
		uploadProgressDone(val) {
			this.rendToFileManage({
				type: "uploadProgressDone",
				result: val
			});
		},
		uploadingTransferListForce(val) {
			clearTimeout(this.intervalObj.setTimeUploadingTransferListObj);
			this.intervalObj.setTimeUploadingTransferListObj = setTimeout(() => {
				if (this.realUploadingLength < this.$config.maxNumUpload) {
					this.waitForUploadFileToUpload();
				}
			}, 200);
		},
		downloadingTransferListForce(val) {
			clearTimeout(this.intervalObj.setTimeDownloadingTransferListObj);
			this.intervalObj.setTimeDownloadingTransferListObj = setTimeout(() => {
				if (this.realDownloadingLength < this.$config.maxNumUpload) {
					this.waitForDownloadFileToDownload();
				}
			}, 200);
		},
		uploadingTransferList(val, oldVal) {
			clearTimeout(this.intervalObj.setTimeUploadingTransferListObj);
			this.intervalObj.setTimeUploadingTransferListObj = setTimeout(() => {
				if (this.realUploadingLength < this.$config.maxNumUpload) {
					this.waitForUploadFileToUpload();
				}
				this.rendToFileManage({
					type: "uploadList",
					result: val
				});
			}, 200);
		},
		downloadingTransferList(val, oldVal) {
			clearTimeout(this.intervalObj.setTimeDownloadingTransferListObj);
			this.intervalObj.setTimeDownloadingTransferListObj = setTimeout(() => {
				if (this.realDownloadingLength < this.$config.maxNumUpload) {
					this.waitForDownloadFileToDownload();
				}
				this.rendToFileManage({
					type: "downloadList",
					result: val
				});
			}, 200);
		},
		Address(newVal, oldVal) {
			this.Balance = null;
			this.channelNum = null;
			localStorage.setItem("DNSAdress", "");
			if(!newVal) return;
			this.$store.dispatch("getWaitForTransferList");
			this.$store.dispatch("getTransferProgressList");
		},
		Balance(newVal, oldVal) {
			if (!oldVal && newVal && this.channelNum === 0) {
				this.toGetDns();
			}
		},
		channelNum(newVal, oldVal) {
			if (this.Balance && newVal === 0 && oldVal === null) {
				this.toGetDns();
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
			const vm = this;
			clearTimeout(this.setTimeoutObj.download);
			this.setTimeoutObj.download = setTimeout(() => {
				for (let value of newVal) {
					vm.transferObj[value.Id] = value;
				}
			}, 50);
		},
		completeTransferList(newVal, oldVal) {
			const vm = this;
			clearTimeout(this.setTimeoutObj.complete);
			this.setTimeoutObj.complete = setTimeout(() => {
				let justNowCompleteObj = {};
				for (let value of newVal) {
					if (
						value.Id &&
						this.transferObj[value.Id] &&
						this.transferObj[value.Id].Status !== 3
					) {
						this.message({
							info: `${value.FileName} ${
								this.transferObj[value.Id].Type === 1
									? vm.$t("dialog.uploadSuccess")
									: vm.$t("dialog.downloadSuccess")
							}`,
							type: "success"
						});
						if(this.transferObj[value.Id].Type === 1) {
							vm.addUploadProgressDone(vm.transferObj[value.Id].RealFileSize);
							if(vm.realUploadingLength === 0 && vm.readyUpload.length === 0) {
								vm.clearUploadProgress();
							}
						} else {
							vm.addDownloadProgressDone(vm.transferObj[value.Id].FileSize);
							if(vm.realDownloadingLength === 0 && vm.readyDownload.length === 0) {
								vm.clearDownloadProgress();
							}
						}
					}
					this.transferObj[value.Id] = value;
				}
			}, 50);
		},
		waitForUploadList(val, oldVal) {
			this.rendToFileManage({
				type: "waitForUploadList",
				result: val
			});
		},
		waitForUploadOrderList(val, oldVal) {
			this.rendToFileManage({
				type: "waitForUploadOrderList",
				result: val
			});
		},
		waitForDownloadList(val, oldVal) {
			this.rendToFileManage({
				type: "waitForDownloadList",
				result: val
			});
		},
		waitForDownloadOrderList(val, oldVal) {
			this.rendToFileManage({
				type: "waitForDownloadOrderList",
				result: val
			});
		},
		localStatus(val, oldVal) {
			this.rendToFileManage({
				type: "localStatus",
				result: val
			});
		},
		realUploadingLength(val, oldVal) {
			this.rendToFileManage({
				type: "realUploadingLength",
				result: val
			});
		},
		realDownloadingLength(val, oldVal) {
			this.rendToFileManage({
				type: "realDownloadingLength",
				result: val
			});
		}
	},
	methods: {
		// init ws
		initWebSocket() {
			// clear heart beat interval
			clearInterval(this.wsOpeation.setIntervalObj);
			// init ws
			const wsuri = "ws://127.0.0.1:10339";
			this.websock = new WebSocket(wsuri);
			this.websock.onmessage = this.websocketonmessage;
			this.websock.onopen = this.websocketonopen;
			this.websock.onerror = this.websocketonerror;
			this.websock.onclose = this.websocketclose;
		},
		// ws connect success
		websocketonopen() {
			this.wsOpeation.reconnectNumber = 0;
			let actions = { Action: "subscribe" };
			this.websocketsend(JSON.stringify(actions));
			// add heart beat;
			clearInterval(this.wsOpeation.setIntervalObj);
			this.wsOpeation.setIntervalObj = setInterval(() => {
				const hreatbeat = { Action: "heartbeat" };
				this.websocketsend(JSON.stringify(hreatbeat));
			}, 180000);
		},
		// ws connect again
		websocketonerror(e) {
			console.log("error connect", e);
			// if (this.wsOpeation.reconnectNumber) this.wsOpeation.reconnectNumber = 0;
			this.wsOpeation.errorTimeout = setTimeout(() => {
				console.log(`it's ${++this.wsOpeation.reconnectNumber}th reconnet`);
				this.initWebSocket();
			}, 3000);
		},
		// get data from server
		websocketonmessage(e) {
			const redata = JSON.parse(e.data);
			console.log(redata);
			switch (redata.Action) {
				case "channelinitprogress":
					this.getProcess(redata);
					break;
				case "getallchannels":
					this.getChannel(redata);
					break;
				case "getbalance":
					this.getBalance(redata);
					break;
				case "getfilesharerevenue":
					this.getRevenue(redata);
					break;
				case "networkstate":
					this.getState(redata);
					break;
				case "currentchannel":
					this.getCurrentChannel(redata);
					break;
				case "getuserspace":
					this.getuserspace(redata);
					break;
				case "getcurrentaccount":
					this.getAddress(redata);
					break;
				case "gettransferlist":
					this.gettransferlist(redata);
					break;
			}
		},
		// send data to server
		websocketsend(Data) {
			this.websock.send(Data);
		},
		// close ws
		websocketclose(e) {
			console.log("close connect", e);
			clearInterval(this.wsOpeation.setIntervalObj);
			console.log(`it's ${++this.wsOpeation.reconnectNumber}th reconnet`);
			clearTimeout(this.wsOpeation.errorTimeout);
			setTimeout(() => {
				this.initWebSocket();
			}, 3000);
		},
		// get wait for upload promise list
		getStartWaitForUploadPromise(arr) {
			// to upload
			const commitAll = []; // will to upload file promise
			for (let file of arr) {
				commitAll.push(this.getToUploadFilePromise(file));
			}
			return commitAll;
		},
		// wait for upload file to upload when max Upload length gt current Uploading length
		waitForUploadFileToUpload() {
			const vm = this;
			let needUploadLen = this.$config.maxNumUpload - this.realUploadingLength;
			if (
				this.waitForUploadOrderList.length === 0 ||
				this.readyUpload.length !== 0 ||
				needUploadLen <= 0
			)	return;
			// update readyUpload
			let realUploadLen = Math.min(
				needUploadLen,
				this.waitForUploadOrderList.length
			);
			this.readyUpload = this.waitForUploadOrderList.slice(0, realUploadLen);

			// get upload list in the waitForUploadList
			let filterWaitForUploadList = this.waitForUploadList.filter(item => {
				return this.readyUpload.indexOf(item.Id) !== -1;
			});
			// get upload list in the uploadingList
			let filterUploadingList = this.uploadingTransferList.filter(item => {
				return this.readyUpload.indexOf(item.Id) !== -1;
			});

			let commitAll = [];
			commitAll = commitAll.concat(
				vm.getStartWaitForUploadPromise(filterWaitForUploadList)
			);
			commitAll = commitAll.concat(vm.getContinueUploadPromise(filterUploadingList));
			if(commitAll.length === 0) {
				vm.$store.commit(
					"REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST",
					vm.readyUpload
				);
				vm.$nextTick(() => {
					vm.readyUpload = [];
				});
				return;
			}
			this.toStartUpload(commitAll);
		},
		// to upload and callback
		toStartUpload(commitAll) {
			const vm = this;
			this.$axios.all(commitAll).then(resArr => {
				let newWaitForList = vm.waitForUploadList.filter(item => {
					return vm.readyUpload.indexOf(item.Id) < 0;
				});
				let newUploadFiles = vm.waitForUploadList.filter(item => {
					return vm.readyUpload.indexOf(item.Id) >= 0;
				});
				// wait for 1s for wait for get upload file done
				vm.$nextTick(() => {
					vm.$store.commit("SET_WAIT_FOR_UPLOAD_LIST", newWaitForList);
					vm.$store.commit(
						"REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST",
						vm.readyUpload
					);
					vm.$store.commit("REMOVE_UPLOADING", vm.readyUpload);
					vm.$store.commit("REMOVE_PAUSING", vm.readyUpload);
					// this.$store.dispatch("getUpload"); // force update
					vm.uploadingTransferListForce++;
					setTimeout(() => {
						vm.readyUpload = [];
						vm.uploadingTransferListForce++;
					}, 2000);
				});

				// error message
				let errorArr = [];
				let errorMsg = "";
				// TO DO!!!
				let _removeSize = 0; // computed progress total;
				for (let i = 0;i < resArr.length; i ++) {
					let value = resArr[i];
					if (value.Error !== 0) {
						errorMsg += `<p>`;
						errorMsg += `${value.FileName || ""}`;
						errorMsg += vm.$t(`error["${value.Error}"]`);
						errorMsg += `</p>`;
						if(i < newUploadFiles.length) {
							_removeSize += (newUploadFiles[i].RealFileSize || 0);
						}
					}
				}
				if(_removeSize !== 0) {
					vm.removeUploadProgressTotal(_removeSize);
				}
				if (errorMsg !== "") {
					vm.message({
						info: errorMsg,
						type: "error",
						dangerouslyUseHTMLString: true
					});
				}
			});
		},
		// get continue upload promise list
		getContinueUploadPromise(arr) {
			const commitAll = [];
			let continueArr = [];
			let retryArr = [];
			for (let value of arr) {
				if (value.Status === 4) {
					retryArr.push(value.Id);
				} else {
					continueArr.push(value.Id);
				}
			}
			if (retryArr.length > 0) {
				let params = {
					Ids: retryArr
				};
				commitAll.push(this.$axios.post(this.$api.uploadRetry, params));
			}
			if (continueArr.length > 0) {
				let params = {
					Ids: continueArr
				};
				commitAll.push(this.$axios.post(this.$api.uploadResume, params));
			}
			return commitAll;
		},
		// get to upload file ajax promise
		getToUploadFilePromise(data) {
			return this.$axios.post(this.$api.upload, data);
		},

		// get wait for download promise list
		getStartWaitForDownloadPromise(arr) {
			// to download
			const commitAll = []; // will to download file promise
			for (let file of arr) {
				commitAll.push(this.getToDownloadFilePromise(file));
			}
			return commitAll;
		},
		// wait for download file to download when max Download length gt current Downloading length
		waitForDownloadFileToDownload() {
			const vm = this;
			let needDownloadLen =
				this.$config.maxNumUpload - this.realDownloadingLength;
			if (
				this.waitForDownloadOrderList.length === 0 ||
				this.readyDownload.length !== 0 ||
				needDownloadLen <= 0
			)
				return;
			// update readyDownload
			let realDownloadLen = Math.min(
				needDownloadLen,
				this.waitForDownloadOrderList.length
			);
			this.readyDownload = this.waitForDownloadOrderList.slice(
				0,
				realDownloadLen
			);

			// get download list in the waitForDownloadList
			let filterWaitForDownloadList = this.waitForDownloadList.filter(item => {
				return this.readyDownload.indexOf(item.Id) !== -1;
			});
			// get download list in the waitForDownloadList
			let filterDownloadingList = this.downloadingTransferList.filter(item => {
				return this.readyDownload.indexOf(item.Id) !== -1;
			});

			let commitAll = [];
			commitAll = commitAll.concat(
				this.getStartWaitForDownloadPromise(filterWaitForDownloadList)
			);
			commitAll = commitAll.concat(this.getContinueDownloadPromise(filterDownloadingList));
			if(commitAll.length === 0) {
				vm.$store.commit(
					"REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST",
					vm.readyDownload
				);
				vm.$nextTick(() => {
					vm.readyDownload = [];
				});
				return;
			}
			this.toStartDownload(commitAll);
		},
		// to download and callback
		toStartDownload(commitAll) {
			const vm = this;
			this.$axios.all(commitAll).then(resArr => {
				let newWaitForList = vm.waitForDownloadList.filter(item => {
					return vm.readyDownload.indexOf(item.Id) < 0;
				});
				vm.$nextTick(() => {
					vm.$store.commit("SET_WAIT_FOR_DOWNLOAD_LIST", newWaitForList);
					vm.$store.commit(
						"REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST",
						this.readyDownload
					);
					vm.$store.commit("REMOVE_UPLOADING", vm.readyDownload);
					vm.$store.commit("REMOVE_PAUSING", vm.readyDownload);
					vm.downloadingTransferListForce++; // force update
					setTimeout(() => {
						vm.readyDownload = [];
						vm.downloadingTransferListForce++; // force update
					}, 2000);
				});

				// error message
				let errorArr = [];
				let errorMsg = "";
				for (let value of resArr) {
					if (value.Error !== 0) {
						errorMsg += `<p>`;
						errorMsg += `${value.FileName || ""}`;
						errorMsg += vm.$t(`error["${value.Error}"]`);
						errorMsg += `</p>`;
					}
				}
				if (errorMsg !== "") {
					vm.message({
						info: errorMsg,
						type: "error",
						dangerouslyUseHTMLString: true
					});
				}
			});
		},
		// get continue download promise list
		getContinueDownloadPromise(arr) {
			const commitAll = [];
			let continueArr = [];
			let retryArr = [];
			for (let value of arr) {
				if (value.Status === 4) {
					retryArr.push(value.Id);
				} else {
					continueArr.push(value.Id);
				}
			}
			if (retryArr.length > 0) {
				let params = {
					Ids: retryArr
				};
				commitAll.push(this.$axios.post(this.$api.downloadRetry, params));
			}
			if (continueArr.length > 0) {
				let params = {
					Ids: continueArr
				};
				commitAll.push(this.$axios.post(this.$api.downloadResume, params));
			}
			return commitAll;
		},
		// get to download file ajax promise
		getToDownloadFilePromise(data) {
			return this.$axios.post(this.$api.download, data);
		},
		getuserspace(res) {
			if (res.Error === 0) {
				this.rendToFileManage({
					type: "userspace",
					result: res.Result
				});
			}
		},
		gettransferlist(res) {
			if (res.Error === 0) {
				if (res.Result.Type === 0) {
					this.$store.dispatch("setComplete", res);
				} else if (res.Result.Type === 1) {
					this.$store.dispatch("setUpload", res);
				} else if (res.Result.Type === 2) {
					this.$store.dispatch("setDownload", res);
				}
			}
		},
		// open create channel dialog when have channel
		toGetDns() {
			this.$axios.get(this.$api.getAllDns).then(res => {
				if (res.Error === 0) {
					if (res.Result.length > 0) {
						ipcRenderer.send("dialog-open", "createChannel");
					}
				}
			});
		},
		// close dialog
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
		// get wallet address
		getAddress(res) {
			if (res.Error === 0) {
				if (res.Result.Address) {
					this.Address = res.Result.Address;
					this.renderDataToBrowserView({
						result: res.Result,
						type: "account",
						rendTo: 1
					});
				}
			} else {
				this.Address = "";
				this.renderDataToBrowserView({
					result: res.Result,
					type: "account",
					rendTo: 1
				});
			}
		},
		// get current sync process
		getProcess(progressResult) {
			if (progressResult.Error === 0) {
				if (progressResult.Result.End - progressResult.Result.Now > 50) {
					progressResult.Result.isSync = true;
				} else {
					this.isNeedSync = false;
					progressResult.Result.isSync = false;
				}
				if (progressResult.Result.End - progressResult.Result.Now > 100000) {
					this.isNeedSync = true;
					progressResult.Result.isNeedSync = this.isNeedSync;
				} else {
					progressResult.Result.isNeedSync = this.isNeedSync;
				}
				this.renderDataToBrowserView({
					result: progressResult.Result,
					type: "progress",
					rendTo: 1
				});
			}
		},
		// logout success change block height is default;
		logoutCb() {
			this.$nextTick(() => {
				// avoid ws delay issue
				this.renderDataToBrowserView({
					result: {
						isNeedSync: false,
						isSync: false,
						Progress: 0,
						Start: 0,
						End: 0,
						Now: 0
					},
					type: "progress",
					rendTo: 1
				});
				this.renderDataToBrowserView({
					result: {
						Chain: {
							HostAddr: "",
							State: 0,
							UpdatedAt: 0
						},
						DNS: {
							HostAddr: "",
							State: 0,
							UpdatedAt: 0
						},
						DspProxy: {
							HostAddr: "",
							State: 0,
							UpdatedAt: 0
						},
						ChannelProxy: {
							HostAddr: "",
							State: 0,
							UpdatedAt: 0
						}
					},
					type: "progress",
					rendTo: 1
				});
			});
		},
		// get balance for show create channel dialog
		getBalance(res) {
			const vm = this;
			if (res.Error === 0) {
				this.renderDataToBrowserView({ result: res.Result, type: "balance" });
				for (let i = 0; i < res.Result.length; i++) {
					const item = res.Result[i];
					if (item.Symbol === "SAVE") {
						vm.Balance = item.Balance;
						break;
					}
				}
			}
		},
		// get revenue
		getRevenue(res) {
			if (res.Error === 0) {
				this.renderDataToBrowserView({
					result: res.Result,
					type: "revence"
				});
			}
		},
		// get channel
		getChannel(res) {
			if (res.Error === 0) {
				this.renderDataToBrowserView({
					result: res.Result,
					type: "channel"
				});
				if (
					res.Result &&
					res.Result.Channels &&
					res.Result.Channels.length > 0
				) {
					this.channelNum = res.Result.Channels.length;
				}
				this.channelNum =
					res.Result && res.Result.Channels && res.Result.Channels.length;
			}
		},
		getCurrentChannel(res) {
			if (res.Error === 0) {
				if (res.Result.IsOnline === false) {
					if (!this.usable) return;
					this.usable = false;
					ipcRenderer.send("dialog-open", "channelLoseEfficacy");
				} else {
					this.usable = true;
				}
			} else {
				this.usable = true;
			}
		},
		// get connect state
		getState(res) {
			if (res.Error === 0) {
				this.renderDataToBrowserView({
					result: res.Result,
					type: "state",
					rendTo: 1
				});
			}
		},
		/**
		 * params:
		 * rendTo: send to type
		 * 				description: 1: browserView and browserWindow
		 * 										 0: browserView
		 */
		getAllBrowserViewId() {
			let arr = [];
			let views = [];
			//  remote.BrowserWindow.getAllWindows()[0].views;
			for (let win of remote.BrowserWindow.getAllWindows()) {
				if (win.views) {
					views = views.concat(win.views);
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
		renderDataToBrowserView({ result, type, rendTo = 0 }) {
			let browserViewIdLists = this.getAllBrowserViewId(rendTo);
			for (let value of browserViewIdLists) {
				ipcRenderer.sendTo(value, "get-data", { result, type, page: "tab" });
			}
			let arrWin = remote.BrowserWindow.getAllWindows();
			for (let win of arrWin) {
				if (win.webContents.getURL().indexOf("/#/navigation") > 0) {
					if (rendTo === 1) {
						let winRender = Object.assign({}, result, { type: "windowRender" }); //browserWindow render type is windowRender,browserView render type is browserView || undefined
						let winContentId = win.webContents.id;
						ipcRenderer.sendTo(winContentId, "get-data", {
							result: winRender,
							type
						});
					}
				} else {
					let winRender = Object.assign({}, result, { type: "windowRender" }); //browserWindow render type is windowRender,browserView render type is browserView || undefined
					let winContentId = win.webContents.id;
					ipcRenderer.sendTo(winContentId, "get-data", {
						result: winRender,
						type
					});
				}
			}
		},
		// update get current main browseWindow
		getWin() {
			let arrWin = remote.BrowserWindow.getAllWindows();
			for (let winItem of arrWin) {
				if (winItem.webContents.getURL().indexOf("/#/navigation") > 0) {
					this.win = winItem;
				}
			}
		},
		// rend to filemanage page content
		rendToFileManage({ result, type }) {
			if (!this.win) {
				this.getWin();
			}
			let views = [];
			//  remote.BrowserWindow.getAllWindows()[0].views;
			for (let win of remote.BrowserWindow.getAllWindows()) {
				if (win.views) {
					views = win.views;
				}
			}
			const transferListener = ["seek://filemanager", "seek://plugin"];
			const activeView = [];
			views.map(view => {
				transferListener.map(url => {
					if (view.displayURL.toLowerCase().startsWith(url)) {
						activeView.push(view);
					}
				});
			});
			activeView.map(view => {
				ipcRenderer.sendTo(view.webContents.id, "get-data", { result, type });
			});
		},
		// rendTo active browser display message
		message({ info, type, dangerouslyUseHTMLString }) {
			// let views = this.win.views;
			let views = [];
			//  remote.BrowserWindow.getAllWindows()[0].views;
			for (let win of remote.BrowserWindow.getAllWindows()) {
				if (win.views) {
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
		// immediately update upload list
		getUpload() {
			this.$store.dispatch("getUpload");
		},
		// immediately update download list
		getDownload() {
			this.$store.dispatch("getDownload");
		},
		// immediately update complete list
		getComplete() {
			this.$store.dispatch("getComplete");
		},
		// set wait for upload list;
		setWaitForUploadList(data) {
			this.$store.commit("GET_WAIT_FOR_UPLOAD_LIST", data);
			this.getUpload();
		},
		// set wait for download list;
		setWaitForDownloadList(data) {
			this.$store.commit("GET_WAIT_FOR_DOWNLOAD_LIST", data);
			this.getDownload();
		},

		/**
		 * push data to waitForDownloadOrderList
		 * params:
		 * data(type array):
		 */
		pushWaitForDownloadOrderList(data) {
			this.$store.commit("PUSH_WAIT_FOR_DOWNLOAD_ORDER_LIST", data);
			this.getDownload();
		},
		/**
		 * unshift data to waitForDownloadOrderList
		 * params:
		 * data(type array):
		 */
		unshiftWaitForDownloadOrderList(data) {
			this.$store.commit("UNSHIFT_WAIT_FOR_DOWNLOAD_ORDER_LIST", data);
			this.getDownload();
		},
		/**
		 * remove data to waitForOrderList
		 * params:
		 * data(type array):
		 */
		removeWaitForDownloadOrderList(data) {
			this.$store.commit("REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST", data);
			this.getDownload();
		},

		/**
		 * push data to waitForUploadOrderList
		 * params:
		 * data(type array):
		 */
		pushWaitForUploadOrderList(data) {
			this.$store.commit("PUSH_WAIT_FOR_UPLOAD_ORDER_LIST", data);
			this.getUpload();
		},
		/**
		 * unshift data to waitForUploadOrderList
		 * params:
		 * data(type array):
		 */
		unshiftWaitForUploadOrderList(data) {
			this.$store.commit("UNSHIFT_WAIT_FOR_UPLOAD_ORDER_LIST", data);
			this.getUpload();
		},
		/**
		 * remove data to waitForOrderList
		 * params:
		 * data(type array):
		 */
		removeWaitForUploadOrderList(data) {
			this.$store.commit("REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST", data);
			this.getUpload();
		},

		/**
		 * add data to pausing
		 * params:
		 * data(type array):
		 */
		addPausing(data) {
			this.$store.commit("ADD_PAUSING", data);
			this.getUpload();
			this.getDownload();
		},
		/**
		 * remove data to pausing
		 * params:
		 * data(type array):
		 */
		removePausing(data) {
			this.$store.commit("REMOVE_PAUSING", data);
			this.getUpload();
			this.getDownload();
		},

		/**
		 * add data to uploading
		 * params:
		 * data(type array):
		 */
		addUploading(data) {
			this.$store.commit("ADD_UPLOADING", data);
			this.getUpload();
		},
		/**
		 * remove data to uploading
		 * params:
		 * data(type array):
		 */
		removeUploading(data) {
			this.$store.commit("REMOVE_UPLOADING", data);
			this.getUpload();
		},
		addDownloadProgressDone(data = 0) {
			let _num = this.downloadProgressDone + data;
			this.$store.commit("SET_DOWNLOAD_PROGRESS_DONE", _num);
			localStorage.setItem(`downloadProgressDone_${this.Address}`, _num);
		},
		removeDownloadProgressTotal(data = 0) {
			console.log("this.downloadProgressTotal")
			console.log(data)
			let _total = this.downloadProgressTotal - data;
			this.$store.commit("SET_DOWNLOAD_PROGRESS_TOTAL", _total);
			localStorage.setItem(`downloadProgressTotal_${this.Address}`, _total);
		},
		addDownloadProgressTotal(data = 0) {
			let _total = this.downloadProgressTotal + data;
			this.$store.commit("SET_DOWNLOAD_PROGRESS_TOTAL", _total);
			localStorage.setItem(`downloadProgressTotal_${this.Address}`, _total);
		},
		downloadProgressRestart() {
			let _total = this.downloadProgressTotal - this.downloadProgressDone || 0;
			this.$store.commit("SET_DOWNLOAD_PROGRESS_TOTAL", _total);
			this.$store.commit("SET_DOWNLOAD_PROGRESS_DONE", 0);
			localStorage.setItem(`downloadProgressTotal_${this.Address}`, _total);
			localStorage.setItem(`downloadProgressDone_${this.Address}`, 0);
		},
		clearDownloadProgress() {
			this.$store.commit("SET_DOWNLOAD_PROGRESS_TOTAL", 0);
			this.$store.commit("SET_DOWNLOAD_PROGRESS_DONE", 0);
			localStorage.setItem(`downloadProgressTotal_${this.Address}`, 0);
			localStorage.setItem(`downloadProgressDone_${this.Address}`, 0);
		},
		addUploadProgressDone(data = 0) {
			let _num = this.uploadProgressDone + data;
			this.$store.commit("SET_UPLOAD_PROGRESS_DONE", _num);
			localStorage.setItem(`uploadProgressDone_${this.Address}`, _num);
		},
		removeUploadProgressTotal(data = 0) {
			let _total = this.uploadProgressTotal - data;
			console.log("data")
			console.log(data)
			console.log(_total)
			this.$store.commit("SET_UPLOAD_PROGRESS_TOTAL", _total);
			localStorage.setItem(`uploadProgressTotal_${this.Address}`, _total);
		},
		addUploadProgressTotal(data = 0) {
			let _total = this.uploadProgressTotal + data;
			this.$store.commit("SET_UPLOAD_PROGRESS_TOTAL", _total);
			localStorage.setItem(`uploadProgressTotal_${this.Address}`, _total);
		},
		uploadProgressRestart() {
			let _total = this.uploadProgressTotal - this.uploadProgressDone || 0;
			this.$store.commit("SET_UPLOAD_PROGRESS_TOTAL", _total);
			this.$store.commit("SET_UPLOAD_PROGRESS_DONE", 0);
			localStorage.setItem(`uploadProgressTotal_${this.Address}`, _total);
			localStorage.setItem(`uploadProgressDone_${this.Address}`, 0);
		},
		clearUploadProgress() {
			this.$store.commit("SET_UPLOAD_PROGRESS_TOTAL", 0);
			this.$store.commit("SET_UPLOAD_PROGRESS_DONE", 0);
			localStorage.setItem(`uploadProgressTotal_${this.Address}`, 0);
			localStorage.setItem(`uploadProgressDone_${this.Address}`, 0);
		},
		/**
		 * set config maxNumUpload
		 * params:
		 * data(type array):
		 */
		settingUpdate(data) {
			const vm = this;
			this.maxNumUpload = data.maxNumUpload;
			if (!this.isNotDonePause) return;
			this.isNotDonePause = false;
			this.__proto__.__proto__.$config.maxNumUpload = data.maxNumUpload;

			// update upload list
			let flag = false;
			let commitAll = [];

			let remoteUploadingList = [];
			for (let value of this.uploadTransferList) {
				if (value.Id.indexOf("waitfor_") !== 0) {
					if (value.Status === 1 || value.Status === 2) {
						remoteUploadingList.push(value.Id);
					}
				}
			}
			if (remoteUploadingList.length > this.$config.maxNumUpload) {
				let pauseList = remoteUploadingList.splice(this.$config.maxNumUpload);
				this.addUploading(pauseList);
				this.unshiftWaitForUploadOrderList(pauseList);
				commitAll.push(this.toPause(pauseList));
				flag = true;
			}

			let remoteDownloadingList = [];
			for (let value of this.downloadTransferList) {
				if (
					value.Id.indexOf("waitfor_") !== 0 &&
					!value.Url.startsWith("oni://www")
				) {
					if (value.Status === 1 || value.Status === 2) {
						remoteDownloadingList.push(value.Id);
					}
				}
			}
			if (remoteDownloadingList.length > this.$config.maxNumUpload) {
				let pauseList = remoteDownloadingList.splice(this.$config.maxNumUpload);
				this.addUploading(pauseList);
				this.unshiftWaitForDownloadOrderList(pauseList);
				commitAll.push(vm.toPauseDownload(pauseList));
				flag = true;
			}

			if (flag) {
				this.$axios.all(commitAll).finally(res => {
					vm.rendToFileManage({
						type: "localStatus",
						result: vm.localStatus
					});
					this.isNotDonePause = true;
					if (vm.$config.maxNumUpload !== vm.maxNumUpload && vm.maxNumUpload) {
						vm.settingUpdate({ maxNumUpload: vm.maxNumUpload });
					} else {
						this.waitForDownloadFileToDownload();
						this.waitForUploadFileToUpload();
					}
				});
				return;
			}
			this.isNotDonePause = true;
			if (
				this.$config.maxNumUpload !== this.maxNumUpload &&
				this.maxNumUpload
			) {
				this.settingUpdate({ maxNumUpload: this.maxNumUpload });
			} else {
				this.waitForDownloadFileToDownload();
				this.waitForUploadFileToUpload();
			}
		},
		// to pause task
		toPause(arr) {
			const vm = this;
			let params = {
				Ids: arr
			};
			return vm.$axios.post(vm.$api.uploadPause, params, {
				timeout: (vm.$config.outTime * 2000 + 18000) * params.Ids.length
			});
		},
		toPauseDownload(arr) {
			const vm = this;
			let params = {
				Ids: arr
			};
			return vm.$axios.post(vm.$api.downloadPause, params, {
				timeout: (vm.$config.outTime * 2000 + 18000) * params.Ids.length
			});
		},
		// hand out data about lang
		toSetLang(lang) {
			this.$i18n.locale = lang;
			let _htmlDom = document.querySelector("html");
			_htmlDom.style.fontSize = this.$t("fontSize");
			this.renderDataToBrowserView({
				result: { lang: lang },
				type: "lang",
				rendTo: 1
			});
		},
		// pause all transfering task(at edge)
		// return is not success
		async pauseAll() {
			let uploadingArr = [];
			let flag = false;
			for(let value of this.uploadingTransferList) {
				if(value.Status === 2 && value.DetailStatus !== 5 && value.DetailStatus !== 23) {
					uploadingArr.push(value.Id)
				} else if(value.Status === 2 && (value.DetailStatus === 5 || value.DetailStatus === 23)){
					flag = true
				}
			}

			let downloadingArr = [];
			for(let value of this.downloadingTransferList) {
				if(value.Status === 2 && value.DetailStatus !== 5 && value.DetailStatus !== 23) {
					downloadingArr.push(value.Id)
				} else if(value.Status === 2 && (value.DetailStatus === 5 || value.DetailStatus === 23)){
					flag = true
				}
			}
			let arr = [];
			if(uploadingArr.length !== 0){
				arr.push(this.toPause(uploadingArr));
			}
			if(downloadingArr.length !== 0) {
				arr.push(this.toPauseDownload(downloadingArr));
			}
			if(arr.length === 0) {
				return flag;
			}

			return Promise.all(arr).then(Ress => {
				for(let i = 0;i < Ress.length;i ++) {
					let Res = Ress[i];
					if(Res.Error !== 0) return true;
					for(let j = 0;j < Res.Tasks.length;j ++) {
						let _task = Res.Tasks[j];
						if(_task.State === 2 || _task.State === 1) return true;
					}
					return flag;
				}
			}).catch(err => {
				return true;
			})
		},
		// logout pause all task
		async logoutPauseAllTask() {
			// update task(at local cache task)
			this.$store.commit('SET_WAIT_FOR_DOWNLOAD_ORDER_LIST', []);
			this.$store.commit('SET_WAIT_FOR_UPLOAD_ORDER_LIST', []);
			this.$store.commit('GET_LOCAL_STATUS', {
        pausing: [],
        uploading: []
			});
			let _waitForUploadList = JSON.parse(JSON.stringify(this.waitForUploadList));
			for(let value of _waitForUploadList) {
				value.Status = 0;
			}
			this.$store.commit('SET_WAIT_FOR_UPLOAD_LIST', _waitForUploadList);
			let _waitForDownloadList = JSON.parse(JSON.stringify(this.waitForDownloadList));
			for(let value of _waitForDownloadList) {
				value.Status = 0;
			}
			this.$store.commit('SET_WAIT_FOR_DOWNLOAD_LIST', _waitForDownloadList);
			let pauseRes = await this.pauseAll();
			if(pauseRes || this.readyUpload.length > 0 || this.readyDownload.length > 0) {
				return false;
			} else {
				return true;
			}
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
