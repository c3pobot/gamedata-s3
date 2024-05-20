'use strict'
const log = require('logger')
const GameClient = require('./client')
const saveFile = require('./saveFile')
const saveUnits = async(data = [], gameVersion, gitVersions = {})=>{
  if(data.length === 0) return
  let saveSuccess = 0
  let units = await saveFile('units', { version: gameVersion, data: data.filter(x=>x.obtainable === true && x.obtainableTime === "0") })
  if(units){
    gitVersions['units.json'] = gameVersion
    saveSuccess++
  }
  let units_pve = await saveFile('units_pve', { version: gameVersion, data: data.filter(x=>x.obtainable !== true || x.obtainableTime !== "0") })
  if(units_pve){
    gitVersions['units_pve.json'] = gameVersion
    saveSuccess++
  }
  if(saveSuccess === 2) return true
}
const getGameDataSegment = async(gameVersion, segment, gitVersions)=>{
  let count = 0, saveSuccess = 0
  let data = await GameClient.getGameData(gameVersion, segment)
  if(!data) return
  for(let i in data){
    if(!data[i] || data[i]?.length === 0) continue;
    count++;
    if(i === 'units'){
      let units = await saveUnits(data[i], gameVersion, gitVersions)
      if(units === true) saveSuccess++
    }else{
      let status = await saveFile(i, { version: gameVersion, data: data[i] })
      if(status){
        gitVersions[`${i}.json`] = gameVersion
        saveSuccess++
      }
    }

  }
  log.info(`Retrieved ${saveSuccess}/${count} files...`)
  if(count === saveSuccess) return true;
}
module.exports = async(version, gitVersions = {})=>{
  log.info(`Getting gameData Files for ${version}...`)
  let count = 0, saveSuccess = 0
  let enums = await GameClient.getEnums()
  if(!enums || !enums['GameDataSegment']) throw('Error getting enums...')
  let enumSave = await saveFile('enums', {version: version, data: enums})
  if(!enumSave) throw('Error saving enums...')
  let segments = enums['GameDataSegment']
  for(let i in segments){
    if(segments[i] > 0){
      count++;
      let status = await getGameDataSegment(version, segments[i], gitVersions)
      if(status) saveSuccess++;
    }
  }
  log.info(`Retrieved ${saveSuccess}/${count} gameData segments...`)
  if(count > 0 && count === saveSuccess) return true
}
