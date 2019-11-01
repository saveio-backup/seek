<template>
	<div id="login" class="login-wrapper">
		<div class="login-wrapper loading">
			<el-form @submit.native.prevent>
				<el-form-item :label="$t('public.address')+':'">
					<el-input
						type="textarea"
						v-model="data.Address"
						cols="30"
						rows="10"
						class="grey-theme"
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
						class="grey-theme"
						show-password
						@keyup.enter.native='login'
					></el-input>
				</el-form-item>
			</el-form>
			<div class="text-center">
				<ripper-button
					@click="login"
					class="import-button account-button text-center"
					type="primary"
				>{{$t('login.login')}}</ripper-button>
			</div>
		</div>
	</div>
</template>
<script>
export default {
  name: 'Login',
  data() {
    return {
      data: {
        Password: '',
        Address: localStorage.getItem('Address')
      }
    }
  },
  methods: {
    login() {
      const vm = this;
      // alert('login');
      let params = {
        Password: this.data.Password
      }
      this.$axios.post(this.$api.login, params, {
        loading: {
          text: vm.$t('login.logining'),
          target: ".loading.login-wrapper"
        }
      }).then(res => {
        if(res.Error === 0) {
          this.$router.replace({
            name: 'Home'
          })
        } else {
          this.$message.error(this.$t(`error[${res.Error}]`));
        }
      }).catch(e => {
        if (!e.message.includes("timeout")) {
          this.$message.error(vm.$t('login.networkErrorLoginFailed'));
        }
      })
    }
  }
};
</script>
<style lang="scss">
#login {
  width: 500px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-around;
  // height: 100%;
  align-items: center;
  padding-top: 80px;

  & > .login-wrapper {
    width: 100%;
    textarea {
      padding: 15px;
      font-size: 1.4rem;
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
  }
}
</style>