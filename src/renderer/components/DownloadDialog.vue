<template>
	<div id="download-dialog">
		<h2>Donload URL:</h2>
		<el-input v-model="downloadUrl"></el-input>
		<div style="text-align:center; margin-top:20px">
			<el-button type="primary">Download</el-button>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			downloadUrl: ""
		};
	},
	methods: {
		toDownload() {
			this.$axios
				.post(this.$api.download, {
					Hash: this.downloadUrl,
					MaxPeerNum: 10
				})
				.then(res => {
					if (res.data.Error === 0) {
						this.$store.dispatch("setUpload");
						this.$router.push({
							name: "transfer",
							query: {
								transferType: 1
							}
						});
					}
				});
		}
	}
};
</script>
<style lang="scss">
</style>
