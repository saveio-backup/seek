<template>
	<div id="create-account " class="account-wrap">
		<div class=" account-box">
			<h2 class="theme-font-blue account-title">Create Account</h2>
			<el-form
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
		</div>
	</div>
</template>
<script>
export default {
	data() {
		let validatePassword = (rule, value, callback) => {
			if (this.form.Password === this.form.Confirm) {
				callback();
			} else {
				callback(new Error("Inconsistent passwords filled in twice"));
			}
		};
		return {
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
			}
		};
	},
	methods: {
		submitForm(formName) {
			if (!this.submitSwitch) {
				return;
			}
			this.$refs[formName].validate(valid => {
				if (valid) {
					// this.submitSwitch = false;
					this.$axios
						.post(this.$api.account, this[formName])
						.then(res => {
							const data = res.data;
							if (data.Desc === "SUCCESS") {
								const result = data.Result;
								for (let key in result) {
									window.localStorage.setItem(key, result[key]);
								}
								window.location.href = "/"; // success login link to home page
							}
						})
						.catch(err => {
							console.error(err);
						});
				}
			});
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
// #create-account {
// 	.create-box {
// 		background: #fff;
// 		width: 100%;
// 		height: 100%;
// 	}
// 	padding: 50px 80px 120px;
// 	background: #eeeef1;
// 	width: 100%;
// 	height: 100vh;
// 	.create-title {
// 		text-align: center;
// 		opacity: 0.6;
// 		font-weight: bold;
// 		font-size: 24px;
// 		padding-top: 60px;
// 		padding-bottom: 35px;
// 	}
// 	.el-form {
// 		width: 410px;
// 		margin: 0 auto;
// 		.el-input__inner {
// 			&:focus {
// 				border-color: #dcdfe6;
// 			}
// 			height: 35px;
// 			line-height: 35px;
// 			border-radius: 2px;
// 			background: #ebecef;
// 		}
// 		.el-form-item.is-success .el-input__inner {
// 			border-color: #dcdfe6;
// 		}
// 		.el-form-item__label {
// 			&:before {
// 				content: "";
// 			}
// 			height: 24px;
// 			line-height: 24px;
// 			color: $theme-font-blue;
// 			font-weight: bold;
// 		}
// 		.create-button{
// 			display:block;
// 			border-radius: 2px;
// 			margin:20px auto 0;
// 			padding: 8px 20px;
// 		}
// 	}
// }
</style>
