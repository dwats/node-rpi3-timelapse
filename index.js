require('dotenv').config()
const cron = require('node-cron')

const { handleImage, handleTimelapse } = require('./timelapse')

cron.schedule('0 */2 * * * *', () => {
  handleImage()
})

cron.schedule('30 0,30 * * * *', () => {
  handleTimelapse()
})
