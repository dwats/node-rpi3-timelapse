const PiCamera = require('pi-camera')
const FormData = require('form-data')
const fs = require('fs-extra')
const { URL } = require('url')
const path = require('path')

const log = require('../utils/log')
const pad = require('../utils/pad')

const apiUrl = new URL(process.env.API_URL)
const imageDir = path.join(__dirname, '../media/images')

async function handleImage () {
  getImage()
    .then(pruneOldestImage)
    .then(renameImages)
    // .then(sendLatestImage)
    .catch(log)
}

function getImage () {
  const camera = new PiCamera({
    mode: 'photo',
    output: path.join(imageDir, 'frame_0391.png'),
    encoding: 'png',
    width: 1280,
    height: 720,
    nopreview: true
  })

  log('grabbing image...')
  return camera.snap()
}

const pruneOldestImage = () => {
  return fs.readdir(imageDir)
    .then(files => {
      if (files.length > 390) {
        toDelete = path.join(imageDir, files.shift())
        log(`deleting ${toDelete}`)
        fs.unlinkSync(toDelete)
      }
    })
    .catch(log)
}

function renameImages () {
  return fs.readdir(imageDir)
    .then(files => {
      /**
       * @todo create standalone reverse `forEach`
       */
      const filesLen = files.length - 1
      for (let index = filesLen; index >= 0; index--) {
        const file = files[index]
        fs.renameSync(
          path.join(imageDir, file),
          path.join(imageDir, `frame_${pad(index + 1, 4)}.png`)
        )
      }
    })
    .catch(log)
}

function sendLatestImage () {
  return new Promise((resolve, reject) => {
    const form = new FormData()

    form.append('file', fs.createReadStream(path.join(imageDir, 'frame_0001.png')), {
      filepath: output,
      contentType: 'image/png'
    })
    const config = {
      host: apiUrl.hostname,
      path: '/image'
    }

    form.submit(config, (err, res) => {
      if (err) return resolve(err, `\nerr @ ${new Date()}`)
      if (!res) return reject(Error('No response.'))
      return resolve(`submit ok @ ${new Date()}`)
    })
  })
}

module.exports = handleImage
