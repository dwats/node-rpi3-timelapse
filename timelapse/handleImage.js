const PiCamera = require('pi-camera')
const FormData = require('form-data')
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
      if (shouldRename) renameImages
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
      if (files.length > maxFrameCount) {
        toDelete = path.join(imageDir, files.shift())
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
      const filesLen = files.length - 1
      files.forEach((file, index) => {
        const oldName = path.join(imageDir, file)
        const newName = path.join(imageDir, `frame_${pad(index + 1, 4)}.png`)
        fs.renameSync(oldName, newName)
      })
    })
    .catch(log)
}

// function sendLatestImage () {
//   return new Promise((resolve, reject) => {
//     const form = new FormData()

//     form.append('file', fs.createReadStream(path.join(imageDir, 'frame_0001.png')), {
//       filepath: output,
//       contentType: 'image/png'
//     })
//     const config = {
//       host: apiUrl.hostname,
//       path: '/image'
//     }

//     form.submit(config, (err, res) => {
//       if (err) return resolve(err, `\nerr @ ${new Date()}`)
//       if (!res) return reject(Error('No response.'))
//       return resolve(`submit ok @ ${new Date()}`)
//     })
//   })
// }

module.exports = handleImage
