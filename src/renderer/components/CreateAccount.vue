<template>
	<div
		id="create-account"
		class="account-wrap"
	>
		<div class="account-box">
			<h2
				class="theme-font-blue account-title user-no-select"
				v-if="accountStatus === 1"
			>Block synchronization</h2>
			<h2
				class="theme-font-blue account-title"
				v-if="accountStatus === 0"
			>{{step === 1?'Backup Your Keystore File':step === 2?'Backup Your Private Key(WIF)':step===3?'Private Key(WIF) Repeat':'Create Account'}}</h2>
			<div v-if="accountStatus === 0">
				<el-form
					class="form"
					v-show="step === 0"
					ref='form'
					:model='form'
					:rules='rules'
				>
					<el-form-item
						label="User Name"
						prop='Label'
					>
						<el-input
							v-model="form.Label"
							class="grey-theme"
							placeholder="Input User Name"
						></el-input>
					</el-form-item>
					<el-form-item
						label="Wallet Password"
						prop='Password'
					>
						<el-input
							v-model="form.Password"
							type="password"
							placeholder="Input Wallet Password"
							show-password
							class="grey-theme"
						></el-input>
					</el-form-item>
					<el-form-item
						label="Confirm Wallet Password"
						prop='Confirm'
					>
						<el-input
							v-model="form.Confirm"
							@keyup.enter.native="submitForm('form')"
							placeholder="Confirm Your Wallet Password"
							show-password
							type="password"
							class="grey-theme"
						></el-input>
					</el-form-item>
					<p class="grey-xs ft14">This password is used to recover the account from the keystore file, and all related payment needs to be used.</p>
					<el-button
						class="account-button"
						type='primary'
						@click="submitForm('form')"
					>Submit</el-button>
				</el-form>
				<div
					class="step"
					v-if="step===1"
				>
					<div class="flex between">
						<!-- <p> Backup your </p> -->
						<el-button
							class="primary margin-center mt20 mb20"
							@click="$exportFile(validation.Wallet,'Wallet')"
						>Save as File</el-button>
					</div>
					<p class="stop-desc ft14 mt20 mb20">This Keystore File is an account file encrypted based on the private key(WIF). After re-importing, you need to enter a password to log in to the account. Although losing this file will not pose a direct threat to the account, please keep it safe.</p>
					<p class="back-class ft14">
						<a @click="setStep(0)">Back</a>
					</p>
					<el-button
						type="primary"
						@click="setStep()"
					>Next</el-button>
				</div>
				<div
					class="step"
					v-if="step===2"
				>
					<!-- <p>Backup your Private Key(WIF)</p> -->
					<p class="back-border-class">{{validation.PrivateKey}}</p>
					<el-button
						class="primary"
						@click="clip(validation.PrivateKey)"
					>Copy</el-button>
					<el-button
						class="primary"
						@click="$exportFile(validation.PrivateKey,'PrivateKey')"
					>Save as File</el-button>
					<p
						class="mt20 mb20 ft14"
						style="color:#e95464"
					>Keep this Private Key(WIF) safe.You can always use this key to get your wallet back without any password if something happens to your browser or computer. But make sure to protect it — anyone who gets this key could steal your wallet. It’s probably safest to write it down on a piece of paper, or wherever else you keep important info.</p>
					<!-- <el-button @click="setStep(1)">Return</el-button> -->
					<p class="back-class ft14">
						<a @click="setStep(1)">Back</a>
					</p>
					<el-button
						type="primary"
						@click="setStep()"
					>Next</el-button>
				</div>
				<div
					class="step"
					v-if="step ===3"
				>
					<div class="flex between ai-center">
						<!-- <p></p> -->
						<el-button
							@click="importFile"
							class="primary margin-center mt20 mb20"
						>Import Private Key(WIF) File</el-button>
					</div>
					<el-input
						class="mt20 mb20 ft14 back-border-input-class grey-theme"
						type="textarea"
						:row="4"
						v-model="validation.confirmPrivateKey"
						placeholder="Please input your private key(WIF)"
					></el-input>
					<!-- <el-button @click="setStep(2)">Return</el-button> -->
					<p class="back-class ft14">
						<a @click="setStep(2)">Back</a>
					</p>
					<el-button
						type="primary"
						@click="importAccountWithPrivatekey"
					>Done</el-button>
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
				>{{(((currentHeihgt/totalHeight)?(currentHeihgt/totalHeight):0)*100).toFixed(2) +'%'}} (#{{currentHeihgt}} / #{{totalHeight}})</p>
				<p class="ft12 dark-grey bold text-center mt20 user-no-select">
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 0}">Synchronizing</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 1}">blocks</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 2}">at</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 3}">the</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 4}">speed</span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 5}">of </span>
					<span :class="{'ft30 ml10 mr10':loopFontIndex === 6}">light</span> ……</p>
			</div>
		</div>
	</div>
