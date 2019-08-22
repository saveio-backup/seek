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
		const COUNT_INTERVAL = 10000;
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
				setTimeProcessObj: null
			},
			Address: "",
			// Progress: 0,
			downloadUrl: "" // downloadDialog url
		};
	},
	mounted() {
		ipcRenderer.on("setSelector", (e, selector) => {
			this.menuSelector = selector;
			this.$forceUpdate();
		});
		ipcRenderer.on("setDownloadUrl", (e, url) => {
			this.downloadUrl = url;
		});
		localStorage.setItem("DNSAdress", "");
		this.isNeedCreateChannel();
	},
	watch: {
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
		}
	},
	methods: {
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
							progressResult.Result.isSync = false;
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
		getRevenue() {
			this.$axios
				.get(this.$api.revenue, {
					timeout: 20000
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
					timeout: 20000
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
			let views = remote.BrowserWindow.getAllWindows()[0].views;
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
				ipcRenderer.sendTo(value, "get-data", { result, type });
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
