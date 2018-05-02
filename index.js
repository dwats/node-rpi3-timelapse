require('dotenv').config()
const cron = require('node-cron')
const { handleImage, handleTimelapse } = require('./timelapse')

handleImage()
