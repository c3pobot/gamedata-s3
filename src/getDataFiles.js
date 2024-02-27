'use strict'
const fs = require('fs')
const path = require('path')
const log = require('logger')
const gameDataFilesNeeded = ['equipment', 'relicTierDefinition', 'skill', 'statModSet', 'statProgression', 'table', 'units', 'xpTable']
const getDataFile = async(file, version)=>{
  try{
    let obj = await fs.readFileSync(path.join(baseDir, 'data', file))
    if(obj) obj = JSON.parse(obj)
    if(obj?.version && obj?.data && obj?.version === version) return obj.data
  }catch(e){
    log.error(e);
  }
}
module.exports = async(gameVersion) =>{
  try{
    let data = {}, count = 0
    for(let i in gameDataFilesNeeded){
      let file = await getDataFile(`${gameDataFilesNeeded[i]}.json`, gameVersion)
      if(file?.length > 0){
        data[gameDataFilesNeeded[i]] = file
        count++
      }else{
        return;
      }
    }
    if(count > 0 && count === +gameDataFilesNeeded.length) return data
  }catch(e){
    throw(e);
  }
}
