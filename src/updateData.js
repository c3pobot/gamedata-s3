'use strict'
const log = require('logger')
const fs = require('fs')
const path = require('path')
const fetch = require('./fetch')
const getMinioObject = require('./getMinioObject')
const getGameData = require('./getGameData')
const getLocale = require('./getLocale')
const dataBuilder = require('./dataBuilder')
const saveFile = require('./saveFile')
const updateGit = require('./updateGit')
const DATA_BUCKET = process.env.DATA_BUCKET
const MINIO_PUBLIC_URI = process.env.MINIO_PUBLIC_URI
let s3Versions
const saveVersions = async(meta = {})=>{
  try{
    let versions = JSON.parse(JSON.stringify(s3Versions))
    versions.gameVersion = meta.latestGamedataVersion
    versions.localeVersion = meta.latestLocalizationBundleVersion
    versions.assetVersion = meta.assetVersion
    let array = Object.values(versions)
    if(array?.filter(x=>x === meta.latestGamedataVersion || x === meta.latestLocalizationBundleVersion || x === meta.assetVersion).length === array?.length && array?.length > 0){
      let status = await saveFile('versions', versions)
      if(status){
        s3Versions = versions
        return true
      }
    }
  }catch(e){
    throw(e)
  }
}
const getS3Versions = async()=>{
  try{
    if(!DATA_BUCKET) throw('S3 info not provided...')
    let result = await getMinioObject(DATA_BUCKET, 'versions.json')
    if(result) s3Versions = JSON.parse(result)
  }catch(e){
    log.error('Error getting versions for s3 bucket')
    log.error(e)
  }
}
module.exports = async(versions = {}, meta = {})=>{
  try{
    if(!s3Versions) await getS3Versions()
    if(!s3Versions) s3Versions = {}
    if(s3Versions.gameVersion === meta.latestGamedataVersion && s3Versions.localeVersion === meta.latestLocalizationBundleVersion && s3Versions.assetVersion === meta.assetVersion){
      versions.gameVersion = meta.latestGamedataVersion
      versions.localeVersion = meta.latestLocalizationBundleVersion
      versions.assetVersion = meta.assetVersion
      log.info(`S3 versions match gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
      return;
    }
    let status = await saveFile('meta', { version: meta.latestGamedataVersion, data: meta })
    if(status){
      s3Versions['meta.json'] = meta.latestGamedataVersion
      status = await getGameData(meta.latestGamedataVersion, s3Versions)
    }
    if(status) status = await getLocale(meta.latestLocalizationBundleVersion, s3Versions)
    if(status) status = await dataBuilder(meta.latestGamedataVersion, s3Versions)
    if(status) status = await saveVersions(meta)

    if(status){
      versions.gameVersion = meta.latestGamedataVersion
      versions.localeVersion = meta.latestLocalizationBundleVersion
      versions.assetVersion = meta.assetVersion
      log.info(`S3 versions updated to gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
    }
  }catch(e){
    throw(e)
  }
}
module.exports.checkGit = async(versions = {})=>{
  try{
    if(!s3Versions) await getS3Versions()
    if(!s3Versions) s3Versions = {}
    if(s3Versions.gameVersion && s3Versions.gameVersion === versions.gameVersion && s3Versions.localeVersion === versions.localeVersion && s3Versions.assetVersion === versions.assetVersion) await updateGit(versions, s3Versions)
  }catch(e){
    throw(e)
  }
}
