<template>
	<div id="create-account">
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
		</el-form>
		<el-button
		 type='primary'
		 @click="submitForm('form')"
		>Submit</el-button>
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
#create-account {
	margin: 20px auto;
}
</style>
