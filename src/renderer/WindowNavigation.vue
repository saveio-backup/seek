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
						<!-- @click="remoteSetActive(item,index)" -->
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
							@error='item.isLoading = false; item.favicon = false'
							alt=""
						>
						<span
							v-if="!item.isLoading && !item.favicon"
							class="el-icon-link ml10"
							@mousedown="remoteSetActive(item,index)"
						></span>
						<p
							class="window-tab-item-title"
							@mousedown="remoteSetActive(item,index)"
						>{{item.title || 'loading...'}}</p>

						<p
							class="flex ai-center close"
							@click.stop="remoteDestory(item,index)"
						>
							<!-- class="el-icon-close" -->
							<span class="ofont-guanbi ofont ft8"></span>
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
								title="Go Back"
							>
								<i class="el-icon-arrow-left"></i>
							</div>
							<div
								@click="remoteGoForward"
								:class="{'disable': !activeView.canGoForward}"
								title="Go Forward"
							>
								<i class="el-icon-arrow-right"></i>
							</div>
							<div
								@click="remoteReload"
								title="Refresh"
							>
								<i class="el-icon-refresh"></i>
							</div>
						</div>
						<el-input
							ref="inputUrl"
							class="input-url"
							placeholder="Input URL"
							v-model="inputDisplayUrl"
							@keyup.esc.native='inputDisplayUrl=activeView.displayURL'
							@keyup.enter.native='remoteLoadURL(activeView)'
						></el-input>
						<div
							@mouseenter="setDialog('syncInfo')"
							@mouseleave="hiddenDialog"
							class="sync-wrapper flex flex-center"
							v-if="address && !isNeedSync"
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
								class="ft12 theme-font-blue-70"
								v-if="isSync"
							>
								Syncing...
							</span>
							<span
								v-if="!isSync"
								class="ft12 theme-font-blue-70 ml10 currentBlock"
							>
								#{{currentHeihgt}}
							</span>
						</div>
					</div>
					<!-- <div @click="setDialog('netstate')" v-if="true">Syning...</div> -->
				</div>
				<div
					v-if="platform === 'win32'"
					class="winform"
				>
					<!-- class="window-min ofont ofont-zuixiaohua" -->
					<a
						@click="windowMin"
						class="minimize ofont ofont-zuixiaohua"
					></a>
					<!-- class="maximize ofont" -->
					<a
						class="window-resize ofont maximize"
						:class="{'ofont-tuichuquanping':isMaximized,'ofont-zuidahua':!isMaximized}"
						@click="windowResize"
					></a>
					<!-- class="window-close ofont ofont-guanbi" -->
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
import { remote, ipcRenderer } from "electron";

export default {
	components: {
		ActivityBar: require("./components/ActivityBar.vue").default
	},
	mounted() {
		ipcRenderer.on("forceUpdate", () => {
			this.$forceUpdate();
			this.views = remote.getCurrentWindow().views;
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
		realUrl: function() {
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
		window.vue = this;
		return {
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
		remoteDestory(view, index) {
			console.log("to use remote destroy");
			view.destroy(index);
		},
		remoteFormatDisplayURL(view) {
			// this.$refs["inputUrl" + index][0].blur();
			// setTimeout(() => {
			// 	// waiting data from 'formatDisplayURL' method return 'displayURL'
			// 	this.$refs["inputUrl" + index][0].select();
			// }, 0);
			view.formatDisplayURL();
		},
		remoteLoadURL(view) {
			// if input url is createaccount checkout current account is not logout
			if(this.inputDisplayUrl.toLowerCase().startsWith('seek://createaccount')) {
				let nextString = this.inputDisplayUrl[this.inputDisplayUrl.indexOf('seek://createaccount') + 1];
				if(nextString != '?' && nextString != '#') {
					if(localStorage.getItem("Address") || "") {
						this.inputDisplayUrl = view.displayURL;
						return;
					}
				}
			}
			// browserView go url
			view.url = this.inputDisplayUrl;
			console.log(this.inputDisplayUrl);
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
			remote.getCurrentWindow().close();
		},
		hiddenDialog() {
			this.currentWindow.menuWindow.hiddenMenu();
		},
		setDialog(menuid) {
			let params = {
				id: menuid
			};
			this.currentWindow.menuWindow.openMenu(params);
			// this.currentWindow.menuWindow.win.on(
			// 	"blur",
			// 	this.currentWindow.menuWindow.win.hide
			// );
		}
	}
};
</script>
<style lang="scss">
$theme-color: #dfe2e9;
// $theme-input-color: #2c2f44;
$theme-input-color: #dfe2e9;
// $theme-color-opacity: rgba(73, 77, 94, 1);
$theme-color-opacity: rgba(246, 246, 248, 1);
$theme-color-opacity-hover: rgba(246, 246, 248, 0.5);
$light-grey: #f2f2f2;
$tabs-height: 62px;
#window-navigation {
	height: 100vh;
}
.window-control-wrapper {
	height: $tabs-height;
	background: $theme-color;
	.window-tabs {
		-webkit-app-region: drag;
		position: relative;
		padding-left: 75px;
		margin-right: 100px;
		padding-top: 5px;

		.window-tab-item {
			padding: 0px 20px 0 5px;
			&.is-active {
				background: $theme-color-opacity;
				&::after {
					opacity: 0;
				}

				&:hover {
					background: $theme-color-opacity;
					transition: all 0 ease;
				}
			}

			&:hover {
				background: $theme-color-opacity-hover;
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
			color: #202020;
			// background: $theme-color;
			.favicon {
				width: 16px;
				height: 16px;
				padding-left: 10px;
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
				// color: #fff;
				color: #202020;
				border-radius: 50%;
				padding: 4px;

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
			color: #202020;
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
		display: flex;
		height: 32px;
		padding: 4px 16px 4px 6px;
		background: $theme-color-opacity;
		box-sizing: border-box;
		align-items: center;
		border-bottom: 1px solid #cfd2d9;
		.input-url {
			height: 22px;
			.el-input__inner {
				outline: none;
				border-radius: 15px;
				// color: #fff;
				// color: #202020;
				font-size: 12px;
				// opacity: .7;
				color: rgba(32, 32, 32, 0.7);
				background-color: rgba(223, 226, 233, 0.5);
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
						background: #dfe2e9;
						cursor: pointer;
					}

					&:active {
						opacity: 0.7;
					}
				}
			}

			display: flex;
			align-items: center;
			color: #202020;

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
			& > .currentBlock {
				padding: 0 10px;
				height: 22px;
				line-height: 22px;
				background: rgba(223, 226, 233, 0.5);
				border-radius: 11px;
				display: inline-block;
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
