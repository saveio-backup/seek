<template>
	<div id="window-navigation">
		<div class="window-main">
			<section class="window-control-wrapper">
				<ul class="window-tabs flex">
					<li
						draggable="true"
						class="window-tab-item"
						v-for="(item,index) in views"
						:key="index"
						:class="{'is-active':item.isActive}"
					>
						<span
							v-if="item.isLoading"
							class="el-icon-loading ml10"
							@mousedown="remoteSetActive(item,index)"
						></span>
						<img
							@mousedown="remoteSetActive(item,index)"
							class="favicon"
							v-if="!item.isLoading && item.favicon"
							:src="item.favicon"
							alt=""
							@error='item.isLoading = false; item.favicon = false'
						>
						<span
							v-if="!item.isLoading && !item.favicon"
							class="el-icon-link ml10"
							@mousedown="remoteSetActive(item,index)"
						></span>
						<p
							class="window-tab-item-title"
							@mousedown="remoteSetActive(item,index)"
						>{{item.title || item.willLoadUrl || $t('window.loading')}}</p>

						<p
							class="flex ai-center close"
							@click.stop="remoteDestory(item,index)"
						>
							<!-- class="el-icon-close" -->
							<span class="ofont-guanbi ofont ftpx8"></span>
						</p>
					</li>
					<li class="flex ai-center">
						<span
							class="addtab el-icon-plus"
							@click='remoteCreate'
						></span></li>
				</ul>

				<div class="window-navbar">
					<div class="flex flex1">
						<div class="window-navbar-buttons">
							<div
								class="nav-button flex ai-center jc-center"
								@click="remoteOpenComponent('Home')"
							>
								<i
									v-if="!user.name"
									class="ofont ofont-yonghu user user-first"
								></i>
								<i
									v-else
									class="user-first"
								>{{user.name | firstString}}</i>
							</div>
							<div
								@click="remoteGoBack"
								:class="{'disable': !activeView.canGoBack}"
								:title="$t('window.goBack')"
							>
								<i class="el-icon-arrow-left"></i>
							</div>
							<div
								@click="remoteGoForward"
								:class="{'disable': !activeView.canGoForward}"
								:title="$t('window.goForward')"
							>
								<i class="el-icon-arrow-right"></i>
							</div>
							<div
								@click="remoteReload"
								:title="$t('window.refresh')"
							>
								<i class="el-icon-refresh"></i>
							</div>
						</div>
						<el-input
							ref="inputUrl"
							class="input-url"
							:placeholder="$t('window.inputURL')"
							v-model="inputDisplayUrl"
							@keyup.esc.native='inputDisplayUrl=activeView.displayURL'
							@keyup.enter.native='remoteLoadURL(activeView)'
						></el-input>
						<div
							@mouseleave="hiddenDialog"
							@mouseenter="setDialog('syncInfo')"
							class="sync-wrapper flex flex-center"
						>
							<el-progress
								class="sync-progress"
								type="circle"
								:width="16"
								:stroke-width="3"
								:show-text="false"
								:percentage="percentage"
								:color="colors"
								v-if="isSync"
							></el-progress>
							<span
								v-if="isSync"
								class="ft12 syncing"
							>
								{{$t('window.syncing')}}
							</span>
							<span
								v-if="!isSync"
								class="theme-font-blue-70 ml10 currentBlock"
							>
								#{{currentHeihgt || 0}}
							</span>
						</div>
					</div>
					<el-progress
						v-show="activeView.pageLoadProgress<1"
						class="page-load-progress"
						:stroke-width='2'
						:percentage="activeView.pageLoadProgress?activeView.pageLoadProgress * 100:0"
						:show-text="false"
					></el-progress>
				</div>
				<div
					v-if="platform === 'win32'"
					class="winform"
				>
					<a
						@click="windowMin"
						class="minimize ofont ofont-zuixiaohua"
					></a>
					<a
						class="window-resize ofont maximize"
						:class="{'ofont-tuichuquanping':isMaximized,'ofont-zuidahua':!isMaximized}"
						@click="windowResize"
					></a>
					<a
						class="window-close close ofont ofont-guanbi"
						@click="closeWindow"
					></a>

				</div>
			</section>
			<section
				class="this-is-browserview"
				v-if="!activeView.showBrowserView"
			>
				<keep-alive>
					<router-view v-if="$route.meta.keepAlive"></router-view>
				</keep-alive>
				<router-view v-if="!$route.meta.keepAlive"></router-view>
			</section>
		</div>
		<activity-bar></activity-bar>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
