<template>
	<div
	 id="create-account "
	 class="account-wrap"
	>
		<div class="account-box">
			<h2
			 class="theme-font-blue account-title"
			 v-if="accountStatus === 1"
			>Block synchronization</h2>
			<h2
			 class="theme-font-blue account-title"
			 v-if="accountStatus === 0"
			>Create Account</h2>
			<div v-if="accountStatus === 0">
				<el-form
				 class="form"
				 v-show="step === 0"
				 ref='form'
				 :model='form'
				 :rules='rules'
				>
					<el-form-item
					 label="Username"
					 prop='Label'
					>
						<el-input v-model="form.Label"></el-input>
					</el-form-item>
					<el-form-item
					 label="Password"
					 prop='Password'
					>
						<el-input
						 v-model="form.Password"
						 type="password"
						 show-password
						></el-input>
					</el-form-item>
					<el-form-item
					 label="Confirm password"
					 prop='Confirm'
					>
						<el-input
						 v-model="form.Confirm"
						 @keyup.enter.native="submitForm('form')"
						 show-password
						 type="password"
						></el-input>
					</el-form-item>
					<p class="grey-xs bold">Please remember this password， if you lose this password， the backup file cannot be decrypted any more</p>
					<el-button
					 class="account-button"
					 type='primary'
					 @click="submitForm('form')"
					>Next</el-button>
				</el-form>
				<div
				 class="step"
				 v-if="step===1"
				>
					<div class="flex between ai-center">
						<p> Backup your Wallet file</p>
						<el-button @click="$exportFile(validation.Wallet,'Wallet')">Save as File</el-button>
					</div>
					<p class="mt20 mb20">This wallet file is an account file encrypted based on the private key. After re-importing, you need to enter a password to log in to the account. Although losing this file will not pose a direct threat to the account, please keep it safe.</p>
					<el-button @click="setStep(0)">Return</el-button>
					<el-button
					 type="primary"
					 @click="setStep()"
					>Next</el-button>
				</div>
				<div
				 class="step"
				 v-if="step===2"
				>
					<p>Backup your Scrit key</p>
					<p class="privatekey">{{validation.PrivateKey}}</p>
					<el-button @click="clipboard.writeText(validation.PrivateKey)">Copy</el-button>
					<el-button @click="$exportFile(validation.PrivateKey,'PrivateKey')">Save as File</el-button>
					<p
					 clsas="mt20 mb20 ft14"
					 style="color:#e95464"
					>Keep this Scrit key safe.You can always use this key to get your wallet back without any password if something happens to your browser or computer. But make sure to protect it — anyone who gets this key could steal your wallet. It’s probably safest to write it down on a piece of paper, or wherever else you keep important info.</p>
					<el-button @click="setStep(1)">Return</el-button>
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
						<p>Scrit key repeat</p>
						<el-button @click="importFile">Import scrit key file</el-button>
					</div>
					<el-input
					 class="mt20 mb20"
					 type="text"
					 v-model="validation.confirmPrivateKey"
					 placeholder="Please input your Scrit key"
					></el-input>
					<el-button @click="setStep(2)">Return</el-button>
					<el-button
					 type="primary"
					 class="primary"
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
							 :style="{'width':initChannelProgress*100 +'%'}"
							></div>
							<span
							 class="ofont ofont-rocket"
							 :style="{'left':initChannelProgress*100 + '%'}"
							></span>
						</div>
					</div>
				</div>
				<p
				 class="ft12 mt20 dark-grey bold "
				 style="text-align:center"
				>{{(initChannelProgress*100).toFixed(2) +'%'}} (#{{currentHeihgt}} / #{{totalHeight}})</p>
				<p class="ft12 dark-grey bold text-center mt20">
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
		document.title = "CreateAccount";
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
	methods: {
		getAccountStatus() {
			this.$axios
				.get(this.$api.account)
				.then(res => {
					if (res.data.Error === 0 && res.data.Result.Address) {
						this.accountStatus = 1;
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
			if (!num) {
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
					this.switchToggle.loading = this.$loading({
						lock: true,
						text: "Creating",
						target: ".form"
					});
					this.$axios
						.post(this.$api.account, this[formName])
						.then(res => {
							const data = res.data;
							if (data.Desc === "SUCCESS") {
								this.validation.PrivateKey = data.Result.PrivateKey;
								this.validation.Wallet = data.Result.Wallet;
								this.setStep(1);
							}
							this.switchToggle.submitSwitch = true;
							this.switchToggle.loading.close();
						})
						.catch(() => {
							this.switchToggle.submitSwitch = true;
							this.switchToggle.loading.close();
						});
				}
			});
		},
		importAccountWithPrivatekey() {
			if (!this.switchToggle.submitSwitch) return;
			this.switchToggle.submitSwitch = false;
			this.switchToggle.loading = this.$loading({
				lock: true,
				text: "Creating",
				target: ".step"
			});
			this.$axios
				.post(this.$api.account + "/import/privatekey", {
					PrivateKey: this.validation.confirmPrivateKey,
					Password: this.form.Password,
					Label: this.form.Label
				})
				.then(res => {
					const data = res.data;
					if (data.Desc === "SUCCESS") {
						this.$store.dispatch("getChannelInitProgress");
						const result = data.Result;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
					} else if (data.Error === 40002) {
						this.$message.error(
							"Create Failed. Private key verification failed."
						);
						this.switchToggle.loading.close();
					} else {
						this.$message.error(res.data.Desc || "Create Failed");
						this.switchToggle.loading.close();
					}
					this.switchToggle.submitSwitch = true;
					// setTimeout(() => {
					// 	this.switchToggle.loading.close();
					// }, 4000);
				})
				.catch(() => {
					this.switchToggle.submitSwitch = true;
					this.switchToggle.loading.close();
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
			&.privatekey {
				margin: 20px 0;
				padding: 4px 8px;
				font-size: 14px;
				background: yellow;
				text-align: center;
			}
			&.el-loading-text {
				text-align: center;
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
}
</style>
