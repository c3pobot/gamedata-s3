'use strict'
const fs = require('fs')
const path = require('path')
const log = require('logger')
const readFile = require('./readFile')
const gameDataFilesNeeded = ['equipment', 'relicTierDefinition', 'skill', 'statModSet', 'statProgression', 'table', 'units', 'xpTable']
const getDataFile = async(file, version)=>{
  try{
    let obj = await readFile(file)
    if(obj?.version && obj?.data && obj?.version === version) return obj.data
  }catch(e){
    log.error(e);
  }
}
module.exports = async(gameVersion) =>{
  let data = {}, count = 0
  for(let i in gameDataFilesNeeded){
    let file = await getDataFile(gameDataFilesNeeded[i], gameVersion)
    if(file?.length > 0){
      data[gameDataFilesNeeded[i]] = file
      count++
    }else{
      return;
    }
  }
  if(count > 0 && count === +gameDataFilesNeeded.length) return data
}
