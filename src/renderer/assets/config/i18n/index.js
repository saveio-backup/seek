import Vue from 'vue'

import LocalEn from './en/index'
import LocalZh from './zh/index'
import VueI18n from 'vue-i18n'


Vue.use(VueI18n);

export const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: LocalEn,
    zh: LocalZh
  }
})
