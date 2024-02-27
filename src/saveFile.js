'use strict'
const path = require('path')
const fs = require('fs')
const minioClient = require('./minio')
const DATA_BUCKET = process.env.DATA_BUCKET

const SaveFile = async(name, data)=>{
  try{
    await fs.writeFileSync(path.join(baseDir, 'data', `${name}.json`), data)
  }catch(e){
    throw(e)
  }
}
const UploadMinio = async(name, data)=>{
  try{
    if(!DATA_BUCKET) throw('S3 Bucket not defined...')
    let result = await minioClient.putObject(DATA_BUCKET, `${name}.json`, data, { 'Content-Type': 'application/json' })
    return result?.etag
  }catch(e){
    throw(e)
  }
}
module.exports = async(name, data)=>{
  try{
    let dataStore = JSON.stringify(data)
    await SaveFile(name, dataStore)
    return await UploadMinio(name, dataStore)
  }catch(e){
    throw(e)
  }
}
