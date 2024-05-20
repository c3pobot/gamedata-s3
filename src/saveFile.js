'use strict'
const path = require('path')
const fs = require('fs')
const DATA_DIR = process.env.DATA_DIR || '/app/data/files'

module.exports = async(file, data)=>{
  await fs.writeFileSync(`${DATA_DIR}/${file}.json`, JSON.stringify(data))
  return true
}
