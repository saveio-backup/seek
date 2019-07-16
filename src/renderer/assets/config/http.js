import axios from 'axios';
import {
  Loading,
  Message
} from 'element-ui'

let loadinginstace;
// http requst proxy
axios.interceptors.request.use(request => {
  if (request.loading) {
    loadinginstace = Loading.service({
      target: request.loading.target || ".loading-content",
      text: request.loading.text || "Loading",
      lock: true
    })
  }
  return request
}, error => {
  loadinginstace && loadinginstace.close()
  Message.error({
    message: 'Request Timeout!'
  })
  return Promise.reject(error)
})


// http response proxy
axios.interceptors.response.use(
  response => {
    console.log(response);
    loadinginstace && loadinginstace.close();
    if(response.data.error === 0) {
      return response;
    } else {
      return Promise.reject(response.data);
    }
  },
  error => {
    loadinginstace && loadinginstace.close();
    if(typeof error !== Object) {
      Message.error({
        message: error || 'Response Error'
      })
    } else if (error.response.status == 500 || error.response.status == 504) {
      Message.error({
        message: 'Server Error!!!'
      })
    } else if (error.response.status == 404) {
      Message.error({
        message: 'Relevant resources cannot be found!!!'
      })
    } else if (error.response.status == 403) {
      Message.error({
        message: 'Access Forbidden!!!'
      })
    } else if (error.response.status == 400) {
      Message.error({
        message: 'Request Parameter Error!!!'
      })
    }
    return Promise.reject(error.response.data)
  }
);

export default axios;
