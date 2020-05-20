const {ipcRenderer, shell} = require('electron')
const Spotify = require('./spotify')

// todo handle security
import './stylesheets/app.css'

import { h, render } from 'preact';
import App from './components/App'

let appComponent, state, tokens;

Spotify.init()

ipcRenderer.on('authorized', (event, data) => {
  let params = new URLSearchParams(data.split('?').pop())
  appComponent.spotifyWasAuthorized(params)
})


function launchClicked() {
  ipcRenderer.send('launch-clicked')
}

render(
  <App 
    Spotify={Spotify} 
    ref={app => appComponent = app} 
  />, 
    document.getElementById('app')
);
