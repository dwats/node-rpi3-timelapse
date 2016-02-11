const RaspiCam = require('raspicam');
const request = require('request');
const path = require('path');
const moment = require('moment');
const fs = require('fs');

const mode = 'photo' // or timelapse
const output = {
  photo: path.join(__dirname, 'photos', `${moment().format('HH_mm_ss_DD_MM_YYYY')}.png`),
  timelapse: path.join(__dirname, 'timelapse', moment().format('HH_mm_ss_DD_MM_YYYY'), `timelapse_%d.png`)
}

const camera = new RaspiCam({
  mode,
  output: output[mode],
  encoding: 'png',
  width: 3280,
  height: 2464,
  thumb: '100:100:8',
  rotation: 180
});

camera.start();
camera.on('start', () => {
  console.log('camera started');
});

camera.on('read', (err, timestamp, filename) => {
  if (err) return console.log('Error on read', err);

  const image = fs.readFileSync(output[mode]);
  const base64image = image.toString('base64');
  fs.writeFileSync(`photos/${filename}.txt`, base64image);
  console.log(`${filename}.txt ready`);
  camera.stop();
});

camera.on('stop', () => {
  console.log('camera stopped');
})
