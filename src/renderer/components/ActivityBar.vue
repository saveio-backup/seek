<template>
	<div id="activity-bar">
		<div class="content">
			<div class="composite-bar">
				<ul class="action-container">
					<li class="action-item">
            <i class="el-icon-info user"></i>
					</li>
          <li class="action-item">
            <router-link to="/appstore"><i class="el-icon-picture wallet"></i></router-link>
          </li>
					<li class="action-item">
						<router-link to="/filemanager"><i class="el-icon-upload filemanger"></i></router-link>
					</li>
					<li class="action-item">
            <router-link to="/wallet"><i class="el-icon-news wallet"></i></router-link>
          </li>
          <li class="action-item">
            <router-link to="/miner"><i class="el-icon-rank miner"></i></router-link>
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
#activity-bar {
	width: 70px;
	// color: $theme-color;
	background: #ccc;
	.content {
		color: #fff;
		display: flex;
		flex-direction: column;
    justify-content: space-between;
    .action-container{
      text-align:center;
      .action-item{
        padding: 10px 0;
      }
    }
	}
}
</style>
