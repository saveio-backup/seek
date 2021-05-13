import Vue from 'vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale';
import { i18n } from './i18n/index'
Vue.use(ElementUI)

locale.i18n((key, value) => i18n.t(key, value)) //为了实现element插件的多语言切换

