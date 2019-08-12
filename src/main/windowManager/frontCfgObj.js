import {
  app
} from 'electron'

function cfgValue() {
  let frontCfgObj = {}
  const fs = require("fs")
  const userDataPath = app.getPath('userData')
  console.log('userDataPathc is');
  console.log(userDataPath);
  const exist = fs.existsSync(`${userDataPath}/front-config.json`)
  if (exist) {
    const cfg = fs.readFileSync(`${userDataPath}/front-config.json`)
    if (cfg) {
      frontCfgObj = JSON.parse(cfg)
    }
  }
  return frontCfgObj
}
export default cfgValue