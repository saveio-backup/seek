<template>
	<div id="file-box">
		<div class="aside">
			<div class="aside-link">
				<router-link
				 :class="{'theme-font-blue': fileType == 0}"
				 :to="{name:'disk', query:{type:0}}"
				>All File</router-link>
				<router-link
				 :class="{'theme-font-blue': fileType == 1}"
				 :to="{name:'disk', query:{type:1}}"
				>Image</router-link>
				<router-link
				 :class="{'theme-font-blue': fileType == 2}"
				 :to="{name:'disk', query:{type:2}}"
				>Document</router-link>
				<router-link
				 :class="{'theme-font-blue': fileType == 3}"
				 :to="{name:'disk', query:{type:3}}"
				>Video</router-link>
				<router-link
				 :class="{'theme-font-blue': fileType == 4}"
				 :to="{name:'disk', query:{type:4}}"
				>Music</router-link>
				<router-link
				 active-class="theme-font-blue"
				 :to="{name:'domain',query:{type:9}}"
				>Domain</router-link>
			</div>
			<div
			 class="aside-progress"
			 v-if="space"
			>
				<p>{{space.Used / 1024}}G / {{space.Remain / 1024}}G </p>
				<el-progress :percentage="takeSpace"></el-progress>
				<router-link :to="{name:'expand'}">Expand</router-link>
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
		top: 80px;
		bottom: 0;
		width: 200px;
		min-height: 400px;
		background: $light-grey;
		color: $theme-font-blue;
		font-size: 16px;
		.aside-link {
			display: flex;
			flex-direction: column;
			width: 100%;
			& > a {
				display: flex;
				padding: 10px 0 10px 50px;
				&:hover{
					background:rgba(231,231,235,1);
				}
			}
		}
		.aside-progress {
			// flex:1;
			width: 100%;
			.el-progress-bar {
				padding-right: 0px;
			}
		}
	}
}
</style>
