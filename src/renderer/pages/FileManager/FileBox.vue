<template>
	<div id="file-box">
		<div class="aside">
			<div class="aside-link">
				<router-link :to="{name:'disk', query:{type:1}}">All File</router-link>
				<router-link :to="{name:'disk', query:{type:2}}">Image</router-link>
				<router-link :to="{name:'disk', query:{type:3}}">Document</router-link>
				<router-link :to="{name:'disk', query:{type:4}}">Video</router-link>
				<router-link :to="{name:'disk', query:{type:5}}">Music</router-link>
				<router-link :to="{name:'domain'}">Domain</router-link>
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
	}
};
</script>
<style lang="scss">
$brand-blue:#409EFF;
$sucess:#67C23A;
$danger: #F56C6C;
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
		background: $danger;
		color:#fff;
		& > a {
			display: flex;
		}
		.aside-link {
			display: flex;
			flex-direction: column;
			width: 100%;
			padding-left: 50px;
		}
		.aside-progress {
			// flex:1;
			width: 100%;
			.el-progress-bar {
				padding-right: 0px;
			}
		}
	}
	.layout-main {
		position: absolute;
		left: 200px;
		top: 80px;
		bottom: 0px;
		right: 0px;
	}
}
</style>
