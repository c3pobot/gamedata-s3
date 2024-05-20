'use strict'
const log = require('logger')
const fs = require('fs')
const DATA_DIR = process.env.DATA_DIR || '/app/data/files'
module.exports = async(file)=>{
  try{
    let obj = await fs.readFileSync(`${DATA_DIR}/${file}.json`)
    if(obj) return JSON.parse(obj)
  }catch(e){
    log.error(`error reading ${DATA_DIR}/${file}.json`)
  }
}
