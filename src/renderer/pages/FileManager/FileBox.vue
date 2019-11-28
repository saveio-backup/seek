<template>
	<div id="file-box">
		<div class="aside theme-bg">
			<div class="aside-link">
				<router-link
					class="allfile"
					:class="{'theme-font-blue-bold link-hover': fileType == 0}"
					:to="{name:'disk', query:{type:0}}"
				><span><i class="el-icon-arrow-down"></i><span class="ofont ofont-resource"></span> {{$t('fileManager.file')}}</span></router-link>
				<router-link
					:class="{'theme-font-blue-bold link-hover': fileType == 1}"
					:to="{name:'disk', query:{type:1}}"
				>{{$t('fileManager.image')}}</router-link>
				<router-link
					:class="{'theme-font-blue-bold link-hover': fileType == 2}"
					:to="{name:'disk', query:{type:2}}"
				>{{$t('fileManager.document')}}</router-link>
				<router-link
					:class="{'theme-font-blue-bold link-hover': fileType == 3}"
					:to="{name:'disk', query:{type:3}}"
				>{{$t('fileManager.video')}}</router-link>
				<router-link
					:class="{'theme-font-blue-bold link-hover': fileType == 4}"
					:to="{name:'disk', query:{type:4}}"
				>{{$t('fileManager.music')}}</router-link>
			</div>
			<div
				class="aside-progress"
				v-if="space"
			>
				<p class="tl aside-progress-num user-no-select"><i class="ofont ofont-yingpan"></i>{{util.bytesToSize(space.Used *1024)}} / {{util.bytesToSize((space.Remain + space.Used)*1024)}} </p>
				<el-progress :percentage="takeSpace"></el-progress>
				<p>
					<router-link
						class="active-blue ft12 link"
						:to="{name:'expand'}"
					>{{$t('fileManager.upgradeStorage')}}</router-link>
				</p>
			</div>
		</div>
		<div class="layout-main theme-bg">
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import util from "../../assets/config/util";
export default {
	mounted() {
		this.$store.dispatch("setSpace");
		// this.getUserSpace();
	},
	data() {
		return {
			util,
			files: []
		};
	},
	computed: {
		space() {
			return this.$store.state.Filemanager.space;
		},
		takeSpace: function() {
			if (this.space.Used > 0) {
				return Math.max(
					1.5,
					(this.space.Used / (this.space.Remain + this.space.Used)) * 100
				);
			} else {
				return 0;
			}
		},
		fileType: function() {
			return this.$route.query.type;
		}
	},
	methods: {},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if (to.name === "filebox") {
				vm.$router.push({
					name: "disk",
					query: {
						type: 0
					}
				});
			}
		});
	},
	beforeRouteUpdate(to, from, next) {
		//  electron-vue bug hack
		if (to.name === "filebox") {
			next({ name: "disk", query: { type: 0 } });
		} else {
			next();
		}
	}
};
</script>
<style lang="scss">
$brand-blue: #409eff;
$sucess: #67c23a;
$danger: #f56c6c;
#file-box {
	display: flex;
	.aside {
		display: flex;
		flex-direction: column;
		// justify-content: space-between;
		align-items: center;
		position: absolute;
		top: 60px;
		bottom: 0;
		width: 200px;
		min-height: 400px;
		font-size: 1.6rem;
		.aside-link {
			display: flex;
			margin-top: 25px;
			flex-direction: column;
			width: 100%;

			.allfile {
				position: relative;
				& > span {
					i {
						position: absolute;
						top: 50%;
						left: 0px;
						transform: translateX(100%) translateY(-50%);
					}
					& > span {
						position: absolute;
						top: 50%;
						left: 20px;
						transform: translateX(100%) translateY(-50%);
					}
				}
			}
			& > a {
				display: flex;
				padding: 10px 0 10px 60px;
				border-radius: 0 50px 50px 0;
				@include themify {
					color: $filemanager-font-color;
				}
				font-weight: 500;
				font-size: 1.4rem;
				transition: all 0.3s ease;
				user-select: none;
				& > span {
					& > i,
					& > span {
						font-size: 14px;
					}
				}
				&:hover {
					@include themify {
						background-color: $filemanager-aside-hover-color;
					}
					color: #2f8ff0;
					// background: rgba(231, 231, 235, 1);
				}
				&:active {
					opacity: 0.7;
				}
				&.link-hover {
					@include themify {
						background-color: $filemanager-aside-hover-color;
					}
					color: #2f8ff0;
					// background: rgba(231, 231, 235, 1);
				}
			}
		}
		.aside-progress {
			margin-top: 70px;
			padding-left: 62px;
			width: 100%;
			margin-bottom: 20px;
			.link {
				user-select: none;
				&:active {
					opacity: 0.7;
				}
			}
			.aside-progress-num {
				font-size: 12px;
				@include themify{
					color: $filemanager-font-color;
				}
				position: relative;
				i {
					position: absolute;
					top: 0;
					left: -20px;
				}
			}
			.el-progress-bar {
				padding-right: 0px;
			}
		}
	}
}
</style>
