<template>
	<div id="download-dialog">
		<el-form @submit.native.prevent>
			<el-form-item
				class="theme-font-blue-bold"
				:label="$t('public.downloadURL')+':'"
			>
				<el-input
					v-model.trim="downloadUrl"
					@input='toGetFileInfo'
					@keyup.native.enter='toDownload'
					:placeholder="$t('public.inputFileURL')"
					class="grey-theme"
				></el-input>
			</el-form-item>
		</el-form>
		<div class="mt20 text-center new-download-wrapper">
			<div class="tl">
				<p class="new-download-left">{{$t('public.name')}}:</p>
				<p class="new-download-right">{{downloadInfo.Name || ''}}</p>
			</div>
			<div class="tl">
				<p class="new-download-left">{{$t('public.size')}}:</p>
				<p class="new-download-right">{{downloadInfo.Size? util.bytesToSize(downloadInfo.Size*1024) : '0'}}</p>
			</div>
			<div class="tl">
				<p class="new-download-left">{{$t('public.cost')}}:</p>
				<p class="new-download-right">{{downloadInfo.FeeFormat || '0'}} ONI</p>
			</div>
			<ripper-button
				class="mt40 primary"
				type="primary"
				@click="toDownload"
			>{{$t('public.download')}}</ripper-button>
		</div>
	</div>
</template>
<script>
let timer = null;
import { ipcRenderer, remote } from "electron";
import util from "../assets/config/util";
export default {
	props: {
		parentDownloadUrl: {
			required: false,
			default: ""
		}
	},
	data() {
		return {
			util,
			downloadUrl: this.parentDownloadUrl,
			formatUrl: "oni://",
			downloadInfo: {},
			win: remote.getCurrentWindow()
		};
	},
	mounted() {
		console.log("exec mounted");
		if (this.downloadUrl) {
			console.log("download alive");
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
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				});
			}, 1500);
		},
		toDownload() {
			const vm = this;
			if (this.downloadUrl.indexOf(this.formatUrl) != 0) return;
			this.$axios
				.post(this.$api.download, {
					Url: this.downloadUrl,
					SetFileName: true,
					MaxPeerNum: ipcRenderer.sendSync("getSettings", "maxPeerNum")
				})
				.then(res => {
					if (res.Error === 0) {
						this.$emit("closeDialog", { timeout: 0 });
						// this.$store.dispatch("getDownload");
						ipcRenderer.send("run-dialog-event", { name: "getDownload" });
						this.downloadInfo = {};
						this.win.views
							.find(view => view.isActive)
							.openComponent("FileManager", {
								vueRouter: true,
								query: {
									transferType: 2
								}
							});
					} else {
						if (res.Error === 50028) {
							this.$message.error(
								vm.$t(
									"public.sorryThereAreNoValidFilesFoundTheFileMayHaveBeenDeleted"
								)
							);
						} else {
							this.$message.error(this.$t(`error[${res.Error}]`));
						}
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(vm.$t("public.networkErrorDownloadFailed"));
					}
				});
		}
	}
};
</script>
 <style lang="scss">
.new-download-wrapper {
	div {
		margin-bottom: 10px;
		width: 100%;
		overflow: hidden;
		.new-download-left {
			float: left;
			width: 55px;
			text-align: right;
			height: 2rem;
			font-size: 1.4rem;
			line-height: 2rem;
		}
		.new-download-right {
			float: right;
			width: calc(100% - 60px);
			height: 2rem;
			line-height: 2rem;
		}
	}
}
</style>
