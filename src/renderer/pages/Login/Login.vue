<template>
	<div id="login">
		<div class="login-wrapper loading">
			<el-form @submit.native.prevent>
				<h1 class="mb50 active-blue">{{data.Label}}</h1>
				<el-form-item :label="$t('public.address')+':'">
					<el-input
						type="textarea"
						resize="none"
						v-model="data.Address"
						cols="30"
						rows="10"
						class="grey-theme login-form-item"
						disabled
					>
					</el-input>
				</el-form-item>
				<el-form-item :label="$t('public.walletPassword')+':'">
					<el-input
						v-model="data.Password"
						:placeholder="$t('public.pleaseInputWalletPassword')"
						type="password"
						:rows="2"
						class="grey-theme login-form-item"
						show-password
						@keyup.enter.native='login'
					></el-input>
				</el-form-item>
			</el-form>
			<div class="flex around mt80">
				<ripper-button
					@click="login"
					class="primary import-button account-button text-center"
					type="primary"
				>{{$t('login.login')}}</ripper-button>
				<ripper-button
					class="import-button account-button text-center"
					@click="goPage('/ImportAccount')"
					type="primary"
				>{{$t('account.importAccount')}}</ripper-button>
				<ripper-button
					class="import-button account-button text-center"
					@click="goPage('/CreateAccount')"
					type="primary"
				>{{$t('account.createAccount')}}</ripper-button>
			</div>
		</div>
	</div>
</template>
<script>
import {
  ipcRenderer
} from 'electron';
export default {
	name: "login",
	data() {
		return {
			data: {
				Password: "",
				Label: localStorage.getItem("Label"),
				Address: localStorage.getItem("Address")
			}
		};
	},
	mounted() {
		document.title = this.$t("login.login");
		this.$store.dispatch("setCurrentAccount");
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
		Address() {
			return (
				(this.$store.state.Home.account &&
					this.$store.state.Home.account.Address) ||
				localStorage.getItem("Address")
			);
		}
	},
	watch: {
		lang() {
			document.title = this.$t("login.login");
		}
	},
	methods: {
		goPage(path) {
			this.$router.push({
				path: path
			});
		},
		login() {
			const vm = this;
			// alert('login');
			let params = {
				Password: this.data.Password
			};
			this.$axios
				.post(this.$api.login, params, {
					loading: {
						text: vm.$t("login.logining"),
						target: ".loading.login-wrapper"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						ipcRenderer.send("run-dialog-event", {
              name: "setLoginStatus",
              data: true
						});
						this.$router.replace({
							name: "LoginLog"
						});
					} else {
						// remote.getCurrentWindow().send('login-status', false);
						ipcRenderer.send("run-dialog-event", {
              name: "setLoginStatus",
              data: false
            });
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(vm.$t("login.networkErrorLoginFailed"));
					} else {
						this.$message.error(this.$t('error.requestTimeout'));
					}
				});
		}
	}
};
</script>
<style lang="scss">
#login {
	height: 100%;
	display: flex;
	justify-content: space-around;
	padding: 80px;

	& > .login-wrapper {
		width: 500px;
		textarea {
			padding: 15px;
			font-size: 1.4rem;
			text-align: left;
			height: 130px;
			border-radius: 2px;
			word-break: break-all;
			border: 0;
			word-break: break-all;
			transition: all 0.3s ease;
			&:focus {
				background: #e0e2e6;
			}
		}
	}
	.ripper-button button {
		width: 125px;
		padding-left: 10px;
		padding-right: 10px;
	}
	.login-form-item {
		// input{
		margin-top: 10px;
		// }
	}
}
</style>