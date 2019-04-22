<template>
	<div id="download-dialog">
		<h2>Donload URL:</h2>
		<el-input
		 v-model="downloadUrl"
		 @input='toGetFileInfo'
		></el-input>
		<div style="text-align:center; margin-top:20px">
			<div class="flex between">
				<p>Name:</p>
				<p>{{downloadInfo.Name || ''}}</p>
			</div>
			<div class="flex between">
				<p>Size:</p>
				<p>{{downloadInfo.Size || ''}}</p>
			</div>
			<div class="flex between">
				<p>Cost:</p>
				<p>{{downloadInfo.Fee || ''}}</p>
			</div>
			<el-button type="primary" @click="toDownload">Download</el-button>
		</div>
	</div>
</template>
<script>
let timer = null;
import { ipcRenderer } from "electron";
export default {
	data() {
		return {
			downloadUrl: "",
			downloadInfo: {}
		};
	},
	methods: {
		toGetFileInfo() {
			const path = ipcRenderer.sendSync(
				"string-to-hex",
				encodeURIComponent(this.downloadUrl)
			);
			clearTimeout(timer);
			timer = setTimeout(() => {
				this.$axios.get(this.$api.downloadInfo + path).then(res => {
					if (res.data.Error === 0) {
						this.downloadInfo = res.data.Result;
					}
				});
			}, 1500);
		},
		toDownload() {
			this.$axios
				.post(this.$api.download, {
					Hash: this.downloadUrl,
					MaxPeerNum: 10
				})
				.then(res => {
					if (res.data.Error === 0) {
						this.$emit('closedialog');
						this.$store.dispatch("setDownload");
						this.$router.push({
							name: "transfer",
							query: {
								transferType: 2
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
