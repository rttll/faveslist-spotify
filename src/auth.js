
const {ipcRenderer, shell} = require('electron')
const Spotify = require('./spotify')

let state, tokens;

Spotify.init()

function initAuthorization() {
  const array = new Uint32Array(1);
  state = (window.crypto.getRandomValues(array)[0]).toString()  
  Spotify.authorize(state)
}

ipcRenderer.on('authorized', (event, data) => {
  console.log('autoh')
  let params = new URLSearchParams(data.split('?').pop())
  let authCode = params.get('code')
  if (params.get('state') !== state) {
    // todo generic error
    return false
  }
  Spotify.getTokens(authCode)
    .then( (tokens) => {
      debugger
      Spotify.setTokens(tokens)
    }).then(() => {
      return Spotify.setUser()
    }).then(() => {
      document.getElementById('message').textContent = 'success!'
    }).catch((err) => {
      console.log(err)
    })
})

function launchClicked() {
  ipcRenderer.send('launch-clicked')
}

async function savePlaylist() {
  let playlist = await Spotify.setPlaylist(document.getElementById('playlist-name').value)
}

document.getElementById('authorize').addEventListener('click', initAuthorization)
// initAuthorization()
document.getElementById('launch').addEventListener('click', launchClicked)
document.getElementById('save-playlist-name').addEventListener('click', savePlaylist)