</template>
<script>
import { clipboard, ipcRenderer } from "electron";
export default {
	mounted() {
		document.title = localStorage.Address
			? "CreateAccount"
			: "Block synchronization";
		this.loopFont();
		this.$store.dispatch("getChannelInitProgress");
		this.getAccountStatus();
	},
	data() {
		let validatePassword = (rule, value, callback) => {
			if (this.form.Password === this.form.Confirm) {
				callback();
			} else {
				callback(new Error("Inconsistent passwords filled in twice"));
			}
		};
		return {
			clipboard,
			loopFontIndex: 0,
			// initChannelProgress: 0.5,
			accountStatus: "", // 0: no account, 1:account exist
			progress: 0,
			switchToggle: {
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
			}
		};
	},
	computed: {
		initChannelProgress: function() {
			if (
				this.$store.state.Home.initChannelProgress &&
				this.switchToggle.loading
			) {
				this.switchToggle.loading.close();
				this.switchToggle.loading = null;
			}
			return this.$store.state.Home.initChannelProgress;
		},
		currentHeihgt: function() {
			if (this.$store.state.Home.initChannelProgress) {
				return this.$store.state.Home.currentHeight || 0;
			}
		},
		totalHeight: function() {
			if (this.$store.state.Home.initChannelProgress) {
				return this.$store.state.Home.totalHeight || 0;
			}
		}
	},
	watch: {
		accountStatus: function(value) {
			console.log("acountStatus changed!!!");
			console.log(value);
			if (value === 1) {
				console.log("set Title");
				document.title = "Block synchronization";
			}
		}
	},
	methods: {
		clip(content) {
			clipboard.writeText(content);
			this.$message({
				message: "Copied",
				duration: 1200,
				type: "success"
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
			if (!this.switchToggle.submitSwitch) {
				return;
			}
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.switchToggle.submitSwitch = false;
					this.$axios
						.post(this.$api.account, this[formName], {
							loading: {
								text: "Creating",
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
								this.$message.error(
									this.$i18n.error[res.Error]
										? this.$i18n.error[res.Error][this.$language]
										: `error code is ${res.Error}`
								);
							}
						});
				}
			});
		},
		importAccountWithPrivatekey() {
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
							text: "Creating",
							target: ".step"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						this.accountStatus = 1;
						this.$store.dispatch("getChannelInitProgress");
						const result = res.Result;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
						this.switchToggle.submitSwitch = true;
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
						this.switchToggle.submitSwitch = true;
					}
				});
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
.account-box {
	display: flex;
	flex-direction: column;
	.step {
		width: 450px;
		text-align: center;
		margin: 0 auto;
		font-size: 16px;
		p {
			text-align: left;
			&.back-border-class {
				margin: 20px 0;
				padding: 15px;
				font-size: 14px;
				text-align: left;
				height: 130px;
				background: #edeff4;
				border-radius: 2px;
				color: rgba(32, 32, 32, 0.7);
				word-break: break-all;
			}
			&.el-loading-text {
				text-align: center;
			}
			&.stop-desc {
				color: rgba(32, 32, 32, 0.4);
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
				font-size: 14px;
				text-align: left;
				height: 130px;
				background: #edeff4;
				border-radius: 2px;
				color: rgba(32, 32, 32, 0.7);
				word-break: break-all;
				border: 0;
				transition: all 0.3s ease;
				&:focus {
					background: #e0e2e6;
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
		font-size: 12px;
		width: 600px;
		margin: 0 auto;
		.create-progress {
			position: relative;
			flex: 1;
			height: 40px;
			margin: 0 25px;
			.progress-circle-min {
				height: 100%;
				background: url("../assets/images/progress_cricle_min.svg") no-repeat 0
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
					font-size: 35px;
					height: 40px;
					line-height: 40px;
					transform: translate(-10px);
					color: #9b9fb0;
				}
			}
		}
	}
	.el-form .el-input__inner {
		background: #edeff4;
		border: 0;
		border-radius: 2px;
	}
}
</style>
