import axios from 'axios';
import config from './default'
import {
  Message
} from 'element-ui'
import loadingClass from './model/loadingClass';
axios.defaults.timeout = config.outTime * 5000 + 5000;
// import {i18n} from './../../main'
import { i18n } from './i18n/index'

// http requst proxy
axios.interceptors.request.use(request => {
  loadingClass.addLoading(request);
  return request
}, error => {
  Message.error({
    message: i18n.t('error.requestTimeout')
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
    return Promise.reject(error)
  }
);

export default axios;
