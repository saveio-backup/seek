import error from './error';
import home from './home';
import publicObj from './public';
import fileManager from './fileManager';
import miner from './miner';
import wallet from './wallet';
import dialog from './dialog';
import menuWindow from './menuWindow';
import settings from './settings';
import orderpay from './orderpay';
import account from './account'
import windowObj from './window';
import history from './history';
import login from './login';
import plugin from './plugin';
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

const obj = {
  fontSize: '65%',
  error,
  home,
  public: publicObj,
  fileManager,
  miner,
  wallet,
  dialog,
  menuWindow,
  settings,
  orderpay,
  account,
  window: windowObj,
  history,
  login,
  plugin,
  ...zhLocale
}
export default obj;

