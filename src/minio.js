'use strict'
const Minio = require('minio')
const opts = {
  endPoint: process.env.MINIO_SCV_URL,
  accessKey: process.env.MINIO_ACCESSKEY,
  secretKey: process.env.MINIO_SECRETKEY
}
if(process.env.MINIO_PORT){
  opts.port = +process.env.MINIO_PORT
  opts.useSSL = false
}
const client = new Minio.Client(opts)
module.exports = client
