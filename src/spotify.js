const {ipcRenderer, shell} = require('electron')
const qs = require('qs');
const axios = require('axios')
require('dotenv').config()

const redirectUri = 'heartlist://'
const baseURL = 'https://accounts.spotify.com'
const authHeader = 'Basic ' + new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
axios.defaults.headers.common['Authorization'] = authHeader

let tokens;

function getTokens(authCode) {
  let options = {
    method: 'POST', 
    data: qs.stringify({
      'grant_type': 'authorization_code',
      'code': authCode,
      'redirect_uri': redirectUri
    }),
    url: baseURL + '/api/token'
  };
  return axios(options).then((resp) => {
    tokens = resp.data
    return resp
  }).catch((err) => {
    return err
  })
}


function getUserAuth(state) {
  const scopes = [
    'user-read-currently-playing', 
    'user-read-playback-state', 
    'playlist-read-private', 
    'playlist-modify-private', 
    'playlist-read-collaborative', 
    'playlist-modify-public'
  ];
  const options = {
    method: 'GET', 
    data: qs.stringify({
      'client_id': process.env.CLIENT_ID,
      'response_type': 'code',
      'scope': scopes,
      'state': state,
      'redirect_uri': redirectUri
    }),
    responseType: 'document',
    url: baseURL + '/authorize'
  };
  shell.openExternal(`${options.url}?${options.data}`)
}  

module.exports = {
  authorize: getUserAuth,
  getTokens: getTokens
}

