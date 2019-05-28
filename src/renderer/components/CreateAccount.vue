<template>
	<div
	 id="create-account "
	 class="account-wrap"
	>
		<div class="account-box">
			<h2 class="theme-font-blue account-title">Create Account</h2>
			<el-form
			 v-if="(initChannelProgress <= 0) || (initChannelProgress >= 1)"
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
					></el-input>
				</el-form-item>
				<el-form-item
				 label="Confirm password"
				 prop='Confirm'
				>
					<el-input
					 v-model="form.Confirm"
					 type="password"
					></el-input>
				</el-form-item>
				<p class="grey-xs bold">Please remember this password， if you lose this password， the backup file cannot be decrypted any more</p>
				<el-button
				 class="account-button"
				 type='primary'
				 @click="submitForm('form')"
				>Submit</el-button>
			</el-form>
			<div
			 class="progress-wrap"
			 v-if="(initChannelProgress >0) && (initChannelProgress <1)"
			>
				<div class="flex ai-center">
					<span>0%</span>
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
					<span>100%</span>
				</div>
				<p class="ft12 mt20" style="text-align:center">{{initChannelProgress*100 +'%'}}</p>
				<p class="ft12 dark-grey bold text-center mt20">Synchronizing <span
					 style="font-size:30px;"
					 class="ml10 mr10"
					>blocks</span> at the speed of light...…</p>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	mounted() {
		document.title = "CreateAccount";
		this.$store.dispatch("getChannelInitProgress");
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
			createStatus: 0, // 0: nothing, 1: creating
			progress: 0,
			submitSwitch: true,
			form: {
				Label: "",
				Password: "",
				Confirm: "",
				KeyType: "ecdsa",
				Curve: "P-256",
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
			},
		};
	},
	computed: {
		initChannelProgress: function() {
			return this.$store.state.Home.initChannelProgress;
		}
	},
	methods: {
		submitForm(formName) {
			if (!this.submitSwitch) {
				return;
			}
			this.submitSwitch = false;
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.$axios
						.post(this.$api.account, this[formName])
						.then(res => {
							const data = res.data;
							if (data.Desc === "SUCCESS") {
								this.$store.dispatch("getChannelInitProgress");
								const result = data.Result;
								for (let key in result) {
									window.localStorage.setItem(key, result[key]);
								}
							}
						})
						.catch(err => {
							console.error(err);
							this.submitSwitch = true;
						});
				}
			});
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
.progress-wrap {
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
</style>
