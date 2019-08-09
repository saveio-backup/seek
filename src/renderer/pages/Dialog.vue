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
				<download-dialog :downloadUrl='downloadUrl' @closeDialog="closeDialog">
				</download-dialog>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";
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
			channelNum: null,
			Balance: null,
			COUNT_INTERVAL: COUNT_INTERVAL,
			setTimeObj: null,
			setTimeAddressObj: null,
			setTimeProcessObj: null,
			Address: "",
			Progress: 0,
			downloadUrl: "" // downloadDialog url
		};
	},
	mounted() {
		console.log("init Dialog.vue");
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
			console.log(`Address--->newVal:${newVal},oldVal:${oldVal}`);
			// alert('Address change')
			this.Balance = null;
			this.channelNum = null;
			localStorage.setItem("DNSAdress", "");
			this.getProcess();
		},
		Balance(newVal, oldVal) {
			if (!oldVal && newVal && this.channelNum === 0) {
				// alert('Balance change');
				console.log(
					`Balance(new):${newVal},Balance(old):${oldVal},channelNum:${this.channelNum}`
				);
				ipcRenderer.send("dialog-open", "createChannel");
			}
		},
		channelNum(newVal, oldVal) {
			if (this.Balance && newVal === 0 && oldVal === null) {
				// alert('channelNum change');
				console.log(
					`channelNum(new):${newVal},channelNum(old):${oldVal},Balance:${this.Balance}`
				);
				ipcRenderer.send("dialog-open", "createChannel");
			}
		}
	},
	methods: {
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
		isNeedCreateChannel() {
			clearInterval(this.setTimeAddressObj);
			this.getAddress();
			this.setTimeAddressObj = setInterval(() => {
				this.getAddress();
			}, this.COUNT_INTERVAL);
		},
		getAddress() {
			this.$axios.get(this.$api.account).then(async res => {
				if (res.Error === 0) {
					if (res.Result.Address) {
						this.Address = res.Result.Address;
					}
				}
			});
		},
		getProcess() {
			clearInterval(this.setTimeProcessObj);
			this.setTimeProcessObj = setInterval(() => {
				this.$axios.get(this.$api.channelInitProgress).then(progressResult => {
					if (progressResult.Error === 0) {
						this.Progress = progressResult.Result.Progress;
						if (progressResult.Result.Progress === 1) {
							this.checkCanNotAddChannel();
						}
					}
				});
			}, this.COUNT_INTERVAL);
		},
		getBalance() {
			const vm = this;
			this.$axios.get(this.$api.balance + "/" + this.Address).then(res => {
				if (res.Error === 0) {
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
		getChannel() {
			this.$axios
				.get(this.$api.channel, {
					timeout: 20000
				})
				.then(res => {
					if (res.Error === 0) {
						if (
							res.Result &&
							res.Result.Channels &&
							res.Result.Channels.length > 0
						) {
							this.channelNum = res.Result.Channels.length;
							clearInterval(this.setTimeObj);
							return;
						}
						this.channelNum =
							res.Result && res.Result.Channels && res.Result.Channels.length;
					}
				});
		},
		// check have channel and wallet money
		checkCanNotAddChannel() {
			clearInterval(this.setTimeObj);
			this.getChannel();
			this.getBalance();
			this.setTimeObj = setInterval(() => {
				this.getChannel();
				this.getBalance();
			}, this.COUNT_INTERVAL);
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
