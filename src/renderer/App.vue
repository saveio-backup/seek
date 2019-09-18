<template>
	<div
		id="app"
		:class="{'haveBg':(routerName !== 'Dialog' && routerName !== 'menuWindow')}"
		:data-id="routerName"
	>
		<router-view></router-view>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
	name: "browser",
	mounted() {
		this.activeListener();
		ipcRenderer.on("current-active-show-message", (event, { info, type }) => {
			this.$message({
				message: info,
				type: type
			});
		});
		ipcRenderer.on("get-data", (event, { result, type, page }) => {
			this[type + "Update"]({result, page});
		});
		this.$axios.get(this.$api.version).then(res => {
			if (res.Error === 0) {
				localStorage.setItem("edgeVersion", res.Result || "");
			}
		});
	},
	// computed: {
	// 	routerName() {
	// 		return this.$route.name;
	// 	}
	// },
	watch: {
		'$route' (val, old) {
			this.routerName = this.$route.name;
    }
	},
	data() {
		return {
			syncListener: ["Home", "FileManager", "Wallet", "Miner"],
			routerName: this.$route.name
		};
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
						console.log(`edgeClose callback restart: failed`);
						this.$axios.get = null;
						this.$axios.post = null;
						this.$message({
							message: "Server has been closed, please restart seeker.",
							type: "error",
							duration: 0
						});
						this.$message.error = null;
					});
					return true;
				}
			});
		},
		channelUpdate({result}) {
			this.$store.commit("SET_BALANCE_TOTAL", result);
		},
		balanceUpdate({result}) {
			this.$store.commit("SET_BALANCE_LISTS", result);
		},
		revenceUpdate({result}) {
			this.$store.commit("SET_REVENUE", result);
		},
		progressUpdate({result, page}) {			
			if(page === 'tab') {
				if(result.isNeedSync) {
					if (location.href.indexOf('CreateAccount') < 0) {
						this.$router.replace({
							name: 'CreateAccount'
						});
					}
				} else {
					if (location.href.indexOf('CreateAccount') > 0) {
						this.$router.replace({
							name: 'Home'
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
		accountUpdate({result}) {
			this.$store.commit("SET_ACCOUNT", result);
		},
		stateUpdate({result}) {
			this.$store.commit("SET_STAET", result);
		},
		// currentChannelUpdate({result}) {
		// 	this.$store.dispatch("setChannelBind", result.ChannelId);
		// }
	}
};
</script>

<style lang='scss'>
$light-grey: #f9f9fb;
$tabs-height: 70px;
#app {
	height: 100vh;
	&.haveBg {
		background: #f9f9fb;
	}
}

.common-main {
	background: $light-grey;
	height: 100%;
	width: 100%;
}
.layout-main {
	position: absolute;
	left: 200px;
	top: 60px;
	bottom: 0px;
	right: 0px;
}
</style>

