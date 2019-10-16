<template>
	<div id="miner">
		<div class="content">
			<div class="aside">
				<div class="aside-link">
					<router-link
						:class="{'link-hover': fileType == 0}"
						:to="{name:'minerdisk', query:{type:0, page:'miner',controlBar:'close'}}"
					><span>{{$t('miner.file')}}</span></router-link>
					<router-link
						:class="{'link-hover': fileType == 1}"
						:to="{name:'income', query:{type:1}}"
					><span>{{$t('miner.profit')}}</span></router-link>
					<!-- <i class="el-icon-tickets"></i>  -->
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
	mounted() {
		document.title = this.$t('miner.miner');
		this.$store.dispatch("setCurrentAccount"); // get login status
	},
	data() {
		return {
			fileType: 0
		};
	},
	watch: {
		lang() {
			document.title = this.$t('miner.miner');
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		}
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
$light-grey: #f9f9fb;
#miner {
	display: flex;
	.layout-main {
		top: 0px;
	}
	& > .content {
		position: absolute;
		left: 0px;
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
			margin-top: 70px;
			flex-direction: column;
			width: 100%;
			// & > a {
			// 	position: relative;
			// 	display: flex;
			// 	align-items: center;
			// 	padding: 10px 0 10px 50px;
			// 	i {
			// 		position: absolute;
			// 		top: 50%;
			// 		left: 0px;
			// 		transform: translateX(100%) translateY(-50%);
			// 	}
			// 	&:hover {
			// 		background: rgba(231, 231, 235, 1);
			// 	}
			// }
			& > a {
				display: flex;
				padding: 10px 0 10px 60px;
				border-radius: 0 50px 50px 0;
				color: rgba(32, 32, 32, 0.7);
				font-weight: 500;
				font-size: 14px;
				transition: all 0.3s ease;
				user-select: none;
				&:hover {
					background: #edeff4;
					color: #2f8ff0;
					// background: rgba(231, 231, 235, 1);
				}
				&:active {
					opacity: 0.7;
				}
				&.link-hover {
					background: #edeff4;
					color: #2f8ff0;
					// background: rgba(231, 231, 235, 1);
				}
				// &.link-hover{
				// 	background: rgba(231, 231, 235, 1);
				// }
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
