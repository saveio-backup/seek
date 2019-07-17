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
			dnsAdress: localStorage.getItem("DNSAdress") || "",
			channelNum: null,
			Balance: null,
			COUNT_INTERVAL: COUNT_INTERVAL,
			setTimeObj: null,
			setProcessTimeObj: null,
			Address: ""
		};
	},
	mounted() {
		ipcRenderer.on("setSelector", (e, selector) => {
      this.menuSelector = selector;
      this.$forceUpdate()
		});
		this.isNeedCreateChannel();
	},
	watch: {
		Balance(newVal, oldVal) {
			if(!oldVal && newVal && this.channelNum === 0) {
				ipcRenderer.send('dialog-open', 'createChannel');
				clearInterval(this.setTimeObj);
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
			this.getProcess();
			this.setProcessTimeObj = setInterval(() => {
				this.getProcess();
			}, this.COUNT_INTERVAL)	
		},
		getProcess() {
			this.$axios
      .get(this.$api.account)
      .then(async (res) => {
        const data = res.data;
				if (data.Error === 0) { // response data
					this.Address = data.Result.Address
					if (data.Desc === "SUCCESS" && data.Result.Address) {
						const progressResult = await this.$axios.get(this.$api.channelInitProgress);
						if(progressResult.data.Result.Progress === 1) {
							clearInterval(this.setProcessTimeObj);
							this.checkCanNotAddChannel();
						}
					}
				}
			})
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
					this.channelNum = res.data.Result && res.data.Result.Channels && res.data.Result.Channels.length || 0;
				}
			})	
		},
		// check have channel and wallet money
		checkCanNotAddChannel() {
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
