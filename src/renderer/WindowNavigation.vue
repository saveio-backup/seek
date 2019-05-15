<template>
	<div id="window-navigation">
		<section class="window-control-wrapper">
			<ul class="window-tabs flex">
				<li
				 class="window-tab-item"
				 v-for="(item,index) in views"
				 :key="index"
				 :class="{'is-active':item.isActive}"
				>
					<span
					 class="flex1"
					 @click="remoteSetActive(item,index)"
					>{{item.title || 'loading...'}}</span>
					<span
					 class="close el-icon-close"
					 @click="remoteDestory(item,index)"
					></span>
				</li>
				<li><span
					 class="addtab el-icon-plus"
					 @click='remoteCreate'
					></span></li>
			</ul>

			<!-- <div v-if="activeView"> -->
			<div
			 class="window-navbar"
			 v-for="(item,index) in views"
			 :key="index"
			>
				<div
				 v-show="item.isActive"
				 class="flex"
				>
					<div class="window-navbar-buttons">
						<div
						 class="el-icon-arrow-left"
						 :class="{'disable': !item.canGoBack}"
						 @click="remoteGoBack"
						></div>
						<div class="el-icon-arrow-right" :class="{'disable': !item.canGoForward}" @click="remoteGoForward"></div>
						<div class="el-icon-refresh" @click="remoteReload"></div>
					</div>
					<el-input
					 :ref="'inputUrl' + index"
					 v-model="item.displayURL"
					 @keyup.esc.native='remoteFormatDisplayURL(item,index)'
					 @keyup.enter.native='remoteLoadURL(item,index)'
					></el-input>
				</div>
			</div>
			<!-- </div> -->

		</section>
		<div class="flex window-main">
			<activity-bar></activity-bar>
			<div v-if="!activeView.showBrowserView">
				<keep-alive>
					<router-view v-if="$route.meta.keepAlive"></router-view>
				</keep-alive>
				<router-view v-if="!$route.meta.keepAlive"></router-view>
			</div>
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
		activeView: function() {
			return this.views.find(item => item.isActive);
		},
		currentWindow: function() {
			return remote.getCurrentWindow();
		}
	},
	data() {
		window.vue = this;
		return {
			views: remote.getCurrentWindow().views || []
		};
	},
	methods: {
		remoteSetActive(view, viewIndex) {
			this.currentWindow.views.map((viewItem, index) => {
				if (viewIndex === index) {
					viewItem.isActive = true;
					this.currentWindow.setBrowserView(view.browserView);
				} else if (viewItem.isActive === true) {
					viewItem.isActive = false;
				}
			});
			this.$forceUpdate();
		},
		remoteDestory(view, index) {
			view.destroy(index);
		},
		remoteFormatDisplayURL(view, index) {
			this.$refs["inputUrl" + index][0].blur();
			// setTimeout(() => {
			// 	// waiting data from 'formatDisplayURL' method return 'displayURL'
			// 	this.$refs["inputUrl" + index][0].select();
			// }, 0);
			view.formatDisplayURL();
		},
		remoteLoadURL(view, index) {
			this.$refs["inputUrl" + index][0].blur();
			// view.loadURL(view.displayURL);
			view.onNewUrl(view.displayURL);
		},
		remoteCreate() {
			this.activeView.create();
		},
		remoteGoBack(){
			this.activeView.webContents.goBack();
		},
		remoteGoForward(){
			this.activeView.webContents.goForward()
		},
		remoteReload(){
			this.activeView.webContents.reload();
		}
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
$tabs-height: 70px;
#window-navigation {
	height: 100vh;
}
.window-control-wrapper {
	height: $tabs-height;
	background: #dee1e6;
	.window-tabs {
		.window-tab-item {
			&.is-active {
				background: #cddc39;
			}
			.close {
				position: absolute;
				right: 5px;
				top: 50%;
				transform: translateY(-50%);
				background: #fff;
				&:hover {
					background: #ccc;
				}
			}
			position: relative;
			cursor: default;
			border: solid 1px skyblue;
			width: 200px;
			height: 30px;
			display: flex;
			align-items: center;
			min-width: 50px;
			font-size: 14px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			background: #fff;
		}
	}
	.window-navbar-buttons {
		display: flex;
		align-items: center;
	}
}
.window-main {
	height: calc(100% - 70px);
}
</style>
