import {
    platform
} from 'os';
const fs = require("fs")
const path = require("path")
const appRoot = require("app-root-dir").get()
const exec = require('child_process').exec
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

const setupConfig = async (appDataPath, appName) => {
    let cfgPath = cfgFilePath(appDataPath, appName)
    log.debug("[setupConfig] setup cfg")
    log.debug("[setupConfig] appDataPath", appDataPath)
    log.debug("[setupConfig] appname", cfgPath)
    log.debug("[setupConfig] cfgPath", cfgPath)
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
        cmdStr = `.\\edge.exe --config='${cfgDir}'`
    } else {
        cfgDir = `${appDataPath}/${appName}`
        cmdStr = `./edge --config='${cfgDir}'`

    }
    log.debug("[run] run node")
    log.debug("[run] appDataPath", appDataPath)
    log.debug("[run] appname", appName)
    log.debug("[run] cmdstr", cmdStr)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    let workerProcess
    log.debug(cmdStr, resourcesPath)
    workerProcess = exec(cmdStr, {
        cwd: resourcesPath
    })
    log.debug("[run] run node++++++")
    workerProcess.stdout.on('data', function (data) {
        // log.debug('stdout:' + data)
        console.log(data)
    })
    workerProcess.stderr.on('data', function (data) {
        console.log(data)
        // log.debug('stdout:' + data)
    })
    workerProcess.on('close', function (code) {
        log.error('workerProcess out code' + code)
    })
}

export {
    setupConfig,
    run
}