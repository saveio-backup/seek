import {
    platform
} from 'os';
// const logP = console.log;
// const keyWords = ['ProductRegistryImpl.Registry', 'stdout'];
// console.log = function (data, ...args) {
//     if (typeof data === 'string') {
//         if (keyWords.some(keyWord => {
//                 return data.indexOf(keyWord) >= 0
//             })) {
//             return;
//         }

//     } else {
//         logP(data, ...args)
//     }
// }
const fs = require("fs")
const path = require("path")
const appRoot = require("app-root-dir").get()
const cp = require('child_process')
const getPlatform = () => {
    switch (platform()) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'android':
            return 'linux';
        case 'darwin':
        case 'sunos':
            return 'mac';
        case 'win32':
            return 'win';
    }
}

// log file
// windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
// mac: ~/Library/Logs/<app name>/log.log
// linux: ~/.config/<app name>/log.log
const log = require('electron-log')

const cfgFilePath = (appDataPath, appName) => {
    let cfgPath
    if (getPlatform() == "win") {
        cfgPath = `${appDataPath}\\${appName}\\config.json`
    } else {
        cfgPath = `${appDataPath}/${appName}/config.json`
    }
    return cfgPath
}

const baseDirPath = (appDataPath, appName) => {
    let baseDir
    if (getPlatform() == "win") {
        baseDir = `${appDataPath}\\${appName}`
    } else {
        baseDir = `${appDataPath}/${appName}`
    }
    return baseDir
}

const frontcfgFilePath = (appDataPath, appName) => {
    let cfgPath
    if (getPlatform() == "win") {
        cfgPath = `${appDataPath}\\${appName}\\front-config.json`
    } else {
        cfgPath = `${appDataPath}/${appName}/front-config.json`
    }
    return cfgPath
}

const setFrontConfig = async (appDataPath, appName) => {
    
    let cfgPath = frontcfgFilePath(appDataPath, appName)
    console.log('!!!!!front-CfgPath: ', cfgPath);
    console.log('!!!!appDataPath: ', appDataPath);
    log.debug("[setFrontConfig] setup frontCfg")
    log.debug("[setFrontConfig] appDataPath", appDataPath)
    log.debug("[setFrontConfig] appname", cfgPath)
    log.debug("[setFrontConfig] cfgPath", cfgPath)
    const hasConfig = fs.existsSync(cfgPath)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    if (hasConfig) {
        log.debug("already has front-config")
        return
    }
    const srcCfgPath = `${resourcesPath}/front-config.json`
    if (!fs.existsSync(srcCfgPath)) {
        log.debug("front-config.json not exist")
        return
    }
    let cfg = fs.readFileSync(srcCfgPath)
    let cfgObj = JSON.parse(cfg.toString())
    if (!cfgObj) {
        log.error("front-cfg is no object ")
        log.debug(cfg.toString())
        return
    }
    const baseDir = baseDirPath(appDataPath, appName)
    // cfgObj.Base.BaseDir = baseDir
    // log.debug(JSON.stringify(cfgObj))
    if (!fs.existsSync(baseDir)) {
        log.debug("folder not exist")
        fs.mkdirSync(baseDir)
    }
    try {
        await fs.writeFileSync(cfgPath, JSON.stringify(cfgObj))
    } catch (err) {
        log.error("set up front-config error", err)
        log.debug("exist", fs.existsSync(baseDir))
    }
    log.debug("setup front-config success")
}

const setupConfig = async (appDataPath, appName) => {

    let cfgPath = cfgFilePath(appDataPath, appName)
    console.log('!!!!!cfgPath: ', cfgPath);
    console.log('!!!!appDataPath: ', appDataPath);
    log.debug("[setupconfig] setup cfg")
    log.debug("[setupconfig] appDataPath", appDataPath)
    log.debug("[setupconfig] appname", cfgPath)
    log.debug("[setupconfig] cfgPath", cfgPath)
    const hasConfig = fs.existsSync(cfgPath)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    if (hasConfig) {
        log.debug("already has config")
        return
    }
    const srcCfgPath = `${resourcesPath}/config.json`
    if (!fs.existsSync(srcCfgPath)) {
        log.debug("config.json not exist")
        return
    }
    let cfg = fs.readFileSync(srcCfgPath)
    let cfgObj = JSON.parse(cfg.toString())
    if (!cfgObj) {
        log.error("cfg is no object ")
        log.debug(cfg.toString())
        return
    }
    const baseDir = baseDirPath(appDataPath, appName)
    cfgObj.Base.BaseDir = baseDir
    log.debug(JSON.stringify(cfgObj))
    if (!fs.existsSync(baseDir)) {
        log.debug("folder not exist")
        fs.mkdirSync(baseDir)
    }
    try {
        await fs.writeFileSync(cfgPath, JSON.stringify(cfgObj))
    } catch (err) {
        log.error("set up config error", err)
        log.debug("exist", fs.existsSync(baseDir))
    }
    log.debug("setup config success")
}

const run = (appDataPath, appName) => {
    let cfgDir = ''
    let cmdStr = ''
    if (getPlatform() == "win") {
        cfgDir = `${appDataPath}\\${appName}`
        // cmdStr = `.\\edge.exe --config='${cfgDir}'`
        cmdStr = `.\\edge.exe`
    } else {
        cfgDir = `${appDataPath}/${appName}`
        // cmdStr = `./edge --config='${cfgDir}'`
        cmdStr = `./edge`
    }
    log.debug("[run] run node")
    log.debug("[run] appDataPath", appDataPath)
    log.debug("[run] appname", appName)
    log.debug("[run] cmdstr", cmdStr)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    log.debug(cmdStr, resourcesPath)
    log.debug("[run] run node++++++")
    let workerProcess = cp.spawn(cmdStr, ["--config", cfgDir], {
        cwd: resourcesPath,
    })
    // let workerProcess = cp.exec(cmdStr, {
    //     cwd: resourcesPath,
    //     maxBuffer: 5000 * 1024,
    // })
    workerProcess.stdout.on('data', function (data) {
        // console.log('stdout: ' + data);
    });

    workerProcess.stderr.on('data', function (data) {
        // console.log('stderr: ' + data);
    });

    workerProcess.on('exit', function (code) {
        // console.log('child process exited with code ' + code);
    });
    workerProcess.on('close', function (code) {
        log.error('workerProcess close with code' + code)
    })
}

// setFrontConfig,
export {
    setupConfig,
    run,
    setFrontConfig
}