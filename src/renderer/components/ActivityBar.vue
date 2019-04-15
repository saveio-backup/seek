<template>
	<div id="activity-bar">
		<div class="content">
			<div class="composite-bar">
				<ul class="action-container">
					<li class="action-item item-user">
						<router-link to="/"><i class="ofont ofont-user user"></i></router-link>
					</li>
					<li class="action-item">
						<router-link to="/Appstore"><i class="ofont ofont-menu appstore"></i></router-link>
					</li>
					<li class="action-item">
						<router-link
						 :to="{name:'disk',query:{type:0}}"
						 active-class="slidebar-active"
						><i class="ofont ofont-file filemanger"></i></router-link>
					</li>
					<li class="action-item">
						<router-link to="/Wallet"><i class="ofont ofont-wallet wallet"></i></router-link>
					</li>
					<li class="action-item">
						<router-link to="/Miner"><i class="ofont ofont-miner miner"></i></router-link>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
<script>
import "element-ui/lib/theme-chalk/index.css";
export default {};
</script>
<style lang="scss">
$theme-color: #1b1e2f;
$slidebar-active-color: linear-gradient(
	110deg,
	rgba(101, 166, 255, 1) 0%,
	rgba(138, 247, 255, 1) 100%
);
#activity-bar {
	width: 70px;
	color: $theme-color;
	background: $theme-color;
	.content {
		color: #767882;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		.action-container {
			text-align: center;
			.action-item {
				display: flex;
				font-size: 40px;
				padding: 5px 0;
				&.item-user {
					font-size: 50px;
					border-bottom: solid 1px #767882;
					margin-bottom: 30px;
				}
				a {
					flex:1;
					&.slidebar-active {
						border-right: solid 1px $slidebar-active-color
					}
				}
			}
		}
	}
}
</style>
