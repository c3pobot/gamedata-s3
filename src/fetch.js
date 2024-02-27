'use strict'
const fetch = require('node-fetch')
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
module.exports = async(url, method = 'GET', payload, headers = {})=>{
  try{
    const req = { method: method, timeout: 60000, compress: true, headers: {'Content-Type': 'application/json'}}
    req.headers = {...req.headers,...headers}
    if(payload) req.body = JSON.stringify({ payload: payload })
    let obj = await fetch(url, req)
    return await parseResponse(obj)
  }catch(e){
    throw(e);
  }
}
