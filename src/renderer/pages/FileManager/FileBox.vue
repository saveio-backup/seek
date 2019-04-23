<template>
	<div id="file-box">
		<div class="aside">
			<div class="aside-link">
				<router-link
				class="allfile"
				 :class="{'theme-font-blue-bold link-hover': fileType == 0}"
				 :to="{name:'disk', query:{type:0}}"
				><i class='el-icon-document'></i> <span>All File</span></router-link>
				<router-link
				 :class="{'theme-font-blue-bold link-hover': fileType == 1}"
				 :to="{name:'disk', query:{type:1}}"
				>Image</router-link>
				<router-link
				 :class="{'theme-font-blue-bold link-hover': fileType == 2}"
				 :to="{name:'disk', query:{type:2}}"
				>Document</router-link>
				<router-link
				 :class="{'theme-font-blue-bold link-hover': fileType == 3}"
				 :to="{name:'disk', query:{type:3}}"
				>Video</router-link>
				<router-link
				 :class="{'theme-font-blue-bold link-hover': fileType == 4}"
				 :to="{name:'disk', query:{type:4}}"
				>Music</router-link>
				<router-link
				 active-class="theme-font-blue-bold link-hover"
				 :to="{name:'domain',query:{type:9}}"
				>Domain</router-link>
			</div>
			<div
			 class="aside-progress"
			 v-if="space"
			>
				<p class="grey-xs bold tl">{{space.Used / 1024}}G / {{space.Remain / 1024}}G </p>
				<el-progress :percentage="takeSpace"></el-progress>
				<p class="tr">
					<router-link class="theme-font-blue-bold ft12 link" :to="{name:'expand'}">Expand</router-link>
				</p>
			</div>
		</div>
		<div class="layout-main">
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
export default {
	mounted() {
		this.getUserSpace();
	},
	data() {
		return {
			files: []
		};
	},
	computed: {
		space() {
			return this.$store.state.Filemanager.space;
		},
		takeSpace: function() {
			if (this.space.Remain) {
				return (this.space.Used / this.space.Remain) * 100;
			} else {
				return 100;
			}
		},
		fileType: function() {
			return this.$route.query.type;
		}
	},
	methods: {
		getUserSpace() {
			this.$axios
				.get(this.$api.userspace + window.localStorage.getItem("Address"))
				.then(res => {
					if (res.data.Desc === "SUCCESS") {
						if (res.data.Error === 0) {
							this.$store.dispatch("setSpace", res.data.Result);
						}
					}
				})
				.catch(err => {
					console.error(err);
				});
		}
	},
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
$theme-font-blue: #040f39;
$brand-blue: #409eff;
$sucess: #67c23a;
$danger: #f56c6c;
$light-grey: #f7f7f7;
#file-box {
	display: flex;
	.aside {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		position: absolute;
		top: 60px;
		bottom: 0;
		width: 200px;
		min-height: 400px;
		background: $light-grey;
		color: $theme-font-blue;
		font-size: 16px;
		.aside-link {
			display: flex;
			margin-top:25px;
			flex-direction: column;
			width: 100%;
			.allfile{
				position:relative;
				i{
					position:absolute;
					top:50%;
					left:0px;
					transform: translateX(100%) translateY(-50%);
				}
			}
			& > a {
				display: flex;
				padding: 10px 0 10px 50px;
				&:hover {
					background: rgba(231, 231, 235, 1);
				}
				&.link-hover{
					background: rgba(231, 231, 235, 1);
				}
			}
		}
		.aside-progress {
			// flex:1;
			.link:hover{
					text-decoration: underline;
				}
			
			width: 100%;
			padding: 0 10px;
			margin-bottom: 20px;
			.el-progress-bar {
				padding-right: 0px;
			}
		}
	}
}
</style>
