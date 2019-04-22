<template>
	<div id="fileManager">
		<div class="content">
			<div class="top-nav">
				<div class="logo">SAVE</div>
				<!-- {{location.href}}  -->
				<div class="router">
					<router-link
					 :to="{name:'filebox'}"
					 active-class="active-blue"
					 :replace="true"
					>Filebox</router-link>
					<!-- <router-link
					 :to="{name:'discovery'}"
					 active-class="active-blue"
					>Discovery</router-link> -->
					<router-link
					 :to="{name:'transfer'}"
					 active-class="active-blue"
					>Transfer</router-link>
				</div>
				<div class="coin">
					<span class="grey-xs bold">Balance: {{filterFloat(balanceTotal).toLocaleString('en-US')}}</span>
					<el-button
					 class="asset-transfer"
					 type="primary"
					 @click="switchToggle.assetTransferDialog = true"
					>划转</el-button>
				</div>
			</div>
			<el-dialog
			 title='Asset'
			 width='450px'
			 :visible.sync="switchToggle.assetTransferDialog"
			 center
			>
				<div>To transfer</div>
				<div class="flex between">
					<div v-if="withDraw">
						<p>Channel Amount</p>
						<p>{{balanceTotal}}</p>
					</div>
					<div v-else>
						<p>Save Amount</p>
						<p>{{mainCount}}</p>
					</div>
					<i class="el-icon-arrow-right"></i>
					<div v-if="!withDraw">
						<p>Channel Amount</p>
						<p>{{balanceTotal}}</p>
					</div>
					<div v-else>
						<p>Save Amount</p>
						<p>{{mainCount}}</p>
					</div>
				</div>
				<i
				 class="el-icon-refresh"
				 @click="withDraw = !withDraw"
				></i>
				<el-input
				 v-model="transferAmount"
				 placeholder="Fill number"
				></el-input>
			</el-dialog>
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import { filterFloat } from "../assets/config/util";
export default {
	mounted() {},
	data() {
		return {
			filterFloat,
			switchToggle: {
				assetTransferDialog: false
			},
			transferAmount: "",
			withDraw: true,
			location: location
		};
	},
	computed: {
		mainCount: function() {
			return this.$store.state.Wallet.mainCount;
		},
		balanceTotal: function() {
			return this.$store.state.Home.balanceTotal;
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if (to.name === "FileManager") {
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
		if (to.name === "FileManager") {
			next({ name: "disk", query: { type: 0 } });
		} else {
			next();
		}
	}
};
</script>
<style lang="scss">
$grey: #ccc;
#fileManager {
	flex: 1;
	& > .content {
		position: absolute;
		top: 0px;
		bottom: 0px;
		left: 70px;
		right: 0px;
		.top-nav {
			background: #fff;
			height: 60px;
			box-shadow: 0px 2px 4px 0px rgba(231, 231, 235, 0.7);
			padding: 10px 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.logo {
				width: 200px;
			}
			.router {
				& > a {
					padding: 0 20px;
				}
				flex: 1;
				display: flex;
			}
			.asset-transfer {
				height: 30px;
				padding: 0px;
				border-radius: 2px;
				width: 80px;
			}
		}
	}
}
</style>
