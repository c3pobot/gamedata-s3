'use strict'
const log = require('logger')
const GameClient = require('./client')
const saveFile = require('./saveFile')
const saveUnits = async(data = [], gameVersion, s3Versions = {})=>{
  try{
    if(data.length === 0) return
    let saveSuccess = 0
    let units = await saveFile('units', { version: gameVersion, data: data.filter(x=>x.obtainable === true && x.obtainableTime === "0") })
    if(units){
      s3Versions['units.json'] = gameVersion
      saveSuccess++
    }
    let units_pve = await saveFile('units_pve', { version: gameVersion, data: data.filter(x=>x.obtainable !== true || x.obtainableTime !== "0") })
    if(units_pve){
      s3Versions['units_pve.json'] = gameVersion
      saveSuccess++
    }
    if(saveSuccess === 2) return true
  }catch(e){
    throw(e);
  }
}
const getGameDataSegment = async(gameVersion, segment, s3Versions)=>{
  try{
    let count = 0, saveSuccess = 0
    let data = await GameClient.getGameData(gameVersion, segment)
    if(data){
      for(let i in data){
        if(!data[i] || data[i]?.length === 0) continue;
        count++;
        if(i === 'units'){
          let units = await saveUnits(data[i], gameVersion, s3Versions)
          if(units === true) saveSuccess++
        }else{
          let status = await saveFile(i, { version: gameVersion, data: data[i] })
          if(status){
            s3Versions[`${i}.json`] = gameVersion
            saveSuccess++
          }
        }

      }
      log.info(`Retrieved ${saveSuccess}/${count} files...`)
      if(count === saveSuccess) return true;
    }
  }catch(e){
    throw(e)
  }
}
module.exports = async(version, s3Versions = {})=>{
  try{
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
        let status = await getGameDataSegment(version, segments[i], s3Versions)
        if(status) saveSuccess++;
      }
    }
    log.info(`Retrieved ${saveSuccess}/${count} gameData segments...`)
    if(count > 0 && count === saveSuccess) return true
  }catch(e){
    throw(e)
  }
}
