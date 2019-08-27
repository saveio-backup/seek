<template>
	<div id="transfer">
		<div class="aside">
			<div class="aside-link">
				<router-link
					class="transform-link"
					:to="{name:'transfer',query:{transferType:1}}"
					:class="{'theme-font-blue-bold hover-link': transferType == 1}"
				><span><i class="ofont ofont-shangchuan"></i>Upload</span> <span
						class="badge"
						v-show="uploadLength>0"
					>{{uploadLength}}</span></router-link>
				<router-link
					class="transform-link"
					:to="{name:'transfer',query:{transferType:2}}"
					:class="{'theme-font-blue-bold hover-link': transferType == 2}"
				><i class="ofont ofont-xiazai2"></i>Download <span
						class="badge"
						v-show="downloadLength>0"
					>{{downloadLength}}</span></router-link>
				<router-link
					class="transform-link"
					:to="{name:'transfer',query:{transferType:0}}"
					:class="{'theme-font-blue-bold hover-link': transferType == 0}"
				><i class="ofont ofont-wancheng"></i>Complete</router-link>
				<!-- <p
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
				><i class="ofont ofont-xiazai2"></i>Download <span
						class="badge"
						v-show="downloadLength>0"
					>{{downloadLength}}</span></p>
				<p
					class="transform-link"
					:class="{'theme-font-blue-bold hover-link': transferType == 0}"
					@click="transferType = 0"
				><i class="ofont ofont-wancheng"></i>Complete</p> -->
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
	mounted() {
		ipcRenderer.on("queryto", (sender, query) => {
			console.log("query is ");
			console.log(query);
			this.$router.push({ name: "transfer", query: query });
		});
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
		localStorage.setItem("transferType", this.transferType);
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
$theme-font-blue: #040f39;
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
				color: rgba(32, 32, 32, 0.7);
				font-weight: 500;
				font-size: 14px;
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
					background: #edeff4;
					color: #2f8ff0;
				}
				&:active {
					opacity: 0.7;
				}
				&.hover-link {
					background: #edeff4;
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
	.top-progress {
		// border-bottom: 1px solid rgba(32, 32, 32, .1);
	}
}
</style>
