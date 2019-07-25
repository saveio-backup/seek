import axios from 'axios';
import {
  Message
} from 'element-ui'
import loadingClass from './model/loadingClass';

axios.defaults.timeout = 10000
// http requst proxy
axios.interceptors.request.use(request => {
  loadingClass.addLoading(request);
  return request
}, error => {
  Message.error({
    message: 'Request Timeout!'
  })
  return Promise.reject(error)
})

// http response proxy
axios.interceptors.response.use(
  response => {
    loadingClass.removeLoading(response);
    return response.data;
  },
  error => {
    loadingClass.removeLoading(error);
    if(typeof error !== Object) {
      if(error.message.includes('timeout')){
        Message.error({
          message: 'Request Timeout!'
        })
      }
    }
    return Promise.reject(error.response)
  }
);

export default axios;
