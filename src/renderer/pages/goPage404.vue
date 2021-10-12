<template>
  <div id="page-404"></div>
</template>
<script>
const remote = require('@electron/remote')
import failedPage from './../../../static/html/failed/failed.js'
export default {
  name: 'Page404',
  methods: {
    getURL() {
      let id = remote.getCurrentWebContents().id;
			let arr = [];
			let views = [];
      for (let win of remote.BrowserWindow.getAllWindows()) {
				if (win.views) {
					views = views.concat(win.views);
				}
      }
      console.log(views);
      for (let view of views) {
				if (view.browserView && view.browserView.webContents && view.browserView.webContents.id === id) {
          return view.displayURL;
				}
      }
      return '';
    }
  },
  mounted() {
    console.log("remote.getCurrentWebContents()");
    console.log(remote.getCurrentWebContents());
    let validatedURL = this.getURL();
    remote.getCurrentWebContents().executeJavaScript(`document.documentElement.innerHTML = '${failedPage(validatedURL)}' `)
  }
}
</script>
<style lang="scss">
  #page-404 {
    width: 0%;
    height: 0%;
  }
</style>
