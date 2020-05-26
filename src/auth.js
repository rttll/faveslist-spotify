const {ipcRenderer, shell} = require('electron')
const Spotify = require('./services/spotify')
import { h, render, Component, createRef } from 'preact';
import './stylesheets/app.css'
import Auth from './components/Auth.jsx'

let AuthMethods;

ipcRenderer.on('authorized', (event, data) => {
  let params = new URLSearchParams(data.split('?').pop())
  AuthMethods.spotifyWasAuthorized(params)
})


ipcRenderer.on('did-finish-load', (e, state) => {
  loadApp(state)
})

function launchClicked() {
  ipcRenderer.send('launch-clicked')
}

function loadApp(state) {
  render(
    <Auth
      ipcRenderer={ipcRenderer}
      setupState={state}
      Spotify={Spotify}
      ref={app => AuthMethods = app} 
    />, 
      document.getElementById('app')

  );
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
 