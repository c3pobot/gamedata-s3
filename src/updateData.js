'use strict'
const log = require('logger')
const saveFile = require('./saveFile')
const readFile = require('./readFile')
const GameClient = require('./client')
const gitClient = require('./gitClient')

const getGameData = require('./getGameData')
const getLocale = require('./getLocale')
const dataBuilder = require('./dataBuilder')

const DATA_DIR = process.env.DATA_DIR || '/app/data/files'

const gitPush = async(gameVersion)=>{
  return await gitClient.push(DATA_DIR, gameVersion)
}
const gitPull = async()=>{
  return await gitClient.pull(DATA_DIR)
}
const checkLocalVersions = async(gameVersion, localeVersion)=>{
  let data = await readFile('allVersions')
  if(!data) return
  if(data.gameVersion === gameVersion && data.localeVersion == localeVersion){
    log.info(`Local versions are at current version ${gameVersion}...`)
    return true
  }
}
module.exports = async(versions = {}, meta = {})=>{
  try{
    let status = await gitPull()
    if(!status){
      log.info(`Error with git pull...`)
      return
    }
    let gitVersions = await readFile('allVersions')
    if(!gitVersions) gitVersions = {}
    console.log(gitVersions.gameVersion === meta.latestGamedataVersion && gitVersions.localeVersion === meta.latestLocalizationBundleVersion && gitVersions.assetVersion === meta.assetVersion)
    if(gitVersions.gameVersion === meta.latestGamedataVersion && gitVersions.localeVersion === meta.latestLocalizationBundleVersion && gitVersions.assetVersion === meta.assetVersion){
      status = await gitPush(meta.latestGamedataVersion)
      if(status){
        versions.gameVersion = meta.latestGamedataVersion
        versions.localeVersion = meta.latestLocalizationBundleVersion
        versions.assetVersion = meta.assetVersion
        log.info(`local versions match gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
        return;
      }
    }
    status = await saveFile('meta', { version: meta.latestGamedataVersion, data: meta })
    if(status){
      gitVersions['meta.json'] = meta.latestGamedataVersion
      status = await getGameData(meta.latestGamedataVersion, gitVersions)
    }
    if(status){
      let gameEnums = await GameClient.getEnums()
      if(!gameEnums) return
      status = await saveFile('enums', { version: meta.latestGamedataVersion, data: gameEnums })
      if(status) gitVersions['enums.json'] = meta.latestGamedataVersion
    }
    if(status) status = await getLocale(meta.latestLocalizationBundleVersion, gitVersions)
    if(status) status = await dataBuilder(meta.latestGamedataVersion, gitVersions)
    if(status){
      gitVersions.gameVersion = meta.latestGamedataVersion
      gitVersions.localeVersion = meta.latestLocalizationBundleVersion
      gitVersions.assetVersion = meta.assetVersion
      status = await saveFile('allVersions', gitVersions)
    }
    if(status) status = await gitPush(meta.latestGamedataVersion)
    if(status){
      versions.gameVersion = meta.latestGamedataVersion
      versions.localeVersion = meta.latestLocalizationBundleVersion
      versions.assetVersion = meta.assetVersion
      log.info(`git versions updated to gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
    }
  }catch(e){
    throw(e)
  }
}
