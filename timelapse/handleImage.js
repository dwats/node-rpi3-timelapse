const PiCamera = require('pi-camera')
const { S3 } = require('aws-sdk')
const fs = require('fs-extra')
const { URL } = require('url')
const path = require('path')

const log = require('../utils/log')
const pad = require('../utils/pad')

const maxFrameCount = Number(process.env.MAX_FRAME_COUNT)
const apiUrl = new URL(process.env.API_URL)
const imageDir = path.join(__dirname, '../media/images')

async function handleImage () {
  getImage()
    .then(pruneOldestImage)
    .then(shouldRename => {
      if (shouldRename) renameImages()
    })
    // .then(sendLatestImage)
    .catch(log)
}

function getImage () {
  return fs.readdir(imageDir)
    .then(files => {
      const camera = new PiCamera({
        mode: 'photo',
        output: path.join(imageDir, `frame_${pad(files.length + 1, 4)}.png`),
        encoding: 'png',
        width: 1280,
        height: 720,
        nopreview: true
      })

      return camera.snap()
    })
    .then(res => log(`image captured`))
    .catch(log)
}

const pruneOldestImage = () => {
  return fs.readdir(imageDir)
    .then(files => {
      if (files.length > 390) {
        const toDelete = path.join(imageDir, files.shift())
        log(`deleting ${toDelete}`)
        fs.unlinkSync(toDelete)
        return true
      }
    })
    .catch(log)
}

function renameImages () {
  return fs.readdir(imageDir)
    .then(files => {
      files.forEach((file, index) => {
        const oldName = path.join(imageDir, file)
        const newName = path.join(imageDir, `frame_${pad(index + 1, 4)}.png`)
        fs.renameSync(oldName, newName)
      })
    })
    .catch(log)
}

function sendLatestImage () {
  const s3 = S3()

  const params = {
    Body: <Binary String>,
    Bucket: bucketName,
    Key: 'timelapse.png'
  }

  return s3.putObject(params).promise()
}

module.exports = handleImage
