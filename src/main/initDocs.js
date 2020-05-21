import { version } from "../../package.json";
import fs from 'fs';
import path from 'path';
import {
  VersionDB
} from './dbs/index_levelup'
import './dbs/index_levelup'

class InitDocs {
  init(appDataPath, appName) {
    return new Promise((resolve, reject) => {
      const versionDB = new VersionDB();
      const vm = this;
      versionDB.initDB(async () => {
        console.log('=======================');
        const currentVersion = await versionDB.queryData('frontVersion');
        console.log('frontVerison:', currentVersion);
        if(vm.getNumberByFrontVersion(currentVersion) < vm.getNumberByFrontVersion('1.0.2-54')) {
          console.log('toDosomeThing');
          vm.compatibleOpeation(appDataPath, appName)
        }
        versionDB.updateData('frontVersion', version).then(async () => {
          resolve(true);
          console.log('change version')
        })
      })
    }).catch(e => {
      return false;
    })
  }

  compatibleOpeation(appDataPath, appName) {
    console.log("compatibleOpeation");
    console.log(appDataPath)
    console.log(appName)
    const _path = path.join(appDataPath, appName, './config-1.json');
    const hasConfig = fs.existsSync(_path);
    console.log(hasConfig);
    if(hasConfig) {
      try{
        fs.unlinkSync(_path);
      }catch(e) {
        console.log(e);
      }
    }
    

    const _pathChain1 = path.join(appDataPath, appName, './Chain-1');
    const hasChain1 = fs.existsSync(_pathChain1);
    console.log(hasChain1);
    if(hasChain1) {
      try {
        // fs.unlinkSync(_pathChain1);
        this.deleteall(_pathChain1);
      } catch(e) {
        console.log(e);
      }
    }
  }

  deleteall(path) {
    var files = [];
    const vm = this;
    if(fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
          vm.deleteall(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

  getNumberByFrontVersion(frontVersion) {
    try {
      let frontVersionArr = frontVersion.split(/\.|-/);
      console.log(frontVersionArr);
      let number = parseInt(frontVersionArr[0]) + (parseInt(frontVersionArr[1]) * Math.pow(10, 3)) +
      (parseInt(frontVersionArr[2]) * Math.pow(10,6)) + (parseInt(frontVersionArr[3]) * Math.pow(10, 9));
      return number;
    } catch(e) {
      return 0;
    }
  }
}

export default new InitDocs();