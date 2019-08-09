<template>
	<div id="download-dialog">
		<el-form @submit.native.prevent>
			<el-form-item
				class="theme-font-blue-bold"
				label="Download URL:"
			>
				<el-input
					v-model.trim="downloadUrl"
					@input='toGetFileInfo'
					@keyup.native.enter='toDownload'
					placeholder="Input File URL"
					class="grey-theme"
				></el-input>
			</el-form-item>
		</el-form>
		<div class="mt20 text-center new-download-wrapper">
			<div class="tl">
				<p class="theme-font-blue new-download-left">Name:</p>
				<p class="theme-font-blue-70 new-download-right">{{downloadInfo.Name || ''}}</p>
			</div>
			<div class="tl">
				<p class="theme-font-blue new-download-left">Size:</p>
				<p class="theme-font-blue-70 new-download-right">{{downloadInfo.Size? util.bytesToSize(downloadInfo.Size*1024) : '0'}}</p>
			</div>
			<div class="tl">
				<p class="theme-font-blue new-download-left">Cost:</p>
				<p class="theme-font-blue-70 new-download-right">{{downloadInfo.FeeFormat || '0'}} SAVE</p>
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
import { ipcRenderer, remote } from "electron";
import util from "../assets/config/util";
export default {
	props: {
		downloadUrl: {
			required: false,
			default: ""
		}
	},
	data() {
		return {
			util,
			formatUrl: "save://share/",
			downloadInfo: {},
			win: remote.getCurrentWindow()
		};
	},
	mounted() {
		if (this.downloadUrl) {
			this.toGetFileInfo();
		}
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		toGetFileInfo() {
			if (this.downloadUrl.indexOf(this.formatUrl) != 0) return;
			const path = ipcRenderer.sendSync("string-to-hex", this.downloadUrl);
			clearTimeout(timer);
			timer = setTimeout(() => {
				this.$axios.get(this.$api.downloadInfo + path).then(res => {
					if (res.Error === 0) {
						this.downloadInfo = res.Result;
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				});
			}, 1500);
		},
		toDownload() {
			if (this.downloadUrl.indexOf(this.formatUrl) != 0) return;
			this.$axios
				.post(this.$api.download, {
					Url: this.downloadUrl,
					SetFileName: true,
					MaxPeerNum: 20
				})
				.then(res => {
					if (res.Error === 0) {
						this.$emit("closedialog");
						this.$store.dispatch("setDownload");
						this.win.views
							.find(view => view.isActive)
							.openComponent("FileManager/transfer");
					} else {
						if (res.Error === 50028) {
							this.$message.error(
								"Sorry, there are no valid files found, the file may have been deleted."
							);
						} else {
							this.$message.error(
								this.$i18n.error[res.Error]
									? this.$i18n.error[res.Error][this.$language]
									: `error code is ${res.Error}`
							);
						}
					}
				});
		}
	}
};
</script>
 <style lang="scss">
// #download-dialog {
// padding: 0 30px;
// .el-input__inner {
// 	height: 35px;
// 	line-height: 35px;
// 	font-weight: normal !important;
// 	background: #ebecef;
// 	border-radius: 2px;
// 	border: none;
// }
// }
.new-download-wrapper {
	div {
		margin-bottom: 10px;
		width: 100%;
		overflow: hidden;
		.new-download-left {
			float: left;
			width: 55px;
			text-align: right;
		}
		.new-download-right {
			float: right;
			width: calc(100% - 60px);
		}
	}
}
</style>
