'use strict'

const {ipcRenderer, shell} = require('electron')
const jetpack = require("fs-jetpack");
const Spotify = require('spotify-web-api-node');
const S = new Spotify({redirectUri: 'heartlist://'});

const scopes = ['user-read-currently-playing', 'user-read-playback-state', 'playlist-read-private', 'playlist-modify-private', 'playlist-read-collaborative', 'playlist-modify-public'];
const button = document.getElementById('start-auth');

let state, playlist, playlistName, user, userId;

let secrets = jetpack.read('secrets.json', 'json');
S.setClientId(secrets['id']);
S.setClientSecret(secrets['secret']);

// Open browser to get authorization
function requestAuth() {
  // Generate random string for Spotify state
  let array = new Uint32Array(1);
  state = (window.crypto.getRandomValues(array)[0]).toString()

  // Open browser and request auth from user.
  shell.openExternal(S.createAuthorizeURL(scopes, state))
}

// Just authorized
ipcRenderer.on('authorized', (event, data) => {
  if (data.state === state) {
    userJustAuthorized(data.code)
  }
})


function userJustAuthorized(code) {
  S.authorizationCodeGrant(code).then(
    function(data) {
      S.setAccessToken(data.body['access_token']);
      localStorage.setItem('accessToken', data.body['access_token']);
      localStorage.setItem('access', Date.now());

      S.setRefreshToken(data.body['refresh_token']);
      localStorage.setItem('refreshToken', data.body['refresh_token']);

      setUser();
    },
    function(err) {
      console.error('userJustAuthorized', err)
    }
  );
}

// Sets user
function setUser() {
  S.getMe().then(
    function(data) {
      user = data.body.id;
      localStorage.setItem('user', data.body.id);
      ipcRenderer.send('initial-auth-complete');

    },
    function(err) {
      console.error('setUser', err)
    }
  );
}

button.addEventListener('click', requestAuth);