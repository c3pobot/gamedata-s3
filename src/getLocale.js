'use strict'
const log = require('logger')
const GameClient = require('./client')
const saveFile = require('./saveFile')
const JSZip = require('jszip');
const { createInterface } = require('readline');
const { once } = require('events');

const processStreamByLine = async (fileStream) => {
  const langMap = {};

  try {
    const rl = createInterface({
      input: fileStream,
      //crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const result = processLocalizationLine(line);
      if (result) {
        const [key, val] = result;
        langMap[key] = val;
      }
    });

    await once(rl, 'close');
  } catch (err) {
    console.error(err);
  }

  return langMap;
};
const processLocalizationLine = (line) => {
  if (line.startsWith('#')) return;
  let [ key, val ] = line.split(/\|/g).map(s => s.trim());
  if (!key || !val) return;
  val = val.replace(/^\[[0-9A-F]*?\](.*)\s+\(([A-Z]+)\)\[-\]$/, (m,p1,p2) => p1);
  return [key, val];
}
module.exports = async(version, s3Versions = {})=>{
  try{
    log.info(`Getting locale Files for ${version}...`)
    let count = 0, saveSuccess = 0
    let data = await GameClient.getLocale(version)
    if(!data) return
    let zipped = await (new JSZip())
          .loadAsync(Buffer.from(data.localizationBundle, 'base64'), { base64:true });
    data = Object.entries(zipped.files)
    if(!data) return
    for(let [lang, content] of data){
      count++
      let fileStream = content.nodeStream();
      let langMap = await processStreamByLine(fileStream);
      if(!langMap) continue;
      let status = await saveFile(lang, {version: version, data: langMap})
      if(status){
        s3Versions[`${lang}.json`] = version
        saveSuccess++
      }
    }
    log.info(`Retrieved ${saveSuccess}/${count} locale files`)
    if(count > 0 && count === saveSuccess) return true
  }catch(e){
    throw(e)
  }
}
