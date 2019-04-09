<template>
	<div id="import-account">
		<p>Secret Key</p>
		<el-input
		 type="textarea"
		 v-model="data.secret"
		 cols="30"
		 rows="10"
		 placeholder="key"
		></el-input>
		<p>Password</p>
		<el-input v-model="data.password"></el-input>
		<div style="text-align:center; margin-top: 10px;">
			<el-button
			 @click="importAccount"
			 class="import-button"
			 type="primary"
			>Import</el-button>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			data: {
				secret: "",
				password: ""
			}
		};
	},
	methods: {
		importAccount() {
			this.$axios
				.post(this.$api.account + "/import", data)
				.then(res => {})
				.catch(res => {});
		}
	}
};
</script>
<style lang="scss">
#import-account {
	margin: 20px auto;
	.import-button {
	}
}
</style>
