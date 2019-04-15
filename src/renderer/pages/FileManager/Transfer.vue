<template>
	<div id="transfer">
		<div class="aside">
			<div class="aside-link">
				<p
				 :class="{'active-blue': transferType == 0}"
				 @click="transferType = 0"
				>Upload</p>
				<p
				 :class="{'active-blue': transferType == 1}"
				 @click="transferType = 1 "
				>Download</p>
				<p
				 :class="{'active-blue': transferType == 2}"
				 @click="transferType = 2"
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
import fileComponent from "../../components/file-component.vue";
export default {
	components: {
		fileComponent
	},
	data() {
		return {
			transferType: 0		};
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
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
#transfer {
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
		background: $sucess;
		.aside-link {
			display: flex;
			flex-direction: column;
			width: 100%;
			padding-left: 50px;
		}
	}
	.layout-main {
	}
}
</style>
