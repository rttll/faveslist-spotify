'use strict'

const {ipcRenderer, shell} = require('electron')
const {globalShortcut} = require('electron').remote

// DOM
const container = document.getElementsByTagName('main')[0]
const addTrackTrigger = document.getElementById('add-track')
const heart = document.getElementById('heart-container')
const trackName = document.getElementById('track-name')
const trackArtist = document.getElementById('track-artist')
const trackImage = document.getElementById('track-image')
const errText = document.getElementById('error');

const Spotify = require('../../spotify')

let config, playing;

init()

async function init() {
  if (localStorage.getItem('tokens') === null) {
    ipcRenderer.send('show-user-auth-window')
  }  
  config = Spotify.init()
  playing = await Spotify.currentlyPlaying()
  // let player = await Spotify.player()
  console.log(playing)

  if (playing.length > 0) updateUI()

}

function updateUI() {
  let track = playing.item
  let artists = []
  for (var v of track.artists) {
    artists.push(v.name)
  }
  errText.textContent = ''
  container.classList.remove('loading')
  trackArtist.textContent = artists.join(', ')
  trackName.textContent = track.name
  trackImage.src = track.album.images[0].url
  if (playlist.tracks.indexOf(track.id) > -1) {
    heart.classList.add('liked')
  } else {
    heart.classList.remove('liked')
  }
}



















/* 

  inspect element 
  
  
  */

const {remote} = require('electron')
const {Menu, MenuItem} = remote
let rightClickPosition;
const menu = new Menu()
menu.append(new MenuItem({
  label: 'Inspect Element',
  click: () => {
    remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
  }
}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = {x: e.x, y: e.y}
  menu.popup(remote.getCurrentWindow())
}, false)