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
			>{{step === 1?'Backup your Keystore File':step === 2?'Backup your private key(WIF)':step===3?'Private key(WIF) repeat':'Create Account'}}</h2>
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
						<el-input v-model="form.Label" class="grey-theme"></el-input>
					</el-form-item>
					<el-form-item
					 label="Password"
					 prop='Password'
					>
						<el-input
						 v-model="form.Password"
						 type="password"
						 show-password
						 class="grey-theme"
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
						<el-button class="primary margin-center mt20 mb20" @click="$exportFile(validation.Wallet,'Wallet')">Save as File</el-button>
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
					<el-button class="primary" @click="clip(validation.PrivateKey)">Copy</el-button>
					<el-button  class="primary" @click="$exportFile(validation.PrivateKey,'PrivateKey')">Save as File</el-button>
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
						<el-button @click="importFile" class="primary margin-center mt20 mb20">Import private key(WIF) file</el-button>
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
	watch:{
		accountStatus: function(value){
			console.log('acountStatus changed!!!')
			console.log(value);
			if(value === 1){
				console.log('set Title');
				document.title = 'Block synchronization';
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
						this.accountStatus = 1;
						this.$store.dispatch("getChannelInitProgress");
						const result = data.Result;
						for (let key in result) {
							window.localStorage.setItem(key, result[key]);
						}
					} else if (data.Error === 40002) {
						this.$message.error(
							"Create Failed. Private key(WIF) verification failed."
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
			&.back-border-class {
				margin: 20px 0;
				padding: 15px;
				font-size: 14px;
				text-align: left;
				height: 130px;
				background: #EDEFF4;
				border-radius: 2px;
				color: rgba(32, 32, 32, .7);
				word-break: break-all;
			}
			&.el-loading-text {
				text-align: center;
			}
			&.stop-desc {
				color: rgba(32, 32, 32, .4);
			}
		}
		.back-class {
			text-align: center;
			margin-bottom: 20px;
			& > a {
				color:#2F8FF0;
				user-select: none;
				cursor: pointer;
				&:hover {
					opacity: .7;
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
				background: #EDEFF4;
				border-radius: 2px;
				color: rgba(32, 32, 32, .7);
				word-break: break-all;
				border: 0;
				transition: all .3s ease;
				&:focus {
					background: #E0E2E6;
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
		background: #EDEFF4;
		border: 0;
		border-radius: 2px;
	}
}
</style>
