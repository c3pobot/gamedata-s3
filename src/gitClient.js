'use strict'
const log = require('logger')
const path = require('path')
const fetch = require('node-fetch')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL
const GITHUB_USER_NAME = process.env.GITHUB_USER_NAME
const GITHUB_USER_EMAIL = process.env.GITHUB_USER_EMAIL

const parseResponse = async(res)=>{
  try{
    if(!res) return
    if (res.status?.toString().startsWith('5')) {
      throw('Bad status code '+res.status)
    }
    let body
    if (res.headers?.get('Content-Type')?.includes('application/json')) body = await res?.json()
    if(!body && res?.status < 300) body = res.body
    if(res.status >= 400) throw(`${res.status}: ${res?.statusText}`)
    return body
  }catch(e){
    throw(e);
  }
}
const apiRequest = async(uri, method = 'GET', body, headers)=>{
  try{
    let req = { method: method, timeout: 60000, compress: true, headers: {'Content-Type': 'application/json'}}
    if(headers) req.headers = {...req.headers,...headers}
    if(body) req.body = body
    let obj = await fetch(uri, req)
    return await parseResponse(obj)
  }catch(e){
    throw(e)
  }
}
module.exports.push = async(fileName, data, commitMsg, sha)=>{
  try{
    if(!GITHUB_TOKEN || !GITHUB_REPO_URL || !GITHUB_USER_NAME || !GITHUB_USER_EMAIL || !data || !fileName || !commitMsg) throw(`missing git info for upload`)
    let body = {
      committer: {name: GITHUB_USER_NAME, email: GITHUB_USER_EMAIL},
      message: commitMsg,
      content: data,
      sha: sha
    }
    return await apiRequest(path.join(GITHUB_REPO_URL, fileName), 'PUT', JSON.stringify(body), { Authorization: `Bearer ${GITHUB_TOKEN}` })
  }catch(e){
    throw(e);
  }
}
module.exports.get = async(file)=>{
  try{
    if(!GITHUB_TOKEN || !GITHUB_REPO_URL) throw('Missing git info...')
    let data = await apiRequest(path.join(GITHUB_REPO_URL, file), 'GET', null, { Authorization: `Bearer ${GITHUB_TOKEN}` })
    if(data?.content){
      let obj = Buffer.from(data.content, 'base64')
      if(obj) return JSON.parse(obj)
    }
  }catch(e){
    log.error(e);
  }
}
module.exports.getAll = async()=>{
  try{
    if(!GITHUB_TOKEN || !GITHUB_REPO_URL) throw('Missing git info...')
    return await apiRequest(GITHUB_REPO_URL, 'GET', null, { Authorization: `Bearer ${GITHUB_TOKEN}` })
  }catch(e){
    throw(e)
  }
}
