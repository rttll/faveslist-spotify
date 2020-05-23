import { h, render } from 'preact'

import "./stylesheets/app.css";
import App from './components/App.jsx'

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

const {ipcRenderer, shell} = require('electron')
const {globalShortcut} = require('electron').remote

const Spotify = require('./services/spotify.js')

let AppMethods;

ipcRenderer.on('app-init', () => {
  init()
})

ipcRenderer.on('window-toggled', (e, arg) => {
  if (arg === 'open') {
    AppMethods.hydrateTrack()
  }
})

ipcRenderer.on('shortcut', async () => {
  let liked = await AppMethods.heartClicked()
  if (liked) {
    ipcRenderer.send('track-was-hearted')
  }
})

async function init() {
  
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
