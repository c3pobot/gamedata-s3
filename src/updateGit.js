'use strict'
const log = require('logger')
const fs = require('fs')
const path = require('path')
const gitClient = require('./gitClient')
const getMinioObject = require('./getMinioObject')
const DATA_BUCKET = process.env.DATA_BUCKET
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const fetch = require('node-fetch')
let notify = false
const readFile = async(file)=>{
  try{
    return await fs.readFileSync(path.join(baseDir, 'data', file))
  }catch(e){
    log.error(e)
  }
}
const getFile = async(file)=>{
  try{
    let data = await readFile(file)
    if(!data) data = await getMinioObject(DATA_BUCKET, file)
    if(data) return JSON.parse(data)
  }catch(e){
    throw(e)
  }
}
let gitVersions
const updateGitVersions = async()=>{
  try{
    if(!gitVersions){
      let tempVersions = await gitClient.get('allVersions.json')
      if(tempVersions?.gameVersion) gitVersions = tempVersions
    }
  }catch(e){
    throw(e)
  }
}
const fetchGitFile = async(name)=>{
  try{
    let res = await fetch(path.join(GITHUB_REPO_RAW_URL, name), { method: 'GET', compress: true, timeout: 60000 })
    if(res?.status?.toString().startsWith('2')) return await res.json()
  }catch(e){
    log.error(e)
  }
}
const checkGitFile = async(name, version)=>{
  try{
    let data = await fetchGitFile(name)
    if(data && data?.version === version) return true
  }catch(e){
    throw(e)
  }
}
const updateGitFile = async(name, version, gitInfo = {})=>{
  try{
    let status = await checkGitFile(name, version)
    if(status) return true
    let data = await getFile(name)
    if(data?.version && data.version === version){
      let obj = Buffer.from(JSON.stringify(data)).toString('base64')
      let status = await gitClient.push(name, obj, version, gitInfo.sha)
      console.log(status?.commit?.sha)
      if(status?.commit?.sha) return true
    }
  }catch(e){
    throw(e)
  }
}
module.exports = async(versions = {}, s3Versions = {})=>{
  try{
    await updateGitVersions()
    if(gitVersions?.gameVersion && gitVersions.gameVersion === versions.gameVersion && gitVersions.localeVersion === versions.localeVersion && gitVersions.assetVersion === versions.assetVersion){
      if(!notify){
        log.info(`git versions match gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`);
        notify = true
      }
      return true
    }
    log.info(`updating repo for gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
    if(!gitVersions) gitVersions = {}
    let count = 0, saveSuccess = 0
    let gitFiles = await gitClient.getAll()
    for(let i in s3Versions){
      if(i === 'gameVersion' || i === 'localeVersion' || i === 'assetVersion' || i === 'meta.json') continue;
      count++;
      if(s3Versions[i] !== gitVersions[i]){
        let status = await updateGitFile(i, s3Versions[i], gitFiles?.find(x=>x.name === i))
        if(status){
          gitVersions[i] = s3Versions[i]
          saveSuccess++
        }
      }else{
        saveSuccess++
      }
    }
    log.info(`update ${saveSuccess}/${count} git files...`)
    if(count > 0 && count === saveSuccess){
      let status = await gitClient.push('versions.json', Buffer.from(JSON.stringify(versions)).toString('base64'), versions.gameVersion, gitFiles?.find(x=>x.name === 'versions.json')?.sha)
      if(status?.commit?.sha) status = await gitClient.push('allVersions.json', Buffer.from(JSON.stringify(s3Versions)).toString('base64'), versions.gameVersion, gitFiles?.find(x=>x.name === 'allVersions.json')?.sha)
      if(status?.commit?.sha){
        gitVersions = JSON.parse(JSON.stringify(s3Versions))
        return true
      }
    }
  }catch(e){
    throw(e)
  }
}
