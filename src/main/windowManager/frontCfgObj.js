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
  console.log(exist);
  if (exist) {
    const cfg = fs.readFileSync(`${userDataPath}/front-config.json`)
    console.log('cfg is');
    console.log(JSON.parse(cfg));
    if (cfg) {
      frontCfgObj = JSON.parse(cfg)
      console.log('cfgObj', frontCfgObj.console);
    }
  }
  return frontCfgObj
}
export default cfgValue