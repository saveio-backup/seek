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
					<router-link
					 :to="{name:'discovery'}"
					 active-class="active-blue"
					>Discovery</router-link>
					<router-link
					 :to="{name:'transfer'}"
					 active-class="active-blue"
					>Transfer</router-link>
				</div>
				<div class="coin">
					<span>Balance</span>
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
			background: $grey;
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
			.active-blue {
				color: aquamarine;
			}
		}
	}
}
</style>
