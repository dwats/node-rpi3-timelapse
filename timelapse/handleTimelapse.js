const ffmpeg = require('fluent-ffmpeg')
const aws = require('aws-sdk')
const path = require('path')
const fs = require('fs-extra')

const log = require('../utils/log')

const bucketName = process.env.BUCKET_NAME
const input = path.join(__dirname, '../media/images/frame_%04d.png')
const output = path.join(__dirname, '../media/video/timelapse.mp4')

function handleTimelapse () {
  getTimelapse()
    .then(sendTimelapse)
    .then(log)
    .catch(log)
}

function getTimelapse () {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput(input)
      .videoCodec('libx264')
      .fps(30)
      .size('1280x720')
      .output(output)
      .on('start', cli => log('ffmpeg starting...'))
      .on('end', () => {
        log('ffmpeg finished')
        resolve()
      })
      .on('error', err => {
        if (err) reject(Error(err))
      })
      .run()
  })
}

async function sendTimelapse () {
  const s3 = new aws.S3()

  const fileData = await fs.readFile(output).catch(log)

  const params = {
    Body: Buffer.from(fileData, 'binary'),
    Bucket: bucketName,
    Key: 'timelapse.mp4'
  }

  return s3.putObject(params).promise()
}

module.exports = handleTimelapse
