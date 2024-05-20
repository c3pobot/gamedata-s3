const log = require('logger')
const fetch = require('./fetch')
const shell = require('shelljs')
const base64ToJson = (str)=>{
  if(!str) return
  let json = Buffer.from(str, 'base64').toString()
  if(json) return JSON.parse(json)
}
const get = async({ repo, fileName, token })=>{
  if(!repo || !fileName) return
  let uri = `https://api.github.com/repos/${repo}/contents/${fileName}`, headers
  if(token) header = { 'Authorization': `Bearer ${token}` }
  return await fetch(uri, 'GET', null, headers)
}
const getSha = async(opt = {})=>{
  if(!opt.repo || !opt.fileName) return
  let file = await get(opt)
  return file?.sha
}
module.exports.get = get
module.exports.getSha = getSha
module.exports.list = async({ repo, token, dir })=>{
  if(!repo) return
  let uri = `https://api.github.com/repos/${repo}/contents`, headers
  if(dir) uri += `/${dir}`
  if(token) header = { 'Authorization': `Bearer ${token}` }
  return await fetch(uri, 'GET', null, headers)
}
module.exports.push = async(dir, commitMsg)=>{
  if(!dir) return
  let status = await shell.cd(dir)
  status = await shell.exec('git pull')
  log.info(`starting git push...`)
  if(status?.code == 0) status = await shell.exec('git add .')
  if(status?.code == 0) status = await shell.exec(`git commit -m ${commitMsg || 'update'}`)
  if(status?.code == 0 || status?.code == 1) status = await shell.exec('git push')
  log.info(`git push done...`)
  if(status?.code == 0) return true
}
module.exports.clone = async({ repo, dir, user, token, branch }) =>{
  if(!repo || !dir || !user || !token) return
  let uri = `https://${user}:${token}@github.com/${repo}.git`
  log.info(`starting git clone...`)
  let status = await shell.exec(`git clone ${uri} ${dir}`)
  log.info(`git clone done...`)
  if(status?.code == 0) return true
}
module.exports.pull = async(dir)=>{
  if(!dir) return
  await shell.cd(dir)
  log.info(`starting git pull...`)
  let status = await shell.exec(`git pull ${dir}`)
  log.info(`git pull done`)
  if(status?.code == 0) return true
}
module.exports.getJson = async(opt = {})=>{
  if(!opt.repo || !opt.fileName) return
  let file = await get(opt)
  return base64ToJson(file?.content)
}
module.exports.config = async({ user, email, dir })=>{
  let status = await shell.exec(`git config --global user.email "${email}"`)
  if(status?.code == 0) status = await shell.exec(`git config --global user.name "${user}"`)
  if(status?.code == 0) status = await shell.exec(`git config --global --add safe.directory ${dir}`)
  if(status?.code == 0) return true
}
