'use strict'
const path = require('path')
const CLIENT_URL = process.env.CLIENT_URL
const fetch = require('./fetch')
module.exports.getGameData = async(version, segment = 0)=>{
  try{
    return await fetch(path.join(CLIENT_URL, 'data'), 'POST', { version: version,  includePveUnits: true,  requestSegment: segment})
  }catch(e){
    throw(e)
  }
}
module.exports.getLocale = async(version)=>{
  try{
    return await fetch(path.join(CLIENT_URL, 'localization'), 'POST', { id: version })
  }catch(e){
    throw(e)
  }
}
module.exports.getMetaData = async()=>{
  try{
    return await fetch(path.join(CLIENT_URL, 'metadata'), 'POST')
  }catch(e){
    throw(e)
  }
}
module.exports.getEnums = async()=>{
  try{
    return await fetch(path.join(CLIENT_URL, 'enums'), 'GET')
  }catch(e){
    throw(e)
  }
}
