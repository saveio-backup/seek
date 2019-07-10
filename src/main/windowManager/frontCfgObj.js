import {
  app
} from 'electron'
let frontCfgObj = {}
const fs = require("fs")
const userDataPath = app.getPath('userData')
const exist = fs.existsSync(`${userDataPath}/front-config.json`)
console.log(exist);
if (exist) {
  const cfg = fs.readFileSync(`${userDataPath}/front-config.json`)
  if (cfg) {
    frontCfgObj = JSON.parse(cfg)
    console.log('cfgObj', frontCfgObj.console);
  }
}
export default frontCfgObj;