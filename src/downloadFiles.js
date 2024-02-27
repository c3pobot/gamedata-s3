'use strict'
const log = require('logger')
const fs = require('fs')
const path = require('path')
const getMinioObject = require('./getMinioObject')
const DATA_BUCKET = process.env.DATA_BUCKET
const MINIO_PUBLIC_URI = process.env.MINIO_PUBLIC_URI
const saveFile = async(name, data)=>{
  try{
    await fs.writeFileSync(path.join(baseDir, 'data', name), JSON.stringify(data))
    return true
  }catch(e){
    throw(e)
  }
}
const readFile = async(name)=>{
  try{
    let res = await fs.readFileSync(path.join(baseDir, 'data', name))
    if(res) return JSON.parse(res)
  }catch(e){
    log.error(e)
  }
}
const fetchFile = async(name)=>{
  try{
    if(!MINIO_PUBLIC_URI || !DATA_BUCKET) throw(`S3 info not provided...`)
    let result = await getMinioObject(DATA_BUCKET, name)
    if(result) return JSON.parse(result)
  }catch(e){
    log.error(e)
  }
}
module.exports = async()=>{
  try{
    let versions = await readFile('versions.json')
    if(versions) return versions
    versions = await fetchFile('versions.json')
    if(versions?.gameVersion){
      let count = 0, saveSuccess = 0
      for(let i in versions){
        if(i === 'gameVersion' || i === 'localeVersion' || i === 'assetVersion') continue;
        count++;
        let data = await fetchFile(i)
        if(data?.version){
          let status = await saveFile(i, data)
          if(status === true) saveSuccess++
        }
      }
      log.info(`Saved ${saveSuccess}/${count} files to disk`)
      if(count === saveSuccess){
        await saveFile('versions.json', versions)
        return versions
      }
    }
  }catch(e){
    log.error(e)
  }
}
