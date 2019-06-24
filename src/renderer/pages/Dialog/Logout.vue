<template>
  <div class="logout">
    <el-dialog
      center
      width='600px'
      :close-on-click-modal='false'
      :visible.sync="logoutToggle"
    >
      <div slot="title">
        <h2>Warning</h2>
        <div class="dialog-title-border"></div>
      </div>
      <div class="loading-content">
        <div class="mb20">
          <p class="mt20 text-center">Please ensure that the private key file is properly stored before exiting.</p>
        </div>
        <div slot="footer">
          <el-button
            type="primary"
            @click="logout"
          >Logout</el-button>
          <el-button
            @click="logoutToggle = false"
          >Cancel</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer, dialog, remote } from 'electron';
import { setTimeout } from 'timers';
export default {
  name: 'Logout',
  data() {
    return {
      logoutToggle: false,
      logoutLoding: null,
      win: remote.getCurrentWindow()
    }
  },
  watch: {
    logoutToggle(newVal, oldVal) {
      if(!newVal) {
        this.$emit('closeDialog', {timeout: 500})
      }
    }
  },
  methods: {
    logout() {
      // this.logoutUploadViews();return;
      this.logoutLoding = this.$loading({
				lock: true,
				text: "logging out",
				target: ".loading-content"
			});
			this.$axios
      .post(this.$api.account + "/logout", {})
      .then(res => {
        this.logoutLoding.close();
        if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
          window.localStorage.clear();
          this.logoutUploadViews();
          this.logoutToggle = false;
          ipcRenderer.send('open-info-dialog', {info:'Logout Success!'})
        } else {
          this.$message.error(res.data.Desc);
        }
      })
      .catch(err => {
        this.logoutLoding.close();
        console.error(err);
      });
    },
    logoutUploadViews() {
      let views = this.win.views;
      try {
        for(let i = views.length - 1;i >= 0;i --) {
          let view = views[i];
          if(view.displayURL.indexOf('seek://') === 0 && !view.isActive) {
            view.destroy(i);
          } else if (view.displayURL.indexOf('seek://') === 0 && view.isActive) {
            let initPage = location.origin + location.pathname;
            view.loadURL(initPage);
          }
        }
      }catch(e) {
        console.log(e);
      }
    }
  },
  mounted() {
    this.logoutToggle = true;
  }
}
</script>

<style scoped>
.logout {
  width: 100%;
  height: 100%;
}
</style>

