'use strict';

const {ipcRenderer, shell} = require('electron')
const Spotify = require('./spotify')

let authCode, state, tokens;

function buttonClicked() {
  const array = new Uint32Array(1);
  state = (window.crypto.getRandomValues(array)[0]).toString()  
  Spotify.authorize(state)
}

ipcRenderer.on('authorized', (event, data) => {
  let params = new URLSearchParams(data.split('?').pop())
  authCode = params.get('code')
  if (params.get('state') !== state) {
    // todo generic error
    return false
  }
  Spotify.getTokens(authCode).then((spotifyResponse) => {
    if (spotifyResponse.status === 200) {
      tokens = spotifyResponse.data
      localStorage.setItem('heartlist', JSON.stringify(tokens))
      document.getElementById('message').textContent = 'success!'
    } else {
      // todo generic error
    }
  }).catch((err) => {
    debugger
    console.log(err)
  })
})

function launchClicked() {
  ipcRenderer.send('launch-clicked')
}

document.getElementById('authorize').addEventListener('click', buttonClicked)
document.getElementById('launch').addEventListener('click', launchClicked)