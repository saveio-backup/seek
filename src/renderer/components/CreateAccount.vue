<template>
	<div
		id="create-account"
		class="account-wrap theme-font-color"
	>
		<div class="account-box">
			<h2
				class="account-title user-no-select"
				v-if="accountStatus === 1"
			>{{$t('account.blockSynchronization')}}</h2>
			<h2
				class="account-title"
				v-if="accountStatus === 0"
			>{{step === 1?$t('account.backupYourKeystoreFile'):step === 2?$t('account.backupYourPrivateKey'):step===3?$t('account.privateKeyRepeat'):$t('account.createAccount')}}</h2>
			<div v-if="accountStatus === 0">
				<el-form
					class="form"
					v-show="step === 0"
					ref='form'
					:model='form'
					:rules='rules'
					@submit.native.prevent
				>
					<el-form-item
						:label="$t('account.userName')"
						prop='Label'
					>
						<el-input
							v-model="form.Label"
							class="grey-theme"
							:placeholder="$t('account.inputUserName')"
						></el-input>
					</el-form-item>
					<el-form-item
						:label="$t('public.walletPassword')"
						prop='Password'
					>
						<el-input
							v-model.trim="form.Password"
							type="password"
							:placeholder="$t('public.pleaseInputWalletPassword')"
							show-password
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
							v-model.trim="form.Confirm"
							@keyup.enter.native="submitForm('form')"
							:placeholder="$t('account.confirmWalletPassword')"
							show-password
							type="password"
							class="grey-theme"
						></el-input>
					</el-form-item>
					<p class="grey-xs ft14 break-word">{{$t('account.thisPasswordIsUsedToRecoverTheAccountFromTheKeystoreFile')}}</p>
					<ripper-button
						class="account-button text-center"
						@click="submitForm('form')"
					>
						{{$t('account.submit')}}
					</ripper-button>
				</el-form>
				<div
					class="step"
					v-if="step===1"
				>
					<div class="flex between">
						<ripper-button
							class="primary margin-center mt20 mb20"
							@click="exportFile(validation.Wallet,'keystore')"
						>{{$t('account.saveAsFile')}}</ripper-button>
					</div>
					<p class="stop-desc ft14 mt20 mb20 break-word">{{$t('account.thisKeystoreFileIsAnAccountFileEncryptedBasedOnThePrivateKey')}}</p>
					<p class="back-class ft14">
						<a @click="setStep(0)">{{$t('account.back')}}</a>
					</p>
					<ripper-button @click="setStep()">{{$t('account.next')}}</ripper-button>
				</div>
				<div
					class="step"
					v-if="step===2"
				>
					<p class="back-border-class">{{validation.PrivateKey}}</p>
					<ripper-button
						class="primary"
						@click="clip(validation.PrivateKey)"
					>{{$t('account.copy')}}</ripper-button>
					<ripper-button
						class="primary"
						@click="exportFile(validation.PrivateKey,'PrivateKey')"
					>{{$t('account.saveAsFile')}}</ripper-button>
					<p
						class="mt20 mb20 ft14 break-word"
						style="color:#e95464"
					>{{$t('account.keepThisPrivateKeySafe')}}</p>
					<p class="back-class ft14">
						<a @click="setStep(1)">{{$t('account.back')}}</a>
					</p>
					<ripper-button @click="setStep()">{{$t('account.next')}}</ripper-button>
				</div>
				<div
					class="step"
					v-if="step ===3"
				>
					<div class="flex between ai-center">
						<ripper-button
							@click="importFile"
							class="primary margin-center mt20 mb20"
						>{{$t('account.importPrivateKeyFile')}}</ripper-button>
					</div>
					<el-input
						class="mt20 mb20 ft14 back-border-input-class grey-theme"
						type="textarea"
						resize="none"
						:row="4"
						v-model="validation.confirmPrivateKey"
						:placeholder="$t('account.pleaseInputYourPrivateKey')"
					></el-input>
					<p class="back-class ft14">
						<a @click="setStep(2)">{{$t('account.back')}}</a>
					</p>
					<ripper-button @click="verifyPrivateKey">{{$t('account.done')}}</ripper-button>
				</div>
			</div>
			<div
				class="progress-wrap"
				v-if="accountStatus === 1"
			>
				<div class="flex ai-center">
					<div class="create-progress">
						<div class="progress-circle-min"></div>
						<div class="progress-mask">
							<div
								class="progress-circle"
								:style="{'width':((currentHeihgt/totalHeight)?(currentHeihgt/totalHeight):0)*100 +'%'}"
							></div>
							<span
								class="ofont ofont-rocket"
								:style="{'left':((currentHeihgt/totalHeight)?(currentHeihgt/totalHeight):0)*100 + '%'}"
							></span>
						</div>
					</div>
				</div>
				<p
					class="ft12 mt20 dark-grey bold "
					style="text-align:center"
				>{{prograssPercentage +'%'}} (#{{currentHeihgt}} / #{{totalHeight}})</p>
				<p class="ft12 dark-grey bold text-center mt20 user-no-select">
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 0}">{{$t('account.pr1')}}</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 1}">{{$t('account.pr2')}}</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 2}">{{$t('account.pr3')}}</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 3}">{{$t('account.pr4')}}</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 4}">{{$t('account.pr5')}}</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 5}">{{$t('account.pr6')}}</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 6}">{{$t('account.pr7')}}</span> ……</p>
			</div>
		</div>
	</div>
