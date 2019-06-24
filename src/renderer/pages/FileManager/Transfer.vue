<template>
	<div id="transfer">
		<div class="aside">
			<div class="aside-link">
				<p
				 class="transform-link"
				 :class="{'theme-font-blue-bold hover-link': transferType == 1}"
				 @click="transferType = 1"
				><span>Upload</span> <span
					 class="badge"
					 v-show="uploadLength>0"
					>{{uploadLength}}</span></p>
				<p
				 class="transform-link"
				 :class="{'theme-font-blue-bold hover-link': transferType == 2}"
				 @click="transferType = 2 "
				>Download <span
					 class="badge"
					 v-show="downloadLength>0"
					>{{downloadLength}}</span></p>
				<p
				 class="transform-link"
				 :class="{'theme-font-blue-bold hover-link': transferType == 0}"
				 @click="transferType = 0"
				>Complete</p>
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
			transferType: 0,
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
			vm.transferType = to.query.transferType >= 0 ? to.query.transferType : 2;
		});
	},
	beforeRouteUpdate(to, from, next) {
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
$light-grey: #f7f7f7;
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
				cursor: pointer;
				font-size: 16px;
				display: flex;
				padding: 10px 0 10px 50px;
				&:hover {
					background: #e7e7eb;
				}
				&.hover-link {
					background: #e7e7eb;
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
}
</style>
