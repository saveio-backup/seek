<template>
	<div
	 id="import-account"
	 class="account-wrap"
	>
		<div class="account-box">
			<h2 class="account-title">Import Account</h2>
			<div class="el-form loading textarea">
				<div v-if="importWay == 0">
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
					<el-input
					 v-model="data.Password"
					 placeholder="Password"
					></el-input>
					<p
					 class="light-blue ft14 cursor-pointer text-right mt10 mb50"
					 @click="importWay = 1"
					>Import the account with the private key</p>
				</div>
				<div v-if="importWay ==1">
					<el-form
					 ref='privatekeyform'
					 :model='privateKeyForm'
					 :rules='privateKeyRules'
					>
						<el-form-item
						 label="PrivateKey"
						 prop='PrivateKey'
						>
							<el-input v-model="privateKeyForm.PrivateKey"></el-input>
							<div class="tr"><a
								 @click='importPrivateKey'
								 class="light-blue ft14 cursor-pointer"
								>Import PrivateKey</a></div>
						</el-form-item>
						<el-form-item
						 label="Username"
						 prop='Label'
						>
							<el-input v-model="privateKeyForm.Label"></el-input>
						</el-form-item>
						<el-form-item
						 label="Password"
						 prop='Password'
						>
							<el-input
							 v-model="privateKeyForm.Password"
							 type="password"
							></el-input>
						</el-form-item>
						<el-form-item
						 label="Confirm password"
						 prop='Confirm'
						>
							<el-input
							 v-model="privateKeyForm.Confirm"
							 type="password"
							></el-input>
						</el-form-item>
					</el-form>
				</div>
				<div>
					<el-button
					 @click="importAccont"
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
		let validatePassword = (rule, value, callback) => {
			if (this.privateKeyForm.Password === this.privateKeyForm.Confirm) {
				callback();
			} else {
				callback(new Error("Inconsistent passwords filled in twice"));
			}
		};
		return {
			switchToggle: {
				loading: null
			},
			importWay: 0, // 0 Wallet 1 PrivateKey
			privateKeyForm: {
				PrivateKey: "",
				Label: "",
				Password: "",
				Confirm: ""
			},
			privateKeyRules: {
				PrivateKey: [
					{
						required: true,
						message: "please fill your PrivateKey",
						trigger: "blur"
					}
				],
				Label: [
					{
						required: true,
						message: "please fill your name",
						trigger: "blur"
					}
				],
				Password: {
					// validator: validatePassword,
					message: "please fill your password",
					required: true,
					trigger: ["blur", "input"]
				},
				Confirm: {
					validator: validatePassword,
					required: true,
					trigger: ["blur"]
				}
			},
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
		importPrivateKey() {
			ipcRenderer.send("open-file-dialog");
			ipcRenderer.once("selected-file", (event, content) => {
				this.privateKeyForm.PrivateKey = content;
			});
		},
		importAccont() {
			switch (this.importWay) {
				case 0:
					this.importAccountWithWalletFile();
					break;
				case 1:
					this.importAccountWithPrivateKey();
				default:
					break;
			}
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
					} else if ((res.data.Error = 50015)) {
						this.$message.error("Account not exit or Wrong Password");
					} else {
						this.$message.error(res.data.Desc);
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
		importAccountWithPrivateKey() {
			if (this.switchToggle.loading) return;
			this.$refs.privatekeyform.validate(valid => {
				if (valid) {
					this.switchToggle.loading = this.$loading({
						lock: true,
						text: "Importing",
						target: ".loading"
					});
					this.$axios
						.post(this.$api.account + "/import/privatekey", this.privateKeyForm)
						.then(res => {
							const data = res.data;
							if (data.Desc === "SUCCESS") {
								const result = res.data.Result;
								for (let key in result) {
									window.localStorage.setItem(key, result[key]);
								}
								window.location.href = location.origin + location.pathname; // success login link to home page
							} else {
								this.switchToggle.loading.close();
								this.switchToggle.loading = null;
								this.$message.error(data.Desc || "Login Error!");
							}
						})
						.catch(() => {
							this.switchToggle.loading.close();
							this.switchToggle.loading = null;
							this.$message.error("Login Error!");
						});
				}
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
