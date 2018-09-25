'use strict'

const {ipcRenderer, shell} = require('electron')
const jetpack = require("fs-jetpack");
const Spotify = require('spotify-web-api-node');
const S = new Spotify({redirectUri: 'heartlist://'});

let user = localStorage.getItem('user');
let playlistName;

S.setAccessToken(localStorage.getItem('accessToken'));
S.setRefreshToken(localStorage.getItem('refreshToken'));

/*
ipcRenderer.on('initial-auth-complete', (event, data) => {

}
*/

function createPlaylist() {
  S.createPlaylist(user, playlistName, {public: false}).then(
    function(data) {
      localStorage.setItem('playlistName', playlistName)
      localStorage.setItem('playlist', JSON.stringify(data.body))
      document.getElementById('saved').style.display = 'block';
      //ipcRenderer.send('settings-saved');

    }, function(err) {
      console.error(err)
    }
  );

}
document.getElementById('save-settings')
  .addEventListener('click', function() {
    playlistName = document.getElementById('playlist-name').value;
    if (playlistName.length > 0)
      createPlaylist();
})

document.getElementById('done')
  .addEventListener('click', function() {
    ipcRenderer.send('done-with-settings');
})