<template>
	<div
		id="app"
		:class="{['theme-'+themeColor]:true, 'haveBg':(routerName !== 'Dialog' && routerName !== 'menuWindow')}"
		:data-id="routerName"
	>
		<router-view
			v-if="flag"
			class="theme-bg"
		></router-view>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
	name: "browser",
	mounted() {
		document.querySelector(
			"#theme-ui"
		).href = `./static/css/${this.themeColor}/theme/index.css`;
		setTimeout(() => {
			this.flag = true;
		}, 1000);

		this.init();
		this.activeListener();
		ipcRenderer.on(
			"current-active-show-message",
			(event, { info, type, dangerouslyUseHTMLString = false }) => {
				this.$message({
					message: info,
					type,
					dangerouslyUseHTMLString
				});
			}
		);
		ipcRenderer.on("get-data", (event, { result, type, page }) => {
			this[type + "Update"]({ result, page });
		});
		ipcRenderer.on("set-theme", (event, theme) => {
			document.querySelector(
				"#theme-ui"
			).href = `./static/css/${theme}/theme/index.css`;
			this.$store.commit("SET_THEME_COLOR", theme);
		});
		this.$axios.get(this.$api.version).then(res => {
			if (res.Error === 0) {
				localStorage.setItem("edgeVersion", res.Result || "");
			}
		});
		// .catch(error => {
		// 	if (error.message.includes('timeout')) {
		//     Message.error({
		//       message: 'Request Timeout!'
		//     })
		//   }
		// })
	},
	watch: {
		$route(val, old) {
			this.routerName = this.$route.name;
		}
	},
	data() {
		return {
			flag: false,
			syncListener: ["Home", "FileManager", "Wallet", "Miner"],
			routerName: this.$route.name
		};
	},
	computed: {
		themeColor() {
			return this.$store.state.Home.themeColor;
		}
	},
	methods: {
		activeListener() {
			const vm = this;
			this.syncListener.some(item => {
				if (this.$route.fullPath.indexOf(item) >= 0) {
					ipcRenderer.send("watchEdge");
					/**
					 * params
					 * type: 0: failed;1: restart success
					 */
					ipcRenderer.on("edgeClose", (event, type) => {
						this.$axios.get = null;
						this.$axios.post = null;
						this.$message({
							message: "Unexpected failure, need to restart Seeker.",
							type: "error",
							duration: 0
						});
						this.$message.error = null;
					});
					return true;
				}
			});
		},
		accountUpdate({ result }) {
			this.$store.commit("SET_ACCOUNT", result);
		},
		channelUpdate({ result }) {
			this.$store.commit("SET_BALANCE_TOTAL", result);
		},
		balanceUpdate({ result }) {
			this.$store.commit("SET_BALANCE_LISTS", result);
		},
		revenceUpdate({ result }) {
			this.$store.commit("SET_REVENUE", result);
		},
		progressUpdate({ result, page }) {
			if (page === "tab") {
				if (this.routerName === "settings") return;
				if (result.isNeedSync) {
					if (location.href.indexOf("CreateAccount") < 0) {
						this.$router.replace({
							name: "CreateAccount"
						});
					}
				} else {
					if (location.href.indexOf("CreateAccount") > 0) {
						this.$router.replace({
							name: "Home"
						});
					}
				}
			}
			try {
				this.$store.commit("SET_CURRENT_HEIGHT", result.Now);
				this.$store.commit("SET_TOTAL_HEIGHT", result.End);
				this.$store.commit("SET_IS_SYNC", result.isSync);
				this.$store.commit("SET_IS_NEED_SYNC", result.isNeedSync);
			} catch (e) {
				console.log(e);
			}
		},
		stateUpdate({ result }) {
			this.$store.commit("SET_STAET", result);
		},
		// upload transfering some polling
		uploadListUpdate({ result }) {
			this.$store.commit("GET_UPLOAD_TRANSFER", result);
		},
		downloadListUpdate({ result }) {
			this.$store.commit("GET_DOWNLOAD_TRANSFER", result);
		},
		completeListUpdate({ result }) {
			this.$store.commit("GET_COMPLETED_TRANSFER", result);
		},
		waitForUploadListUpdate({ result }) {
			this.$store.commit("GET_WAIT_FOR_UPLOAD_LIST", result);
		},
		waitForDownloadListUpdate({ result }) {
			this.$store.commit("GET_WAIT_FOR_DOWNLOAD_LIST", result);
		},
		waitForUploadOrderListUpdate({ result }) {
			this.$store.commit("GET_WAIT_FOR_UPLOAD_ORDER_LIST", result);
		},
		waitForDownloadOrderListUpdate({ result }) {
			this.$store.commit("GET_WAIT_FOR_DOWNLOAD_ORDER_LIST", result);
		},
		realUploadingLengthUpdate({ result }) {
			this.$store.commit("GET_REAL_UPLOADING_LENGTH", result);
		},
		realDownloadingLengthUpdate({ result }) {
			this.$store.commit("GET_REAL_DOWNLOADING_LENGTH", result);
		},
		localStatusUpdate({ result }) {
			this.$store.commit("GET_LOCAL_STATUS", result);
		},

		frontConfigUpdate({ result }) {
			this.__proto__.__proto__.$config.maxNumUpload = result.maxNumUpload;
		},
		init() {
			let settings = ipcRenderer.sendSync("getAllSettings");
			this.__proto__.__proto__.$config.maxNumUpload = settings.maxNumUpload;
			this.$i18n.locale = settings.lang || "en";
			let _htmlDom = document.querySelector("html");
			_htmlDom.style.fontSize = this.$t("fontSize");
		},
		langUpdate({ result }) {
			this.$i18n.locale = result.lang || "en";
			let _htmlDom = document.querySelector("html");
			_htmlDom.style.fontSize = this.$t("fontSize");
		},
		userspaceUpdate({ result }) {
			this.$store.commit("SET_SPACE", result);
		}
	}
};
</script>

<style lang='scss'>
$light-grey: #f9f9fb;
$tabs-height: 70px;
#app {
	height: 100vh;
}
.common-main {
	height: 100%;
	width: 100%;
}
.layout-main {
	position: absolute;
	left: 200px;
	top: 60px;
	bottom: 0px;
	right: 0px;
	overflow-y: scroll;
}
</style>

