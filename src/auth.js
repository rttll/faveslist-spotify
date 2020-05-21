const {ipcRenderer, shell} = require('electron')
const Spotify = require('./services/spotify')
import { h, render, Component, createRef } from 'preact';
import './stylesheets/app.css'
import Auth from './components/Auth'

let AuthMethods;

ipcRenderer.on('authorized', (event, data) => {
  let params = new URLSearchParams(data.split('?').pop())
  AuthMethods.spotifyWasAuthorized(params)
})

function launchClicked() {
  ipcRenderer.send('launch-clicked')
}

render(
  <Auth
    Spotify={Spotify}
    ref={app => AuthMethods = app} 
  />, 
    document.getElementById('app')
);