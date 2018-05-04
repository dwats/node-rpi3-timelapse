const ffmpeg = require('fluent-ffmpeg')
const FormData = require('form-data')
const { URL } = require('url')
const path = require('path')
const fs = require('fs')

const log = require('../utils/log')

const input = path.join(__dirname, '../media/images/frame_%04d.png')
const output = path.join(__dirname, '../media/video/timelapse.mp4')

async function handleTimelapse () {
  getTimelapse()
    // .then(sendTimelapse)
    // .catch(log)
}

function getTimelapse () {
  ffmpeg()
    .addInput(input)
    .videoCodec('libx264')
    .fps(30)
    .size('1280x720')
    .output(output)
    .on('start', cli => log('ffmpeg starting...'))
    .on('end', () => log('ffmpeg finished'))
    .on('error', err => {
      if (err) log('ffmpeg error\n', err.message)
    })
    .run()
}

function sendTimelapse () {
  return new Promise((resolve, reject) => {
    const form = new FormData()

    form.append('file', fs.createReadStream(output), {
      filepath: output,
      contentType: 'image/png'
    })
    const config = {
      host: apiUrl.hostname,
      path: '/video'
    }

    form.submit(config, (err, res) => {
      if (err) return resolve(err, `\nerr @ ${new Date()}`)
      if (!res) return reject(Error('No response.'))
      return resolve(`submit ok @ ${new Date()}`)
    })
  })
}

module.exports = handleTimelapse
