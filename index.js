require('dotenv').config();
const PiCamera = require('pi-camera');
const FormData = require('form-data');
const moment = require('moment');
const axios = require('axios');
const path = require('path');
const { URL } = require('url');
const fs = require('fs');

let TOKEN;
// const API_URL = 'http://ec2-52-87-212-190.compute-1.amazonaws.com';
const API_URL = 'http://192.168.1.100:3000';
const mode = 'photo';
const output = path.join(__dirname, 'tmp/tmp.png');
const camera = new PiCamera({
  mode,
  output,
  encoding: 'png',
  width: 1024,
  height: 768
});


const sendPicture = () => {
  const form = new FormData();
  const api = new URL(API_URL);
  form.append('file', fs.createReadStream(path.join(output)), {
    filepath: output,
    contentType: 'image/png'
  });
  const config = {
    host: api.hostname,
    port: api.port,
    path: '/images',
    headers: { 'x-auth': TOKEN }
  }

  return new Promise((resolve, reject) => {
    form.submit(config, (err, res) => {
      if (err) resolve(`${res.statusCode} @ ${new Date()}`);
      if (!res) reject(`${res.statusCode}`);
      resolve(`${res.statusCode} @ ${new Date()}`);
    });
  });
};

const doTimelapse = (interval) => {
  takePicture()
    .then(() => sendPicture())
    .then((res) => {
      prunePictures()
      return res;
    })
    .then((res) => {
      console.log(res);
      setTimeout(doTimelapse, interval);
    })
    .catch((e) => {
      console.log(e, '\n\nError Encountered', new Date())
      logout();
    });
};

const login = () => {
  return axios.post(`${API_URL}/users/login`, {
    username: process.env.UNAME,
    password: process.env.PASSWORD
  })
  .then((res) => {
    TOKEN = res.headers['x-auth'];
    return res;
  })
  .catch((e) => console.log(e));
};

const logout = () => axios.delete(`${API_URL}/users/me/token`, { headers: { 'x-auth': TOKEN }});
const prunePictures = () => axios.delete(`${API_URL}/images`, { headers: { 'x-auth': TOKEN }});
const takePicture = () => camera.snap();

login()
  .then(() => doTimelapse(60000))
  .catch((e) => {
    console.log(e);
    logout();
  });

