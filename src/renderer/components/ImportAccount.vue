<template>
	<div
	 id="import-account"
	 class="account-wrap"
	>
		<div class="account-box">
			<div class="el-form textarea">
				<h2 class="account-title">Recovery Key</h2>
				<el-input
				 type="textarea"
				 v-model="data.Wallet"
				 cols="30"
				 rows="10"
				 placeholder="key"
				></el-input>
				<div class="tr mb20"><a
					 @click='importWallet'
					 class="light-blue ft14 cursor-pointer"
					>Import Wallet</a></div>
				<el-input v-model="data.Password" placeholder="Password" class="mb50"></el-input>
				<div>
					<el-button
					 @click="importAccountWithWalletFile"
					 class="import-button account-button"
					 type="primary"
					>Import</el-button>
				</div>
			</div>
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
			ipcRenderer.once("selected-wallet", (event, content) => {
				this.data.Wallet = content;
			});
		},
		importAccountWithWalletFile() {
			this.$axios
				.post(this.$api.account + "/import/walletfile", this.data)
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						const result = res.data.Result;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
						window.location.href = location.origin + location.pathname; // success login link to home page
					}
				})
				.catch(err => {
					console.error(err);
				});
		}
	}
};
</script>
<style lang="scss">
#import-account {
	margin: 0px auto;
}
</style>
