<template>
	<div id="plugin">
		<ul class="plugin-items theme-font-color">
			<li class="plugin-item">
				<span class="el-icon-circle-plus-outline"></span>
			</li>
			<li class="plugin-item">
				<span class="el-icon-circle-plus-outline"></span>
				<el-progress :percentage="50"></el-progress>
			</li>
			<li class="plugin-item">
				<span class="el-icon-circle-plus-outline"></span>
			</li>
			<li class="plugin-item">
				<span class="el-icon-circle-plus-outline"></span>
			</li>
			<li class="plugin-item">
				<span class="el-icon-circle-plus-outline"></span>
			</li>
			<li class="plugin-item">
				<span class="el-icon-circle-plus-outline"></span>
			</li>
		</ul>
	</div>
</template>
<script>
export default {
	data() {
		return {
			plugins: [
				{
					url: "oni://www.filmlabtest14.com",
					progress: 0
				}
			]
		};
	}
};
</script>
<style lang="scss" scoped>
.plugin-items {
	display: flex;
	flex-wrap: wrap;
	.plugin-item {
		flex: 0 0 33.3333%;
		font-size: 40px;
	}
}
</style>