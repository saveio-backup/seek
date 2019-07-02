<template>
	<div id="download-dialog">
		<h2 class="theme-font-blue ft18 bold mb10 mt10">Donload URL:</h2>
		<el-input
		 v-model="downloadUrl"
		 @input='toGetFileInfo'
		></el-input>
		<div class="text-center mt20">
			<div class="flex between">
				<p class="theme-font-blue bold">Name:</p>
				<p>{{downloadInfo.Name || ''}}</p>
			</div>
			<div class="flex between mt10 mb10">
				<p class="theme-font-blue bold">Size:</p>
				<p>{{downloadInfo.Size || ''}}</p>
			</div>
			<div class="flex between">
				<p class="theme-font-blue bold">Cost:</p>
				<p>{{downloadInfo.FeeFormat || ''}}</p>
			</div>
			<el-button
			 class="mt40 primary"
			 type="primary"
			 @click="toDownload"
			>Download</el-button>
		</div>
	</div>
</template>
<script>
let timer = null;
import { ipcRenderer } from "electron";
export default {
	data() {
		return {
			formatUrl: "save://share/",
			downloadUrl: "",
			downloadInfo: {}
		};
	},
	methods: {
		toGetFileInfo() {
			if (this.downloadUrl.indexOf(this.formatUrl) != 0) return;
			const path = ipcRenderer.sendSync("string-to-hex", this.downloadUrl);
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
			if (this.downloadUrl.indexOf(this.formatUrl) != 0) return;
			this.$axios
				.post(this.$api.download, {
					Url: this.downloadUrl,
					MaxPeerNum: 10
				})
				.then(res => {
					if (res.data.Error === 0) {
						this.$emit("closedialog");
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
#download-dialog {
	padding: 0 30px;
	.el-input__inner {
		height: 35px;
		line-height: 35px;
		font-weight: normal !important;
		background: #ebecef;
		border-radius: 2px;
		border: none;
	}
}
</style>
