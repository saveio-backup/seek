<template>
	<div id="transfer">
		<div class="aside theme-bg">
			<div class="aside-link">
				<router-link
					class="transform-link"
					:to="{name:'transfer',query:{transferType:1}}"
					:class="{'theme-font-blue-bold hover-link': transferType == 1}"
				><span><i class="ofont ofont-shangchuan"></i>{{$t('fileManager.transfer')}}</span> <span
						class="badge"
						v-show="uploadLength>0"
					>{{uploadLength}}</span></router-link>
				<router-link
					class="transform-link"
					:to="{name:'transfer',query:{transferType:2}}"
					:class="{'theme-font-blue-bold hover-link': transferType == 2}"
				><i class="ofont ofont-xiazai2"></i>{{$t('fileManager.download')}} <span
						class="badge"
						v-show="downloadLength>0"
					>{{downloadLength}}</span></router-link>
				<router-link
					class="transform-link"
					:to="{name:'transfer',query:{transferType:0}}"
					:class="{'theme-font-blue-bold hover-link': transferType == 0}"
				><i class="ofont ofont-wancheng"></i>{{$t('fileManager.complete')}}</router-link>
			</div>
		</div>
		<div class="layout-main theme-bg">
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
import { ipcRenderer } from "electron";
export default {
	components: {
		fileComponent
	},
	data() {
		return {
			transferType: 2
		};
	},
	mounted() {},
	watch: {
		transferType(newVal, oldVal) {
			localStorage.setItem("transferType", newVal);
		}
	},
	computed: {
		downloadLength: function() {
			return this.$store.state.Transfer.downloadLength;
		},
		uploadLength: function() {
			return this.$store.state.Transfer.uploadLength;
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			console.log(vm.transferType);
			vm.transferType =
				to.query.transferType >= 0 ? to.query.transferType : vm.transferType;
		});
	},
	beforeRouteUpdate(to, from, next) {
		console.log("router update!!!!");
		console.log("to is");
		console.log(to);
		this.transferType = to.query.transferType >= 0 ? to.query.transferType : 2;
		// localStorage.setItem("transferType", this.transferType);
		next();
		console.log("transferType is");
		console.log(this.transferType);
	}
};
</script>
<style lang="scss">
$brand-blue: #409eff;
$sucess: #67c23a;
$danger: #f56c6c;
$light-grey: #f9f9fb;
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
		.aside-link {
			margin-top: 20px;
			display: flex;
			flex-direction: column;
			width: 100%;
			.transform-link {
				display: flex;
				padding: 10px 0 10px 60px;
				border-radius: 0 50px 50px 0;
				@include themify {
					color: $filemanager-font-color;
				}
				font-weight: 500;
				font-size: 1.4rem;
				transition: all 0.3s ease;
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
					@include themify {
						background-color: $filemanager-aside-hover-color;
					}
					color: #2f8ff0;
				}
				&:active {
					opacity: 0.7;
				}
				&.hover-link {
					@include themify {
						background-color: $filemanager-aside-hover-color;
					}
					color: #2f8ff0;
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
					margin-left: 4px;
				}
			}
		}
	}
}
</style>
