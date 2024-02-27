'use strict'
const log = require('logger')
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 1)
const versions = {
  gameVersion: '',
  localeVersion: '',
  assetVersion: ''
}
const GameClient = require('./client')
const downloadFiles = require('./downloadFiles')
const updateData = require('./updateData')
const getInitalFiles = async()=>{
  try{
    let tempVersions = await downloadFiles()
    checkAPIReady()
  }catch(e){
    log.error(e)
    setTimeout(getInitalFiles, 5000)
  }
}
const checkAPIReady = async()=>{
  try{
    let meta = await GameClient.getMetaData()
    if(meta?.latestGamedataVersion){
      log.info(`SWGoH API is ready...`)
      startSync()
      return
    }else{
      setTimeout(checkAPIReady, 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(checkAPIReady, 5000)
  }
}
const startSync = async()=>{
  try{
    let meta = await GameClient.getMetaData()
    if(meta?.latestGamedataVersion && (versions.gameVersion !== meta.latestGamedataVersion || versions.localeVersion !== meta.latestLocalizationBundleVersion || versions.assetVersion !== meta?.assetVersion)) await updateData(versions, meta)
    await updateData.checkGit(versions)
    setTimeout(startSync, SYNC_INTERVAL * 10 * 1000)
  }catch(e){
    log.error(e)
    setTimeout(startSync, 5000)
  }
}
getInitalFiles()
