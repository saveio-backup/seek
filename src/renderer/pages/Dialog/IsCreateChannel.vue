<template>
	<div class="isCreateChannel">
		<el-dialog
			center
			width='600px'
			:before-close="closeDialog"
			:close-on-click-modal='false'
			:visible.sync="isCreateChannelToggle"
		>
			<div slot="title">
				<h2>{{$t('public.notice')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content isCreateChannelDialog">
				<div class="mb20">
					<p class="mt20 tl break-word">{{$t('dialog.theSystemDetecetsThatYouHaveNotOpenAChannel')}}</p>
					<p class="mt20 tl">{{$t('dialog.recommendDNS')}}: {{dns && dns.WalletAddr || ''}}</p>
				</div>
				<div slot="footer">
					<ripper-button
						type="primary"
						class="primary"
						@click="confirmCreateChannel"
					>{{$t('public.open')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";
const remote = require('@electron/remote')
export default {
	name: "IsCreateChannel",
	data() {
		return {
			isCreateChannelToggle: false,
			loading: null,
			dns: null,
			win: remote.getCurrentWindow()
		};
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		confirmCreateChannel() {
			this.updateNavigation();
		},
		//update nav active and link to home pgae save localstorage(DNSAdress)
		updateNavigation() {
			let views = this.win.views;
			try {
				this.$emit("closeDialog", { timeout: 0 });

				let activeView = views.find(view => view.isActive);
				// send param
				let dnsAddr = (this.dns && this.dns.WalletAddr) || "00";
				// current browserView url is home
				if (activeView.displayURL.indexOf("seek://Home") === 0) {
					const webContentsId = activeView.browserView.webContents.id;
					ipcRenderer.sendTo(webContentsId, "open-add-channel-dialog", dnsAddr);
					return;
				}
				// find all browser list when the url is home
				let homeViews = views.find(
					view => view.displayURL.indexOf("seek://Home") === 0
				);
				if (!homeViews) {
					// list no data: add home browserView pass DNSAdrss send param
					localStorage.setItem("DNSAdress", dnsAddr);
					activeView.create();
					return;
				} else if (
					Object.prototype.toString.call(homeViews) === "[object Array]"
				) {
					activeView.isActive = false;
					homeViews[0].isActive = true;
					this.win.setBrowserView(homeViews[0].browserView);
				} else if (
					Object.prototype.toString.call(homeViews) === "[object Object]"
				) {
					activeView.isActive = false;
					homeViews.isActive = true;
					this.win.setBrowserView(homeViews.browserView);
				}
				// if browser have home send param to first browser
				const webContentsId = homeViews.browserView.webContents.id;
				ipcRenderer.sendTo(webContentsId, "open-add-channel-dialog", dnsAddr);
			} catch (e) {
				console.log(e);
			}
		},
		init() {
			this.isCreateChannelToggle = true;
			this.$nextTick(() => {
				this.getDns();
			});
		},
		getDns() {
			const vm = this;
			this.$axios
				.get(this.$api.getAllDns, {
					loading: {
						text: vm.$t('dialog.loading'),
						target: ".isCreateChannelDialog.loading-content"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						this.dns = res.Result[0];
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				});
		}
	},
	mounted() {
		this.init();
	}
};
</script>

<style scoped>
.isCreateChannel {
	width: 100%;
	height: 100%;
}
</style>

