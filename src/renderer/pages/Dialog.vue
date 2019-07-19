<template>
	<div class="dialogWrapper">
		<!-- <router-view></router-view> -->
		<!-- <router-view @closeDialog="closeDialog"></router-view> -->
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
		 <!-- v-if="menuSelector === 'isCreateChannel'" -->
	</div>
</template>

<script>
import { ipcRenderer } from "electron";
import exportPrivateKey from "./Dialog/ExportPrivateKey.vue";
import logout from "./Dialog/Logout.vue";
import isCreateChannel from "./Dialog/IsCreateChannel.vue";
export default {
	name: "Dialog",
	components: {
		exportPrivateKey,
		logout,
		isCreateChannel
	},
	data() {
		const COUNT_INTERVAL = 5000
		return {
			menuSelector: "",
			// dnsAdress: localStorage.getItem("DNSAdress") || "",
			channelNum: null,
			Balance: null,
			COUNT_INTERVAL: COUNT_INTERVAL,
			setTimeObj: null,
			setTimeAddressObj: null,
			setTimeProcessObj: null,
			Address: "",
			Progress: 0
		};
	},
	mounted() {
		ipcRenderer.on("setSelector", (e, selector) => {
      this.menuSelector = selector;
      this.$forceUpdate()
		});
		localStorage.setItem("DNSAdress", "");
		this.isNeedCreateChannel();
	},
	watch: {
		Address(newVal,oldVal) {
			this.Balance = null;
			this.channelNum = null;
			localStorage.setItem("DNSAdress", "");
			this.getProcess();
		},
		Balance(newVal, oldVal) {
			if(!oldVal && newVal && this.channelNum === 0) {
				console.log(`Balance(new):${newVal},Balance(old):${oldVal},channelNum:${this.channelNum}`);
				ipcRenderer.send('dialog-open', 'createChannel');
			}
		},
		channelNum(newVal, oldVal) {
			if(this.Balance && newVal === 0 && oldVal === null) {
				console.log(`channelNum(new):${newVal},channelNum(old):${oldVal},Balance:${this.Balance}`);
				ipcRenderer.send('dialog-open', 'createChannel');
			}
		}
	},
	methods: {
		closeDialog({ timeout = 0 }) {
			this.menuSelector = '';
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
			}, this.COUNT_INTERVAL)	
		},
		getAddress() {
			this.$axios
      .get(this.$api.account)
      .then(async (res) => {
        const data = res.data;
				if (data.Error === 0) { // response data
					if (data.Desc === "SUCCESS" && data.Result.Address) {
						this.Address = data.Result.Address;
					}
				}
			})
		},
		getProcess() {
			clearInterval(this.setTimeProcessObj);
			this.setTimeProcessObj = setInterval(() => {
				this.$axios.get(this.$api.channelInitProgress).then(progressResult => {
					this.Progress = progressResult.data.Result.Progress
					if(progressResult.data.Result.Progress === 1) {
						this.checkCanNotAddChannel();
					}
				})
			},this.COUNT_INTERVAL)
		},
		getBalance() {
			const vm = this;
			this.$axios.get(this.$api.host + this.$api.version + "balance" +'/'+this.Address).then(res => {
				if(res.data.Error === 0) {
					for (let i = 0; i < res.data.Result.length; i++) {
						const item = res.data.Result[i];
						if (item.Symbol === 'SAVE') {
							vm.Balance = item.Balance;
							break;
						}
					}
				}
			})
		},
		getChannel() {
			this.$axios.get(this.$api.host + this.$api.version + "channel").then(res => {
				if(res.data.Error === 0) {
					if(res.data.Result && res.data.Result.Channels && res.data.Result.Channels.length > 0) {
						clearInterval(this.setTimeObj);
						return;
					}
					this.channelNum = res.data.Result && res.data.Result.Channels && res.data.Result.Channels.length;
				}
			})	
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
</style>
