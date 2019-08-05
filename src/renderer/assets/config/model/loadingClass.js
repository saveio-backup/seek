import { Loading } from "element-ui";

class LoadingClass {
  constructor() {
    this.loadinginstace = {}
  }
  
  addLoading(request) {
    if(request && request.loading) {
      const id = this.getId();
      request['id'] = id;
      this.loadinginstace[id] = Loading.service({
        target: request.loading.target || ".loading-content",
        text: request.loading.text || "Loading...",
        lock: true
      })
    }
  }

  removeLoading(response) {
    if(response.config && response.config.id) {
      this.loadinginstace[response.config.id] && this.loadinginstace[response.config.id].close()
    };
  }

  getId() {
    let id = parseInt(Math.random()*10000000000);
    if(this.loadinginstace[id]) {
      return this.getId();
    } else {
      return id;
    }
  }
}
export default new LoadingClass();