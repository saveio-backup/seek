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
					<span>Balance: {{balanceTotal}}</span>
					<el-button type="primary">划转</el-button>
				</div>
			</div>
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			location: location
		};
	},
	computed: {
		balanceTotal: function() {
			return this.$store.state.Home.balanceTotal;
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
			box-shadow: 0px 2px 4px 0px rgba(231, 231, 235, 0.7);
			padding: 20px;
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
		}
	}
}
</style>
