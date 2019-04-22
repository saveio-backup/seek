<template>
	<div id="miner">
		<div class="content">
			<div class="aside">
				<div class="aside-link">
					<router-link
					 :class="{'theme-font-blue-bold': fileType == 0}"
					 :to="{name:'minerdisk', query:{type:0, page:'miner',controlBar:'close',addrAPI:$api.getDownloadFileList}}"
					>File</router-link>
					<router-link
					 :class="{'theme-font-blue-bold': fileType == 1}"
					 :to="{name:'income', query:{type:1}}"
					>Income</router-link>
				</div>
			</div>
			<div class="layout-main">
				<router-view></router-view>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			fileType: 0
		};
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.fileType = to.query.type || 0;
		});
	},
	beforeRouteUpdate(to, from, next) {
		this.fileType = to.query.type || 0;
		next();
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$brand-blue: #409eff;
$sucess: #67c23a;
$danger: #f56c6c;
$light-grey: #f7f7f7;
#miner {
	display: flex;
	.layout-main {
		top: 0px;
	}
	& > .content {
		position: absolute;
		left: 70px;
		right: 0px;
		top: 0;
		bottom: 0px;
	}
	.aside {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		position: absolute;
		top: 0px;
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
				&:hover {
					background: rgba(231, 231, 235, 1);
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
