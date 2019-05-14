<template>
	<div id="window-navigation">
		<section class="window-tabs-wrapper">
			<ul class="window-tabs flex">
				<li
				 class="tab"
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
			<div class="window-navibar">
				<div v-if="activeView">
					<div
					 v-for="(item,index) in views"
					 :key="index"
					>
						<div v-show="item.isActive">
							<el-input
							 :ref="'inputUrl' + index"
							 v-model="item.displayURL"
							 @keyup.esc.native='remoteFormatDisplayURL(item,index)'
							 @keyup.enter.native='remoteLoadURL(item,index)'
							></el-input>
						</div>
					</div>
				</div>
			</div>
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
.window-tabs-wrapper {
	height: $tabs-height;
	background: #dee1e6;
	.tab {
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
.window-main {
	height: calc(100% - 70px);
}
</style>
