<template>
  <div
    id="app"
    :class="{'haveBg':routerName !== 'Dialog'}"
  >
    <router-view></router-view>
  </div>
</template>

<script>
import {
  ipcRenderer
} from 'electron'
export default {
  mounted() {
    this.$axios
      .get(this.$api.version)
      .then(res => {
        localStorage.setItem("edgeVersion", res.data.Result || "");
      })
      .catch(localStorage.setItem("edgeVersion", ""));
  },
  computed: { 
    routerName() {
      return this.$route.name;
    }
  },
  name: "browser"
};
</script>

<style lang='scss'>
$light-grey: #f9f9fb;
$tabs-height: 70px;
#app {
  height: 100vh;
  &.haveBg {
    background: #f9f9fb;
  }
}

.common-main {
  background: $light-grey;
  height: 100%;
  width: 100%;
}
.layout-main {
  position: absolute;
  left: 200px;
  top: 60px;
  bottom: 0px;
  right: 0px;
}
</style>

