import axios from 'axios';
import {
  Message
} from 'element-ui'
import loadingClass from './loadingClass';
import errorCode from './i18n/error.js';

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
    if(response.data.Error === 0) {
      return response.data;
    } else {
      console.log(response);
      if(response.config && response.config.message && response.config.message.show === 'no') {
        return Promise.reject(response.data);
      }
      Message.error({
        message: response.data.Error && errorCode[response.data.Error] && errorCode[response.data.Error]['en'] || response.data.Desc || ''
      })
      return Promise.reject(response.data);
    }
  },
  error => {
    console.log('error',error)
    loadingClass.removeLoading(error);
    if(typeof error !== Object) {
      if(error.message.includes('timeout')){
        Message.error({
          message: 'Request Timeout!'
        })
      } else {
        Message.error({
          message: error || 'Response Error'
        })
      }
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
    } else {
      Message.error({
        message: error || 'Response Error'
      })
    }
    return Promise.reject(error.response)
  }
);

export default axios;
