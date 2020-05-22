import { h, render } from 'preact'

import "./stylesheets/app.css";
import App from './components/App.jsx'

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

/* App */

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

const Spotify = require('./services/spotify.js')

let AppMethods;

ipcRenderer.on('app-init', () => {
  init()
})

ipcRenderer.on('hydrate-track', () => {
  // AppMethods.hydrateTrack()
})

async function init() {
  
  // config = Spotify.init()
  // playing = await Spotify.currentlyPlaying()
  // let player = await Spotify.player()
  // console.log(playing)
  
  // if (playing.length > 0) updateUI()
  
  render(
    <App
    Spotify={ Spotify }
    ref={app => AppMethods = app}
    />,
    document.getElementById('app')
  )

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
