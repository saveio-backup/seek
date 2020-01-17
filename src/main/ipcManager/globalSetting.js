import {
  ipcMain
} from "electron";
import zh from '../i18n/zh/index';
import en from '../i18n/en/index';
const i18n = {
  zh,
  en
}
ipcMain.on('setlang', (event, lang) => {
  console.log('listener setLang,  lang is');
  console.log(lang);
  global.lang = i18n[lang];
})