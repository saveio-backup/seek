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
const log = require('electron-log')
const setupConfig = async (appDataPath, appName) => {
    const cfgPath = `${appDataPath}/${appName}/config.json`
    const hasConfig = fs.existsSync(cfgPath)
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    if (hasConfig) {
        return
    }
    const srcCfgPath = `${resourcesPath}/config.json`
    if (!fs.existsSync(srcCfgPath)) {
        return
    }
    let cfg = fs.readFileSync(srcCfgPath)
    let cfgObj = JSON.parse(cfg.toString())
    if (!cfgObj) {
        log.error("cfg is no object ")
        log.debug(cfg.toString())
        return
    }
    cfgObj.Base.BaseDir = `${appDataPath}/${appName}`
    log.debug(JSON.stringify(cfgObj))
    if (!fs.existsSync(`${appDataPath}/${appName}`)) {
        log.debug("folder not exist")
        fs.mkdirSync(`${appDataPath}/${appName}`)
    }
    try {
        await fs.writeFileSync(cfgPath, JSON.stringify(cfgObj))
    } catch (err) {
        log.error("set up config error", err)
        log.debug("exist", fs.existsSync(`${appDataPath}/${appName}`))
    }
}

const run = (appDataPath, appName) => {
    log.debug(appDataPath, appName)
    const cfgDir = `${appDataPath}/${appName}`
    const cmdStr = `./dsp --config='${cfgDir}'`
    const resourcesPath = (process.env.NODE_ENV === 'production') ?
        path.join(path.dirname(appRoot), 'bin') :
        path.join(appRoot, 'resources', getPlatform());
    let workerProcess
    log.debug(cmdStr, resourcesPath)
    workerProcess = exec(cmdStr, {
        cwd: resourcesPath
    })
    log.debug("run node++++++")
    workerProcess.stdout.on('data', function (data) {
        log.debug('stdout:' + data)
    })
    workerProcess.stderr.on('data', function (data) {
        log.debug('stdout:' + data)
    })
    workerProcess.on('close', function (code) {
        log.error('out code' + code)
    })
}

export {
    setupConfig,
    run
}