import { log } from 'mathjs';
const remote = require('@electron/remote')
export default {
	components: {
		ActivityBar: require("./components/ActivityBar.vue").default
	},
	mounted() {
		window.vue = this;
		const vm = this;
		ipcRenderer.on("dialog-load", (e) => {
			vm.attach();
		});
		vm.attach();
		ipcRenderer.on("forceUpdate", () => {
			this.$forceUpdate();
			vm.views = remote.getCurrentWindow().views;
			clearTimeout(vm.timeoutForceUpdate);
			vm.timeoutForceUpdate = setTimeout(() => {
				ipcRenderer.send("run-dialog-event", {
					name: "getViewIds"
				});
			}, 20);
		});
		ipcRenderer.on("focus", () => {
			this.$refs.inputUrl.select();
		});
		this.setIsMaximized();
		window.addEventListener("resize", this.setIsMaximized);
	},
	computed: {
		currentHeihgt: function() {
			return this.$store.state.Home.currentHeight || 0;
		},
		totalHeight: function() {
			return this.$store.state.Home.totalHeight || 0;
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
		},
		isNeedSync: function() {
			return this.$store.state.Home.isNeedSync || false;
		},
		realUrl: function() {
			return this.activeView.url;
		},
		activeView: function() {
			return this.views.find(view => view.isActive);
		},
		currentWindow: function() {
			return remote.getCurrentWindow();
		},
		percentage: function() {
			if (this.currentHeihgt && this.totalHeight) {
				return parseInt((this.currentHeihgt / this.totalHeight) * 100);
			} else {
				return 0;
			}
		},
		address: function() {
			if (
				this.$store.state.Home.account &&
				this.$store.state.Home.account.Address
			) {
				return this.$store.state.Home.account.Address;
			} else {
				return "";
			}
		}
	},
	filters: {
		firstString(value) {
			if (!value) return "";
			value += "";
			return value[0];
		}
	},
	watch: {
		realUrl: function(newValue) {
			this.user = {
				name: localStorage.getItem("Label") || ""
			};
			this.inputDisplayUrl = this.activeView.displayURL;
		}
	},
	data() {
		let activeView = (remote.getCurrentWindow().views || []).find(
			view => view.isActive
		);
		return {
			timeoutForceUpdate: null,
			isMaximized: true,
			platform: remote.process.platform,
			inputDisplayUrl: activeView.displayURL || "",
			views: remote.getCurrentWindow().views || [],
			user: {
				name: localStorage.getItem("Label") || ""
			},
			colors: [{ color: "#3C80EC", percentage: 100 }]
		};
	},
	methods: {
		attach() {
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ['progress', 'account', 'channel', 'state', 'revence', 'modulestate'],
					id: remote.getCurrentWebContents().id
				}
			});
		},
		remoteSetActive(view, viewIndex) {
			this.currentWindow.views.map((viewItem, index) => {
				if (viewIndex === index) {
					viewItem.isActive = true;
					viewItem.resize(); // will resize whill app-command
					// this.currentWindow.setBrowserView(view.browserView);
				} else if (viewItem.isActive === true) {
					viewItem.isActive = false;
				}
			});
			this.$forceUpdate();
		},
		remoteDestory(view, index) {;
			view.destroy(index);
		},
		remoteFormatDisplayURL(view) {
			view.formatDisplayURL();
		},
		remoteLoadURL(view) {
			// if input url is createaccount checkout current account is not logout
			if (
				this.inputDisplayUrl.toLowerCase().startsWith("seek://createaccount")
			) {
				let nextString = this.inputDisplayUrl[
					this.inputDisplayUrl.indexOf("seek://createaccount") + 1
				];
				if (nextString != "?" && nextString != "#") {
					if (localStorage.getItem("Address") || "") {
						this.inputDisplayUrl = view.displayURL;
						return;
					}
				}
			}
			// browserView go url
			view.url = this.inputDisplayUrl;
			view.onNewUrl(this.inputDisplayUrl);
		},
		remoteOpenComponent(path) {
			this.activeView.openComponent(path);
		},
		remoteCreate() {
			this.activeView.create({ isActive: true, focus: true });
		},
		remoteGoBack() {
			this.activeView.webContents.goBack();
		},
		remoteGoForward() {
			this.activeView.webContents.goForward();
		},
		remoteReload() {
			this.activeView.webContents.reload();
		},
		setIsMaximized() {
			this.isMaximized = remote.getCurrentWindow().isMaximized();
		},
		windowMin() {
			remote.getCurrentWindow().minimize();
		},
		windowResize() {
			let win = remote.getCurrentWindow();
			if (win.isMaximized()) {
				win.unmaximize();
			} else {
				win.maximize();
			}
		},
		closeWindow() {
			remote.getCurrentWindow().close()
		},
		hiddenDialog() {
			this.currentWindow.menuWindow.hiddenMenu("hidd from windowNavigation");
		},
		setDialog(menuid) {
			let params = {
				id: menuid
			};
			this.currentWindow.menuWindow.openMenu(params);
		}
	}
};
</script>
<style lang="scss">
// $theme-input-color: #2c2f44;
$theme-input-color: #dfe2e9;
$theme-color-opacity-hover: rgba(246, 246, 248, 0.5);
$light-grey: #f2f2f2;
$tabs-height: 62px;
#window-navigation {
	height: 100vh;
}
.window-control-wrapper {
	height: $tabs-height;
	@include themify {
		background-color: $navigation-bg;
		color: $nav-hover-color;
	}
	.window-tabs {
		-webkit-app-region: drag;
		position: relative;
		padding-left: 75px;
		margin-right: 100px;
		padding-top: 5px;

		.window-tab-item {
			padding: 0px 20px 0 5px;
			&.is-active {
				@include themify {
					background-color: $card-color;
				}
				&::after {
					opacity: 0;
				}

				&:hover {
					@include themify {
						background-color: $card-color;
					}
					transition: all 0 ease;
				}
			}

			&:hover {
				@include themify {
					background-color: $card-color;
				}
				// background: $theme-color-opacity-hover;
				transition: all 0.3s ease;
			}

			&::after {
				display: block;
				content: "";
				height: 15px;
				width: 1px;
				background: #202020;
				opacity: 0.2;
				position: absolute;
				right: -1px;
				top: 6px;
			}

			position: relative;
			cursor: default;
			-webkit-app-region: no-drag;
			border-top-left-radius: 6px;
			border-top-right-radius: 6px;
			// width: 220px;
			width: 188px;
			height: 25px;
			display: flex;
			align-items: center;
			min-width: 50px;
			font-size: 12px;
			// color: #fff;
			// @extend .grey-xs;
			.favicon {
				width: 16px;
				height: 16px;
			}
			.window-tab-item-title {
				flex: 1;
				height: 100%;
				line-height: 20px;
				padding-right: 20px;
				width: calc(100% - 26px);
				padding-top: 7px;
				padding-left: 10px;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				align-items: center;
				box-sizing: content-box;
			}
			.close {
				position: absolute;
				right: 7px;
				top: 50%;
				transform: translateY(-50%);
				color: rgba(125, 125, 125, 0.7);
				border-radius: 50%;
				padding: 4px;
				height: 16px;
				line-height: 16px;

				&:hover {
					background: rgba(144, 144, 144, 0.2);
				}

				&:active {
					background: rgba(144, 144, 144, 0.4);
				}
			}
		}
		.addtab {
			-webkit-app-region: no-drag;
			cursor: pointer;
			margin-left: 15px;
			font-size: 9px;
			height: 18px;
			width: 18px;
			line-height: 18px;
			text-align: center;
			font-weight: 900;
			opacity: 0.7;
			border-radius: 50%;

			&:hover {
				background-color: rgba(144, 144, 144, 0.3);
			}

			&:active {
				background-color: rgba(144, 144, 144, 0.5);
			}
		}
	}
	.winform {
		display: flex;
		position: absolute;
		right: 0px;
		top: 0px;
		justify-content: space-between;
		align-items: center;
		width: 96px;
		height: 24px;
		color: rgba(255, 255, 255, 0.5);
		-webkit-app-region: no-drag;

		.minimize {
			font-size: 2px;
		}

		&:hover {
			a.ofont {
				&::before {
					opacity: 1;
				}
			}
		}

		& > a {
			line-height: 24px;
			text-align: center;
			width: 32px;
			height: 24px;
			display: block;
			font-size: 12px;
			color: #8b8d8f;
			transition: all 0.3s ease;
			&:hover {
				background: #c7cacf;
				color: #202020;
			}
			&:active {
				background: #b2b4b8;
			}

			&.window-close {
				&:hover {
					background: #e81123;
					color: #fff;
				}
				&:active {
					background: #e36571;
				}
			}
		}
	}
	.window-navbar {
		@include themify {
			background-color: $card-color;
		}
		display: flex;
		position: relative;
		height: 32px;
		padding: 4px 16px 4px 6px;
		box-sizing: border-box;
		align-items: center;
		.input-url {
			height: 22px;
			.el-input__inner {
				@include themify {
					background-color: $color;
				}
				@extend .grey-xs;
				outline: none;
				border-radius: 15px;
				font-size: 12px;
				border: 1px solid rgba(223, 226, 233, 0);
				&:focus {
					box-shadow: 0px 0px 2px 0px rgba(62, 133, 205, 1);
					border: 1px solid rgba(47, 143, 240, 1);
					background: #ffffff;
				}
			}
		}
		.el-input__inner {
			height: 100% !important;
		}
		.window-navbar-buttons {
			& > div {
				margin: 0 5px;
				padding: 1px;
				width: 24px;
				height: 24px;
				font-size: 16px;
				border-radius: 50%;
				text-align: center;
				line-height: 24px;

				&:not(.disable) {
					&:hover {
						@include themify {
							background-color: $color;
						}
						cursor: pointer;
					}

					&:active {
						opacity: 0.7;
					}
				}
			}

			display: flex;
			align-items: center;
			@include themify {
				color: $font-color;
			}

			.nav-button {
				width: 20px;
				height: 20px;
				background: #a1a1a1;
				line-height: 20px;
				font-size: 14px;
				text-align: center;
				color: white;
				user-select: none;
				font-weight: 500;
				margin-right: 20px;

				i {
					font-style: inherit;
				}
			}

			.user-first {
				font-size: 12px;
			}
		}
		.sync-wrapper {
			margin-left: 8px;
			& > .sync-progress {
				margin-right: 7px;
			}

			& > .syncing {
				white-space: nowrap;
			}
			& > .currentBlock {
				padding: 0 10px;
				height: 22px;
				line-height: 22px;
				background: rgba(223, 226, 233, 0.5);
				border-radius: 11px;
				display: inline-block;
				font-size: 12px;
			}
		}
		.page-load-progress {
			position: absolute;
			width: 100%;
			bottom: 0px;
			left: 0px;
			height: 2px;
			.el-progress-bar {
				display: block;
				.el-progress-bar__outer {
					background: none;
				}
			}
		}
	}
}
.window-main {
	flex: 1;
	width: 100%;
}
.this-is-browserview {
	display: none;
	height: calc(100% - 70px);
}
</style>
