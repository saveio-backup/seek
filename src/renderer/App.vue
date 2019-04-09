<template>
	<div id="app">
    <activity-bar></activity-bar>
    <router-view></router-view>
	</div>
</template>

<script>
export default {
  name: "browser",
  components:{
    ActivityBar: require('./components/ActivityBar.vue').default
  }
};
</script>

<style lang='scss'>
#app{
  display:flex;
  height:100vh;
}
</style>

