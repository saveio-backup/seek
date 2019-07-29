<template>
  <div
    id="app"
    :class="{'haveBg':routerName !== 'Dialog'}"
  >
    <router-view></router-view>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
  name: "browser",
  mounted() {
    // this.isSync();
    this.activeListener();
    ipcRenderer.on("current-active-show-message", (event, { info, type }) => {
      this.$message({
        message: info,
        type: type
      });
    });
    this.$axios
      .get(this.$api.version)
      .then(res => {
        if(res.Error === 0) {
          localStorage.setItem("edgeVersion", res.Result || "");
        }
      })
      // .catch(localStorage.setItem("edgeVersion", ""));
  },
  computed: {
    routerName() {
      return this.$route.name;
    }
  },
  data() {
    return {
      syncListener: ["Home", "FileManager", "Wallet", "Miner"]
    };
  },
  methods: {
    activeListener() {
      this.syncListener.some(item => {
        if (this.$route.fullPath.indexOf(item) >= 0) {
          ipcRenderer.send("watchEdge");
          ipcRenderer.on("edgeClose", () => {
            this.$axios.get = null;
            this.$axios.post = null;
            this.$message({
              message: "Server has been closed, please restart seeker.",
              type: "error",
              duration: 0
            });
            this.$message.error = null;
          });
          document.addEventListener("visibilitychange", () => {
            console.log(document.visibilityState);
            this.isSync();
          });
          window.addEventListener("online", function(e) {
            console.log("online");
            this.isSync();
          });
          return true;
        }
      });
    },
    isSync() {
      this.$axios
        .get(this.$api.channelSync, { message: { show: "no" } })
        .then(res => {
          if (res.Result.Syncing === true) {
            this.$router.replace({
              name: "CreateAccount"
            });
          }
        });
    }
  }
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

