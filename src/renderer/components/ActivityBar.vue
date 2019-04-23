<template>
	<div id="activity-bar">
		<div class="content">
			<div class="composite-bar">
				<ul class="action-container">
					<li class="action-item item-user">
						<router-link to="/"><i class="ofont ofont-user user"></i></router-link>
					</li>
					<!-- <li class="action-item">
						<router-link to="/Appstore"><i class="ofont ofont-menu appstore"></i></router-link>
					</li> -->
					<li class="action-item">
						<router-link
						 :to="{name:'FileManager'}"
						 active-class="slidebar-active"
						>
							<img
							 class="active-none"
							 src="../assets/images/aside_file.png"
							 alt="Menu"
							>
							<img
							 class="active-display"
							 src="../assets/images/aside_file_color.png"
							 alt=""
							>
							<div class="active-display slide-border"></div>
						</router-link>
					</li>
					<li class="action-item">
						<router-link
						 to="/Wallet"
						 active-class="slidebar-active"
						>
							<img
							 class="active-none"
							 src="../assets/images/aside_wallet.png"
							 alt="Menu"
							>
							<img
							 class="active-display"
							 src="../assets/images/aside_wallet_color.png"
							 alt=""
							>
							<div class="active-display slide-border"></div>
						</router-link>
					</li>
					<li class="action-item">
						<router-link
						 to="/Miner"
						 active-class="slidebar-active"
						>
							<img
							 class="active-none"
							 src="../assets/images/aside_miner.png"
							 alt="Menu"
							>
							<img
							 class="active-display"
							 src="../assets/images/aside_miner_color.png"
							 alt=""
							>
							<div class="active-display slide-border"></div>
						</router-link>
					</li>
				</ul>
			</div>
			<div
			 class="setting-bar"
			 @click="toggleAppear"
			 v-clickoutside='hideAppear'
			>
				<div style="position:relative; z-index:2">
					<i class="el-icon-menu"></i>
				</div>
				<ul
				 class="setting-ul"
				 :class="{appear:switchToggle.appear}"
				>
					<li class="setting-li">Log Out</li>
					<li class="setting-li">Export Wallet</li>
				</ul>
			</div>
		</div>
	</div>
</template>
<script>
import "element-ui/lib/theme-chalk/index.css";
export default {
	data() {
		return {
			switchToggle: {
				appear: false
			}
		};
	},
	methods: {
		setAppear() {
			this.switchToggle.appear = true;
		},
		toggleAppear() {
			this.switchToggle.appear = !this.switchToggle.appear;
		},
		hideAppear() {
			this.switchToggle.appear = false;
		}
	}
};
</script>
<style lang="scss">
$theme-color: #1b1e2f;
$slidebar-active-color: linear-gradient(
	110deg,
	rgba(101, 166, 255, 1) 0%,
	rgba(138, 247, 255, 1) 100%
);
#activity-bar {
	width: 100px;
	color: $theme-color;
	background: $theme-color;
	.content {
		position: relative;
		z-index: 999;
		height: 100%;
		color: #767882;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		.action-container {
			text-align: center;
			.action-item {
				display: flex;
				font-size: 40px;
				margin: 40px 0;
				&.item-user {
					position: relative;
					font-size: 50px;
					margin-top: 10px;
					padding-bottom: 10px;
					margin-bottom: 40px;
				}
				&.item-user:after {
					content: "";
					position: absolute;
					bottom: 0px;
					left: 50%;
					transform: translateX(-50%);
					width: 75%;
					height: 1px;
					background: rgba(255, 255, 255, 0.2);
				}
				a {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					.active-display {
						display: none;
					}
					&.slidebar-active {
						position:relative;
						.active-display {
							display: inline-block;
						}
						.slide-border{
							width:1.5px;
							height:100%;
							position:absolute;
							right:0px;
							top:0px;
							border-radius: 1px;
							background: $slidebar-active-color;
							transform: scaleY(1.3);
						}
						.active-none {
							display: none;
						}
					}
				}
			}
		}
		.setting-bar {
			position: relative;
			text-align: center;
			font-size: 42px;
			.el-icon-menu {
				position: relative;
				z-index: 2;
			}
			.setting-ul {
				&.appear {
					transform: translateX(100%);
					opacity: 1;
				}
				opacity: 0;
				transition: all 0.5s;
				width: 150px;
				position: absolute;
				right: 0px;
				bottom: 0px;
				padding: 0px;
				background: #fff;
				font-size: 14px;
				z-index: 1;
				.setting-li {
					padding: 10px 10px;
					&:hover {
						background: $theme-color;
						color: #fff;
					}
				}
			}
		}
	}
}
</style>
