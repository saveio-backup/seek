<template>
	<div id="import-account">
		<el-button
		 type="primary"
		 @click='importWallet'
		>Import Wallet</el-button>
		<el-input
		 type="textarea"
		 v-model="data.Wallet"
		 cols="30"
		 rows="10"
		 placeholder="key"
		></el-input>
		<p>Password</p>
		<el-input v-model="data.Password"></el-input>
		<div style="text-align:center; margin-top: 10px;">
			<el-button
			 @click="importAccountWithWalletFile"
			 class="import-button"
			 type="primary"
			>Import</el-button>
		</div>
	</div>
</template>
<script>
const { ipcRenderer } = require("electron");
export default {
	data() {
		return {
			data: {
				Wallet: "",
				Password: ""
			}
		};
	},
	methods: {
		importWallet() {
			ipcRenderer.send("open-wallet-dialog");
			ipcRenderer.on("selected-wallet", (event, content) => {
				this.data.Wallet = content;
			});
		},
		importAccountWithWalletFile() {
			this.$axios
				.post(this.$api.account + "/import/walletfile", this.data)
				.then(res => {})
				.catch(res => {});
		}
	}
};
</script>
<style lang="scss">
#import-account {
	margin: 20px auto;
	.import-button {
	}
}
</style>
