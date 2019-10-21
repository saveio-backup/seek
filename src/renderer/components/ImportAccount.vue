<template>
	<div
		id="import-account"
		class="account-wrap"
	>
		<div class="account-box">
			<h2 class="account-title">{{$t('account.importAccount')}}</h2>
			<ul class="account-type ft14">
				<li>
					<a
						:class="{'account-select':importWay == 0}"
						@click="importWay = 0"
					>{{$t('account.keystoreFile')}}</a>
				</li>
				<li>
					<a
						:class="{'account-select':importWay == 1}"
						@click="importWay = 1"
					>{{$t('account.privateKey')}}</a>
				</li>
			</ul>
			<div class="el-form loading textarea">
				<div v-if="importWay == 0">
					<el-form @submit.native.prevent>
						<el-form-item :label="$t('account.keystoreFile')+':'">
							<el-input
								type="textarea"
								v-model="data.Wallet"
								cols="30"
								rows="10"
								:placeholder="$t('account.key')"
								class="grey-theme"
							>
							</el-input>
							<!-- <div class="tr mb20 input-opeation"><a
                  @click='importWallet'
                  class="light-blue ft14 cursor-pointer cursor-click user-no-select"
                >Select Keystore File</a></div> -->
							<div class="tr input-opeation">
								<ripper-button
									@click='importWallet'
									class="primary ft12"
								>
									<i class="ofont ofont-DAT"></i> {{$t('account.selectKeystoreFile')}}
								</ripper-button>
							</div>
						</el-form-item>
						<el-form-item :label="$t('public.walletPassword')+':'">
							<el-input
								v-model="data.Password"
								:placeholder="$t('public.pleaseInputWalletPassword')"
								type="password"
								:rows="2"
								class="grey-theme"
								show-password
								@keyup.enter.native='importAccount'
							></el-input>
						</el-form-item>
					</el-form>
					<!-- <p
					 class="light-blue ft14 cursor-pointer text-right mt10 mb50"
					 @click="importWay = 1"
					>Import the account with the private key(WIF)</p> -->
				</div>
				<div v-if="importWay ==1">
					<el-form
						ref='privatekeyform'
						:model='privateKeyForm'
						:rules='privateKeyRules'
						@submit.native.prevent
					>
						<el-form-item
							:label="$t('account.privateKey')"
							prop='PrivateKey'
						>
							<el-input
								v-model="privateKeyForm.PrivateKey"
								:placeholder="$t('account.inputImportPrivatekeyHere')"
								class="grey-theme"
							></el-input>
							<!-- <div class="tr"><a
                  @click='importPrivateKey'
                  class="light-blue ft14 cursor-pointer user-no-select cursor-click input-opeation"
                >Select Private Key File</a></div> -->
							<div
								class="tr input-opeation"
								@click='importPrivateKey'
							>
								<ripper-button class="primary ft12">
									<i class="ofont ofont-DAT"></i> {{$t('account.selectPrivateKeyFile')}}
								</ripper-button>
							</div>
						</el-form-item>
						<el-form-item
							:label="$t('account.userName')"
							prop='Label'
						>
							<el-input
								v-model="privateKeyForm.Label"
								:placeholder="$t('account.inputUserName')"
								class="grey-theme"
							></el-input>
						</el-form-item>
						<el-form-item
							:label="$t('public.walletPassword')"
							prop='Password'
						>
							<el-input
								v-model="privateKeyForm.Password"
								:placeholder="$t('account.inputNewWalletPassword')"
								show-password
								type="password"
								class="grey-theme"
							></el-input>
						</el-form-item>
						<el-form-item
							:label="$t('account.confirmWalletPassword')"
							prop='Confirm'
						>
							<el-input
								v-model="privateKeyForm.Confirm"
								@keyup.enter.native='importAccount'
								show-password
								type="password"
								class="grey-theme"
								:placeholder="$t('account.confirmWalletPassword')"
							></el-input>
						</el-form-item>
					</el-form>
				</div>
				<div>
					<ripper-button
						@click="importAccount"
						class="import-button account-button text-center"
						type="primary"
					>{{$t('account.import')}}</ripper-button>
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
			const vm = this;
			if (this.privateKeyForm.Password === this.privateKeyForm.Confirm) {
				callback();
			} else {
				callback(new Error(vm.$t('account.inconsistentPasswordsFilledInTwice')));
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
						message: this.$t('account.pleaseFillYourPrivateKey'),
						trigger: "blur"
					}
				],
				Label: [
					{
						required: true,
						message: this.$t('account.pleaseFillYourName'),
						trigger: "blur"
					}
				],
				Password: {
					// validator: validatePassword,
					message: this.$t('account.pleaseFillYourPassword'),
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
		importAccount() {
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
			const vm = this;
			if (this.switchToggle.loading) return;
			this.$axios
				.post(this.$api.account + "/import/walletfile", this.data, {
					loading: {
						text: vm.$t('account.importing'),
						target: ".loading"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						const result = res.Result;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
						window.location.href = location.origin + location.pathname; // success login link to home page
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(vm.$t('account.networkErrorImportWalletFileFailed'));
					}
				});
		},
		importAccountWithPrivateKey() {
			const vm = this;
			if (this.switchToggle.loading) return;
			this.$refs.privatekeyform.validate(valid => {
				if (valid) {
					this.$axios
						.post(
							this.$api.account + "/import/privatekey",
							this.privateKeyForm,
							{
								loading: {
									lock: true,
									text: vm.$t('account.importing'),
									target: ".loading"
								}
							}
						)
						.then(res => {
							if (res.Error === 0) {
								const result = res.Result;
								for (let key in result) {
									window.localStorage.setItem(key, result[key]);
								}
								window.location.href = location.origin + location.pathname; // success login link to home page
							} else {
								this.$message.error(this.$t(`error[${res.Error}]`));
							}
						})
						.catch(e => {
							if (!e.message.includes("timeout")) {
								this.$message.error(vm.$t('account.networkErrorImportPrivateKeyFailed'));
							}
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
	.account-type {
		width: 500px;
		margin: 0 auto 40px;
		display: flex;
		justify-content: space-around;
		li {
			width: 120px;
			height: 18px;
			a {
				color: rgba(32, 32, 32, 0.4);
				position: relative;
				cursor: pointer;
				user-select: none;
				&:hover {
					opacity: 1;
					color: #2f8ff0;
				}
				&:active {
					opacity: 0.7;
				}
				&::before {
					content: "";
					display: block;
					width: 40px;
					height: 2px;
					background: #2f8ff0;
					position: absolute;
					bottom: -10px;
					left: 50%;
					transform: translateX(-50%) scaleX(0);
					transition: all 0.3s ease;
				}
				&.account-select {
					color: #2f8ff0;
					&::before {
						transform: translateX(-50%) scaleX(1);
					}
				}
			}
		}
	}
	.import-button {
		margin-top: 80px;
	}
	// .el-form .el-input__inner {
	// 	background: #EDEFF4;
	// 	border: 0;
	// 	border-radius: 2px;
	// }
	.el-form textarea {
		padding: 15px;
		font-size: 14px;
		text-align: left;
		height: 130px;
		background: #edeff4;
		border-radius: 2px;
		color: rgba(32, 32, 32, 0.7);
		word-break: break-all;
		border: 0;
		word-break: break-all;
		transition: all 0.3s ease;
		&:focus {
			background: #e0e2e6;
		}
	}
	.input-opeation {
		position: absolute;
		bottom: -40px;
		right: 0;
		button {
			height: 24px;
		}
	}
}
</style>
