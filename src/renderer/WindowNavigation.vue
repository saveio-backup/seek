<template>
	<div
	 id="window-navigation"
	 class="flex"
	>
		<activity-bar></activity-bar>
		<div class="window-main">
			<section class="window-control-wrapper">
				<ul class="window-tabs flex">
					<li
					 class="window-tab-item"
					 v-for="(item,index) in views"
					 :key="index"
					 :class="{'is-active':item.isActive}"
					>

						<span
						 v-if="item.isLoading"
						 class="el-icon-loading ml10"
						></span>
						<img
						 class="ml10 favicon"
						 v-if="!item.isLoading && item.favicon"
						 :src="item.favicon"
						 @error='item.isLoading = false; item.favicon = false'
						 alt=""
						>
						<span
						 v-if="!item.isLoading && !item.favicon"
						 class="el-icon-link ml10"
						></span>
						<p
						 class="window-tab-item-title ml10"
						 @click="remoteSetActive(item,index)"
						>{{item.title || 'loading...'}}</p>
						<p class="flex ai-center close">
							<span
							 class="el-icon-close"
							 @click="remoteDestory(item,index)"
							></span>
						</p>
					</li>
					<li class="flex ai-center"><span
						 class="addtab el-icon-plus"
						 @click='remoteCreate'
						></span></li>
				</ul>

				<div class="window-navbar">
					<div class="flex flex1">
						<div class="window-navbar-buttons">
							<div
							 class="el-icon-arrow-left"
							 :class="{'disable': !activeView.canGoBack}"
							 @click="remoteGoBack"
							></div>
							<div
							 class="el-icon-arrow-right"
							 :class="{'disable': !activeView.canGoForward}"
							 @click="remoteGoForward"
							></div>
							<div
							 class="el-icon-refresh"
							 @click="remoteReload"
							></div>
						</div>
						<el-input
						 ref="inputUrl"
						 class="input-url"
						 v-model="inputDisplayUrl"
						 @keyup.esc.native='inputDisplayUrl=activeView.displayURL'
						 @keyup.enter.native='remoteLoadURL(activeView)'
						></el-input>
					</div>
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
	},
	computed: {
		realUrl: function() {
			return this.activeView.url;
		},
		activeView: function() {
			return this.views.find(view => view.isActive);
		},
		currentWindow: function() {
			return remote.getCurrentWindow();
		}
	},
	watch: {
		realUrl: function() {
			this.inputDisplayUrl = this.activeView.displayURL;
		}
	},
	data() {
		let activeView = (remote.getCurrentWindow().views || []).find(
			view => view.isActive
		);
		window.vue = this;
		return {
			inputDisplayUrl: activeView.displayURL || "",
			views: remote.getCurrentWindow().views || []
		};
	},
	methods: {
		remoteSetActive(view, viewIndex) {
			this.currentWindow.views.map((viewItem, index) => {
				if (viewIndex === index) {
					viewItem.isActive = true;
					// viewItem.resize(); // will resize whill app-command
					this.currentWindow.setBrowserView(view.browserView);
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
			// this.$refs["inputUrl" + index][0].blur();
			view.url = this.inputDisplayUrl;
			view.onNewUrl(this.inputDisplayUrl);
		},
		remoteCreate() {
			this.activeView.create();
		},
		remoteGoBack() {
			this.activeView.webContents.goBack();
		},
		remoteGoForward() {
			this.activeView.webContents.goForward();
		},
		remoteReload() {
			this.activeView.webContents.reload();
		}
	}
};
</script>
<style lang="scss">
$theme-color: #1b1e2f;
$theme-input-color: #2c2f44;
$theme-color-opacity: rgba(73, 77, 94, 1);
$light-grey: #f2f2f2;
$tabs-height: 63px;
#window-navigation {
	height: 100vh;
}
.window-control-wrapper {
	height: $tabs-height;
	background: $theme-color;
	.window-tabs {
		padding: 0px 40px 0 30px;
		.window-tab-item {
			&.is-active {
				background: $theme-color-opacity;
			}
			position: relative;
			cursor: default;
			border-top-left-radius: 6px;
			border-top-right-radius: 6px;
			width: 220px;
			height: 30px;
			display: flex;
			align-items: center;
			min-width: 50px;
			font-size: 12px;
			color: #fff;
			background: $theme-color;
						.favicon {
				width: 16px;
				height: 16px;
			}
			.window-tab-item-title {
				flex: 1;
				height: 100%;
				line-height: 30px;
				padding-right: 20px;
				width: calc(100% - 26px);
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				align-items: center;
				box-sizing: content-box;
			}
			.close {
				position: absolute;
				right: 5px;
				top: 50%;
				transform: translateY(-50%);
				color: #fff;
				&:hover {
					background: #ccc;
				}
			}
		}
		.addtab {
			cursor: pointer;
			margin-left: 15px;
			font-size: 8px;
			padding: 2px 6px;
			height: 12px;
			line-height: 12px;
			color: #fff;
			transform: skew(10deg);
			background-color: $theme-color-opacity;
		}
	}
	.window-navbar {
		display: flex;
		height: 32px;
		padding: 4px 6px;
		background: $theme-color-opacity;
		align-items: center;
		.input-url {
			height: 26px;
			.el-input__inner {
				&:focus {
					border: none;
				}
				outline: none;
				border-radius: 15px;
				color: #fff;
				border: none;
				background-color: $theme-input-color;
			}
		}
		.el-input__inner {
			height: 100% !important;
		}
		.window-navbar-buttons {
			& > div {
				margin: 0 6px;
			}
			display: flex;
			align-items: center;
			color: #fff;
		}
	}
}
.window-main {
	flex: 1;
	width: calc(100% - 300px);
}
.this-is-browserview {
	display: none;
	height: calc(100% - 70px);
}
</style>
