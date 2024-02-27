'use strict'
const fs = require('fs')
const log = require('logger')
const path = require('path')
const saveFile = require('./saveFile')
const getDataFiles = require('./getDataFiles')
const buildData = require('./buildData')

const getLocalFile = async(file)=>{
  try{
    let obj = await fs.readFileSync(path.join(baseDir, 'data', 'gameData.json'))
    if(obj) return JSON.parse(obj)
  }catch(e){
    log.error(e)
  }
}

module.exports = async(gameVersion, s3Versions = {})=>{
  try{
    if(!gameVersion) return
    log.info('creating gameData.json for version '+gameVersion)
    let uploadFile = true, status, gameData
    if(s3Versions['gameData.json']) gameData = await getLocalFile()
    if(gameData?.version && gameData?.data && gameData.version === gameVersion){
      gameData = gameData.data
    }else{
      gameData = null
      let data = await getDataFiles(gameVersion)
      if(!data) return
      gameData = await buildData(data)
    }
    if(gameData) status = await saveFile('gameData', {version: gameVersion, data: gameData})
    if(status){
      s3Versions['gameData.json'] = gameVersion
      log.info('gameData.json updated to version '+gameVersion+'...')
      return true
    }else{
      log.error('error updating gameData.json')
    }
  }catch(e){
    throw(e);
  }
}