</template>
<script>
import { clipboard, ipcRenderer } from "electron";
const remote = require('@electron/remote')
import util from "./../assets/config/util";
export default {
	created() {
		document.title = localStorage.Address
			? this.$t("account.blockSynchronization")
			: this.$t("account.createAccount");
	},
	mounted() {
		const vm = this;
		ipcRenderer.on("dialog-load", e => {
			vm.attach();
		});
		vm.attach();
		this.loopFont();
		this.getAccountStatus();
	},
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
			if (this.form.Password === this.form.Confirm) {
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
			}
		};
		return {
			util,
			validatePassword,
			validatePasswordConfirm,
			validateAccount,
			clipboard,
			loopFontIndex: 0,
			accountStatus: "", // 0: no account, 1:account exist
			switchToggle: {
				passwordStrength: -1,
				loading: null,
				submitSwitch: true
			},
			step: 0,
			validation: {
				PrivateKey: "",
				confirmPrivateKey: ""
			},
			form: {
				Label: "",
				Password: "",
				Confirm: "",
				KeyType: "ecdsa",
				Curve: "P-256",
				CreateOnly: true,
				Scheme: "SHA256withECDSA"
			},
			rules: {
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
					required: true,
					validator: validatePassword,
					trigger: ["change", "blur"]
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
				let middleRegex = new RegExp(
					"^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z])(?=.*\\W))|((?=.*[A-Z])(?=.*[0-9])(?=.*\\W))|((?=.*[a-z])(?=.*[0-9]))(?=.*)).*$",
					"g"
				);
				let lowRegex = new RegExp("(?=.{0,}).*", "g");
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
			}
		};
	},
	computed: {
		prograssPercentage() {
			return (
				(this.currentHeihgt / this.totalHeight
					? this.currentHeihgt / this.totalHeight
					: 0) * 100
			).toFixed(2) === "100.00"
				? "99.99"
				: (
						(this.currentHeihgt / this.totalHeight
							? this.currentHeihgt / this.totalHeight
							: 0) * 100
				  ).toFixed(2);
		},
		currentHeihgt() {
			return this.$store.state.Home.currentHeight || 0;
		},
		totalHeight() {
			return this.$store.state.Home.totalHeight || 0;
		},
		lang() {
			return this.$i18n.locale;
		}
	},
	watch: {
		lang(value) {
			const vm = this;
			document.title = localStorage.Address
				? vm.$t("account.blockSynchronization")
				: vm.$t("account.createAccount");
			vm.rules = {
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
					message: vm.$t("account.pleaseFillYourPassword"),
					required: true,
					trigger: ["blur", "change"]
				},
				Confirm: {
					validator: vm.validatePasswordConfirm,
					required: true,
					trigger: ["blur"]
				}
			};
		},
		accountStatus(value) {
			if (value === 1) {
				document.title = this.$t("account.blockSynchronization");
			}
		}
	},
	methods: {
		attach() {
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ["progress", "account", "state"],
					id: remote.getCurrentWebContents().id
				}
			});
		},
		exportFile(contents, fileName) {
			const vm = this;
			this.$exportFile(contents, fileName, function() {
				vm.$message({
					message: vm.$t("dialog.exportSuccess"),
					type: "success"
				});
			});
		},
		getAccountStatus() {
			this.$axios
				.get(this.$api.account)
				.then(res => {
					if (res.Error === 0) {
						if (res.Result.Address) {
							this.accountStatus = 1;
						} else {
							this.accountStatus = 0;
						}
					} else {
						this.accountStatus = 0;
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
		clip(content) {
			const vm = this;
			clipboard.writeText(content);
			this.$message({
				message: vm.$t("public.copied"),
				duration: 1200,
				type: "success"
			});
		},
		importFile() {
			ipcRenderer.send("open-file-dialog");
			ipcRenderer.once("selected-file", (event, content) => {
				this.validation.confirmPrivateKey = content;
			});
		},
		loopFont() {
			setInterval(() => {
				if (this.loopFontIndex >= 6) {
					this.loopFontIndex = 0;
				} else {
					this.loopFontIndex++;
				}
			}, 700);
		},
		setStep(num) {
			if (!num && num != 0) {
				this.step += 1;
			} else {
				this.step = num;
			}
		},
		submitForm(formName) {
			const vm = this;
			if (!this.switchToggle.submitSwitch) {
				return;
			}
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.switchToggle.submitSwitch = false;
					this.$axios
						.post(this.$api.account, this[formName], {
							loading: {
								text: vm.$t("account.creating"),
								target: ".form"
							}
						})
						.then(res => {
							if (res.Error === 0) {
								this.validation.PrivateKey = res.Result.PrivateKey;
								this.validation.Wallet = res.Result.Wallet;
								this.setStep(1);
								this.switchToggle.submitSwitch = true;
							} else {
								this.switchToggle.submitSwitch = true;
								// this.$message.error(this.$t(`error[${res.Error}]`));
							}
						})
						.catch(e => {
							if (!e.message.includes("timeout")) {
								this.$message.error(vm.$t("account.networkErrorCreateFailed"));
							} else {
								this.$message.error(vm.$t('error.requestTimeout'));
							}
						});
				}
			});
		},
		verifyPrivateKey() {
			if (this.validation.confirmPrivateKey !== this.validation.PrivateKey) {
				this.$message.error(
					this.$t("account.PrivateKeyVerificationIsInconsistent")
				);
				return;
			} else {
				this.importAccountWithPrivatekey();
			}
		},
		importAccountWithPrivatekey() {
			const vm = this;
			if (!this.switchToggle.submitSwitch) return;
			this.switchToggle.submitSwitch = false;
			this.$axios
				.post(
					this.$api.account + "/import/privatekey",
					{
						PrivateKey: this.validation.confirmPrivateKey,
						Password: this.form.Password,
						Label: this.form.Label
					},
					{
						loading: {
							text: vm.$t("account.creating"),
							target: ".step"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						const result = res.Result;
						this.accountStatus = 1;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
						this.switchToggle.submitSwitch = true;
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
						this.switchToggle.submitSwitch = true;
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("account.networkErrorImportPrivateKeyFailed")
						);
					} else {
						vm.$message.error(vm.$t('error.requestTimeout'));
					}
				});
		}
	}
};
</script>
<style lang="scss">
.account-box {
	display: flex;
	flex-direction: column;
	.step {
		width: 450px;
		text-align: center;
		margin: 0 auto;
		font-size: 1.6rem;
		p {
			text-align: left;
			&.back-border-class {
				margin: 20px 0;
				padding: 15px;
				font-size: 1.4rem;
				text-align: left;
				height: 130px;
				border-radius: 2px;
				word-break: break-all;
				@include themify {
					background-color: $card-color;
				}
			}
			&.el-loading-text {
				text-align: center;
			}
		}
		.back-class {
			text-align: center;
			margin-bottom: 20px;
			& > a {
				color: #2f8ff0;
				user-select: none;
				cursor: pointer;
				&:hover {
					opacity: 0.7;
				}
				&:active {
					opacity: 1;
				}
			}
		}
		.back-border-input-class {
			textarea {
				margin: 20px 0;
				padding: 15px;
				font-size: 1.4rem;
				text-align: left;
				height: 130px;
				border-radius: 2px;
				word-break: break-all;
				border: 0;
				transition: all 0.3s ease;
				@include themify {
					background-color: $card-color;
				}
			}
		}
	}
	.progress-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		transform: translateY(-65px);
		font-size: 1.2rem;
		width: 600px;
		margin: 0 auto;
		.create-progress {
			position: relative;
			flex: 1;
			height: 40px;
			margin: 0 25px;
			.progress-circle-min {
				height: 100%;
				background: url("../assets/images/progress_circle_min.svg") no-repeat 0
					center;
			}
			.progress-mask {
				position: absolute;
				left: 0px;
				top: 0px;
				width: 100%;
				height: 100%;
				.progress-circle {
					position: absolute;
					top: 0px;
					width: 100%;
					height: 100%;
					background: url("../assets/images/progress_circle.svg") no-repeat 0
						center;
				}
				.ofont-rocket {
					position: absolute;
					font-size: 3.5rem;
					height: 40px;
					line-height: 40px;
					transform: translate(-10px);
					color: #9b9fb0;
				}
			}
		}
	}
}
</style>
