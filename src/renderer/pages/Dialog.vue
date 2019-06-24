<template>
  <div class="dialogWrapper">
		<!-- <router-view></router-view> -->
    <router-view @closeDialog="closeDialog"></router-view>
  </div>  
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  name: 'Dialog',
  methods: {
    closeDialog({timeout = 0}) {
      if(timeout === 0) {
        ipcRenderer.send('dialog-close');
      } else {
        setTimeout(() => {
          ipcRenderer.send('dialog-close')
        }, timeout);
      }
    }
  }
}
</script>

<style scoped>
.dialogWrapper {
  width: 100%;
  height: 100%;
}
</style>
