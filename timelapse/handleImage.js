const PiCamera = require('pi-camera')
const aws = require('aws-sdk')
const fs = require('fs-extra')
const path = require('path')

const log = require('../utils/log')
const pad = require('../utils/pad')

const maxFrameCount = Number(process.env.MAX_FRAME_COUNT)
const bucketName = process.env.BUCKET_NAME
const imageDir = path.join(__dirname, '../media/images')

function handleImage () {
  getImage()
    .then(pruneOldestImage)
    .then(shouldRename => {
      if (shouldRename) return renameImages()
    })
    .then(sendLatestImage)
    .catch(log)
}

function getImage () {
  return fs.readdir(imageDir)
    .then(files => {
      const filepath = path.join(imageDir, `frame_${pad(files.length + 1, 4)}.png`)
      const camera = new PiCamera({
        mode: 'photo',
        output: filepath,
        encoding: 'png',
        width: 1280,
        height: 720,
        nopreview: true
      })
      camera.snap()
    })
    .then(res => log('image captured'))
    .catch(log)
}

const pruneOldestImage = () => {
  return fs.readdir(imageDir)
    .then(files => {
      if (files.length >= maxFrameCount) {
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
      return files.forEach((file, index) => {
        const oldName = path.join(imageDir, file)
        const newName = path.join(imageDir, `frame_${pad(index + 1, 4)}.png`)
        fs.renameSync(oldName, newName)
      })
    })
    .then(() => log('renaming complete'))
    .catch(log)
}

async function sendLatestImage () {
  const s3 = new aws.S3()

  const files = await fs.readdir(imageDir).catch(log)
  const latestFile = path.join(imageDir, files.pop())
  const fileData = await fs.readFile(latestFile).catch(log)

  const params = {
    Body: Buffer.from(fileData, 'binary'),
    Bucket: bucketName,
    Key: 'timelapse.png'
  }

  return s3.putObject(params).promise()
}

module.exports = handleImage
