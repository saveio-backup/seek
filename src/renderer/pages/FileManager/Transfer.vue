<template>
	<div id="transfer">
		<div class="aside">
			<div class="aside-link">
				<p
				 class="transform-link"
				 :class="{'theme-font-blue-bold hover-link': transferType == 1}"
				 @click="transferType = 1"
				><span><i class="ofont ofont-shangchuan"></i>Upload</span> <span
					 class="badge"
					 v-show="uploadLength>0"
					>{{uploadLength}}</span></p>
				<p
				 class="transform-link"
				 :class="{'theme-font-blue-bold hover-link': transferType == 2}"
				 @click="transferType = 2 "
				><i class="ofont ofont-xiazai"></i>Download <span
					 class="badge"
					 v-show="downloadLength>0"
					>{{downloadLength}}</span></p>
				<p
				 class="transform-link"
				 :class="{'theme-font-blue-bold hover-link': transferType == 0}"
				 @click="transferType = 0"
				><i class="ofont ofont-wancheng"></i>Complete</p>
			</div>
		</div>
		<div class="layout-main">
			<file-component
			 v-show="transferType == 0"
			 :transferType='0'
			></file-component>
			<file-component
			 v-show="transferType == 1"
			 :transferType='1'
			></file-component>
			<file-component
			 v-show="transferType == 2"
			 :transferType='2'
			></file-component>
		</div>
	</div>
</template>
<script>
import fileComponent from "../../components/FileComponent.vue";
export default {
	components: {
		fileComponent
	},
	data() {
		return {
			transferType: 2,
		};
	},
	computed: {
		downloadLength: function() {
			this.$store.state.Transfer.downloadLength;
		},
		uploadLength: function() {
			this.$store.state.Transfer.uploadLength;
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.$store.dispatch("setUpload");
			vm.$store.dispatch("setDownload");
			vm.$store.dispatch("setComplete");
			console.log(vm.transferType);
			vm.transferType = to.query.transferType >= 0 ? to.query.transferType : vm.transferType;
		});
	},
	beforeRouteUpdate(to, from, next) {
		console.log('router update!!!!');
		next(() => {
			this.transferType =
				to.query.transferType >= 0 ? to.query.transferType : 2;
		});
	}
};
</script>
<style lang="scss">
$brand-blue: #409eff;
$sucess: #67c23a;
$danger: #f56c6c;
$theme-font-blue: #040f39;
$light-grey: #F9F9FB;
#transfer {
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
		.aside-link {
			margin-top: 20px;
			display: flex;
			flex-direction: column;
			width: 100%;
			.transform-link {
				display: flex;
				padding: 10px 0 10px 60px;
				border-radius: 0 50px 50px 0;
				color: rgba(32, 32, 32, .7);
				font-weight: 500;
				font-size: 14px;
				transition: all .3s ease;
				cursor: pointer;
				user-select: none;
				position: relative;
				i {
					position: absolute;
					top: 50%;
					left: 20px;
					transform: translateX(100%) translateY(-50%);
				}
				&:hover {
					background: #EDEFF4;
					color: #2F8FF0;
				}
				&:active {
					opacity: .7;
				}
				&.hover-link {
					background: #EDEFF4;
					color: #2F8FF0;
				}
				.badge {
					display: inline-block;
					background: #65a6ff;
					$width: 14px;
					width: $width;
					height: $width;
					line-height: $width;
					font-size: 12px;
					text-align: center;
					border-radius: 50%;
					color: #fff;
					margin-left:4px;
				}
			}
		}
	}
	.top-progress {
		border-bottom: 1px solid rgba(32, 32, 32, .1);
	}
}
</style>
