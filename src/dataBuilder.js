'use strict'
const fs = require('fs')
const log = require('logger')
const path = require('path')
const saveFile = require('./saveFile')
const getDataFiles = require('./getDataFiles')
const buildData = require('./buildData')
const readFile = require('./readFile')
const getLocalFile = async(file)=>{
  try{
    let obj = await fs.readFileSync(path.join(baseDir, 'data', 'gameData.json'))
    if(obj) return JSON.parse(obj)
  }catch(e){
    log.error(e)
  }
}

module.exports = async(gameVersion, gitVersions = {})=>{
  if(!gameVersion) return
  log.info('creating gameData.json for version '+gameVersion)
  let gameData = await readFile('gameData')
  if(!gameData) gameData = {}
  if(gameData?.version === gameVersion && gameData?.data){
    gitVersions['gameData.json'] = gameVersion
    return true
  }
  let data = await getDataFiles(gameVersion)
  if(!data) return
  gameData.data = buildData(data)
  if(!gameData.data) return
  let status = await saveFile('gameData', { version: gameVersion, data: gameData.data })
  if(status){
    log.info('gameData.json updated to version '+gameVersion+'...')
    gitVersions['gameData.json'] = gameVersion
    return true
  }
  log.error('error updating gameData.json')
}
