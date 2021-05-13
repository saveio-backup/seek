<template>
	<div
		id="import-account"
		class="account-wrap theme-font-color"
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
				<div v-show="importWay == 0">
					<el-form @submit.native.prevent>
						<el-form-item :label="$t('account.keystoreFile')+':'">
							<el-input
								type="textarea"
								resize="none"
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
									class="primary ftpx12"
								>
									<i class="ofont ofont-DAT"></i> <span class="ft14">{{$t('account.selectKeystoreFile')}}</span>
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
				<div v-show="importWay ==1">
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
							<div class="tr input-opeation">
								<ripper-button
									class="primary ftpx12"
									@click='importPrivateKey'
								>
									<i class="ofont ofont-DAT"></i> <span class="ft14">{{$t('account.selectPrivateKeyFile')}}</span>
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
								v-model.trim="privateKeyForm.Password"
								:placeholder="$t('account.inputNewWalletPassword')"
								show-password
								type="password"
								class="grey-theme form-password"
							>
								<ul
									slot="append"
									class="flex strength-ul"
									v-show="switchToggle.passwordStrength>=0"
								>
									<li
										class="password-light"
										:class="{weak:switchToggle.passwordStrength===0,medium:switchToggle.passwordStrength===1,strong:switchToggle.passwordStrength===2}"
									></li>
									<li
										class="password-light"
										:class="{weak:switchToggle.passwordStrength===0,medium:switchToggle.passwordStrength===1,strong:switchToggle.passwordStrength===2}"
									></li>
									<li
										class="password-light"
										:class="{weak:switchToggle.passwordStrength===0,medium:switchToggle.passwordStrength===1,strong:switchToggle.passwordStrength===2}"
									></li>
									<p>{{$t('account.passwordStrength['+switchToggle.passwordStrength+']')}}</p>
								</ul>
							</el-input>
						</el-form-item>
						<el-form-item
							:label="$t('account.confirmWalletPassword')"
							prop='Confirm'
						>
							<el-input
								v-model.trim="privateKeyForm.Confirm"
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
const { ipcRenderer, remote } = require("electron");
import util from "./../assets/config/util";
export default {
	data() {
		let validatePassword = (rule, value, callback) => {
			const vm = this;
			if (!value.length) {
				this.switchToggle.passwordStrength = -1;
				callback(new Error(vm.$t("account.pleaseFillYourPassword")));
			} else if (value.length > 16) {
				callback(new Error(vm.$t("account.overMaxPasswordLength16")));
			} else {
				vm.checkStrength(value, callback);
			}
		};
		let validatePasswordConfirm = (rule, value, callback) => {
			const vm = this;
			if (this.privateKeyForm.Password === this.privateKeyForm.Confirm) {
				callback();
			} else {
				callback(
					new Error(vm.$t("account.inconsistentPasswordsFilledInTwice"))
				);
			}
		};
		let validateAccount = (rule, value, callback) => {
			const vm = this;
			if (util.getCharLength(value) > 18) {
				callback(new Error(vm.$t("account.inputLengthLimit18Chars")));
			} else if (/\\|\/|:|\*|\?|\"|\<|\>|\||\(|\)|\-/g.test(value)) {
				callback(new Error(vm.$t("account.invaildword")));
			} else {
				callback();
				// new Error(vm.$t("account.inconsistentPasswordsFilledInTwice"))
			}
		};
		return {
			util,
			validatePassword,
			validatePasswordConfirm,
			validateAccount,
			switchToggle: {
				passwordStrength: -1,
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
						message: this.$t("account.pleaseFillYourPrivateKey"),
						trigger: "blur"
					}
				],
				Label: [
					{
						required: true,
						message: this.$t("account.pleaseFillYourName"),
						trigger: "blur"
					},
					{
						validator: validateAccount,
						trigger: ["blur"]
					}
				],
				Password: {
					validator: validatePassword,
					required: true,
					trigger: ["blur", "change"]
				},
				Confirm: {
					validator: validatePasswordConfirm,
					required: true,
					trigger: ["blur"]
				}
			},
			checkStrength(value, callback) {
				let highRegex = new RegExp(
					"^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*).*$",
					"g"
				);
				let highRegex2 = new RegExp(
					"^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+])(?=.*).*$",
					"g"
				);
				let highRegex3 = new RegExp(
					"^(?=.{8,})(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])(?=.*).*$",
					"g"
				);
				let highRegex4 = new RegExp(
					"^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+])(?=.*).*$",
					"g"
				);
				var middleRegex = new RegExp(
					"^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z])(?=.*\\W))|((?=.*[A-Z])(?=.*[0-9])(?=.*\\W))|((?=.*[a-z])(?=.*[0-9]))(?=.*)).*$",
					"g"
				);
				var lowRegex = new RegExp("(?=.{0,}).*", "g");
				if (
					highRegex.test(value) ||
					highRegex2.test(value) ||
					highRegex3.test(value) ||
					highRegex4.test(value)
				) {
					this.switchToggle.passwordStrength = 2;
					callback();
				} else if (middleRegex.test(value)) {
					this.switchToggle.passwordStrength = 1;
					callback();
				} else {
					this.switchToggle.passwordStrength = 0;
					callback();
				}
			},
			data: {
				Wallet: "",
				Password: ""
			}
		};
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		}
	},
	watch: {
		lang(value) {
			const vm = this;
			vm.privateKeyRules = {
				PrivateKey: [
					{
						required: true,
						message: vm.$t("account.pleaseFillYourPrivateKey"),
						trigger: "blur"
					}
				],
				Label: [
					{
						required: true,
						message: vm.$t("account.pleaseFillYourName"),
						trigger: "blur"
					},
					{
						validator: validateAccount,
						trigger: ["blur"]
					}
				],
				Password: {
					validator: validatePassword,
					required: true,
					trigger: ["blur", "change"]
				},
				Confirm: {
					validator: vm.validatePasswordConfirm,
					required: true,
					trigger: ["blur"]
				}
			};
		}
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
						text: vm.$t("account.importing"),
						target: ".loading"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						const result = res.Result;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
						// window.location.href = location.origin + location.pathname; // success login link to home page
						// console.log(location.pathname)
						// window.location.href = location.origin + location.pathname; // success login link to home page
						ipcRenderer.send("run-dialog-event", {
							name: "setLoginStatus",
							data: true
						});
						vm.$router.replace({
							name: "LoginLog"
						});
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("account.networkErrorImportWalletFileFailed")
						);
					} else {
						vm.$message.error(vm.$t('error.requestTimeout'));
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
									text: vm.$t("account.importing"),
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
								// window.location.href = location.origin + location.pathname; // success login link to home page
								ipcRenderer.send("run-dialog-event", {
									name: "setLoginStatus",
									data: true
								});
								vm.$router.replace({
									name: "LoginLog"
								});
							} else {
								this.$message.error(this.$t(`error[${res.Error}]`));
							}
						})
						.catch(e => {
							if (!e.message.includes("timeout")) {
								this.$message.error(
									vm.$t("account.networkErrorImportPrivateKeyFailed")
								);
							} else {
								this.$message.error(vm.$t('error.requestTimeout'));
							}
						});
				}
			});
		},
		attach() {
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ['progress', 'account'],
					id: remote.getCurrentWebContents().id
				}
			});
		}
	},
	mounted() {
		const vm = this;
		ipcRenderer.on("dialog-load", (e) => {
			vm.attach();
		});
		vm.attach();
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
	.el-form textarea {
		padding: 15px;
		font-size: 1.4rem;
		text-align: left;
		height: 130px;
		border-radius: 2px;
		word-break: break-all;
		transition: all 0.3s ease;
		border: 0;
		@include themify {
			background-color: $card-color;
		}
	}
	.input-opeation {
		position: absolute;
		bottom: -4rem;
		right: 0;
		button {
			line-height: normal;
			height: 2.4rem;
			padding-top: 0px;
			padding-bottom: 0px;
		}
	}
}
</style>
