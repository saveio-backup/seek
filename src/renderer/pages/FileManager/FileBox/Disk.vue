<template>
	<div id="disk">
		<div class="func-nav">
			<div class="fun-button">
        <router-link :to="{name:'upload'}"><el-button>Upload</el-button></router-link>
				<el-button type="success">Download</el-button>
				<el-button type="primary">Share</el-button>
			</div>
      <div class="fun-search">
        <el-input placeholder="search by name"></el-input>
      </div>
		</div>
		<div class="content">当前 type {{type}}</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			type: ""
		};
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.type = to.query.type;
		});
	},
	beforeRouteUpdate(to, from, next) {
		console.log(to);
		this.type = to.query.type;
		next();
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
#disk {
	.func-nav {
		display: flex;
		align-items: center;
    justify-content: space-between;
		padding:0 50px;
		height: 80px;
		background: $light-grey;
	}
}
</style>
