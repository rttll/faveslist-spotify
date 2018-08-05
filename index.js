'use strict'

const {ipcRenderer, shell} = require('electron')
const {globalShortcut} = require('electron').remote
const jetpack = require("fs-jetpack");
const Spotify = require('spotify-web-api-node');
const S = new Spotify({
  redirectUri: 'heartlist://'
});

let playlist = null,
    playlistName = "Heartlist",
    track, user, state, secrets,
    scopes = ['user-read-currently-playing', 'user-read-playback-state', 'playlist-read-private', 'playlist-modify-private', 'playlist-read-collaborative', 'playlist-modify-public'];

let localAccessToken = localStorage.getItem('accessToken'),
    localRefreshToken = localStorage.getItem('refreshToken');

// DOM
const wrapper = document.getElementById('ui');
const noTrackMsg = document.getElementById('no-track');
const addTrackTrigger = document.getElementById('add-track')
const heart = document.getElementById('heart-container')
const trackName = document.getElementById('track-name')
const trackArtist = document.getElementById('track-artist')
const trackImage = document.getElementById('track-image')

// Init
init()

// Sets client secret & ID
// Checks if we have access or begin process
function init() {
  secrets = jetpack.read('secrets.json', 'json');
  S.setClientId(secrets['id']);
  S.setClientSecret(secrets['secret']);
  if (localAccessToken !== null && localRefreshToken !== null) {
    setAccess()
  } else {
    requestAuth();
  }
}

function requestAuth() {

  // Make sure any old auth tokens are cleared
  if (localAccessToken || localRefreshToken) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Generate random string for Spotify state
  var array = new Uint32Array(1);
  state = (window.crypto.getRandomValues(array)[0]).toString()

  // Generate auth url
  let authURL = S.createAuthorizeURL(scopes, state)
  if (!authURL.indexOf('client_id') > -1) {
    authURL += "&client_id=" + secrets['id']
  }
  shell.openExternal(authURL)
}

// Callback for ipcRenderer authorized listener
// This is only when user first opens app and authorizes
function userJustAuthorized(code) {
  S.authorizationCodeGrant(code).then(
    function(data) {
      localStorage.setItem('accessToken', data.body['access_token'])
      localStorage.setItem('refreshToken', data.body['refresh_token'])
      setAccess()
    },
    function(err) {
      console.error('userJustAuthorized', err)
    }
  );
}

// Set access & refresh tokens
// Called either from init() or from userJustAuthorized()
function setAccess() {
  S.setAccessToken(localStorage.getItem('accessToken'));
  S.setRefreshToken(localStorage.getItem('refreshToken'));
  setUser()
}

// Called from main process after user authorizes
ipcRenderer.on('authorized', (event, data) => {
  if (data.state === state) {
    userJustAuthorized(data.code)
  }
})


// Sets user, then continues to playlist setup
function setUser() {
  // Always request user, as a way to check if access token needs to be refreshed
  S.getMe().then(
    function(data) {
      user = data.body.id
      document.getElementById('user-name').textContent = data.body.display_name
      document.getElementById('user-image').setAttribute('src', data.body.images[0].url)
      getPlaylists()
    },
    function(err) {
      console.error('setUser', err)
      // Assume it expired and refresh it
      S.refreshAccessToken().then(
        function(data) {
          S.setAccessToken(data.body['access_token']);
          localStorage.setItem('accessToken', data.body['access_token'])
          // still need to set user
          setUser()
        },
        function(err) {
          console.error('refreshAccess', err);
          requestAuth();
        }
      );
    }
  );
}

// Get playlist
function getPlaylists() {
  let attempts = 3;
  for (let i = 0; i < attempts; i++) {
    if (playlist !== null) {
      break;
    }
    S.getUserPlaylists(user, {limit: 50, offset: i*50}).then(
      function(data) {
        for (let item of data.body.items) {
          if (item.name === playlistName) {
            playlist = item;
            globalShortcut.register('CommandOrControl+Shift+K', () => {
              getTrack(true);
            })
            S.getPlaylistTracks(user, item.id).then(
              function(data) {
                playlist.tracks = [];
                for (var v of data.body.items) {
                  playlist.tracks.push(v.track.id)
                }
                showUI()
              },
              function(err) {
                console.error('getPlaylistTracks', err)
              }
            )
            break;
          }
        }
      },
      function(err) {
        if (err.message === "Unauthorized")
          shell.openExternal('https://beta.developer.spotify.com/console/get-current-user-playlists/')
      }
    )
  }

}

// Show UI when app is ready
function showUI() {
  document.getElementsByTagName('body')[0].classList.add('ui-ready')
}

function updateUI() {
  if (playlist.tracks.indexOf(track.id) > -1) {
    heart.classList.add('liked')
  } else {
    heart.classList.remove('liked')
  }

}

// Called from main process when window toggled
ipcRenderer.on('window-toggled', (event, data) => {
  if (data === 'open') {
    getTrack(false)
  }
})

// Get current playing track, then display
function getTrack(add) {
  S.getMyCurrentPlayingTrack(user)
  .then(
    function(data) {
      if (Object.keys(data.body).length === 0 && data.body.constructor === Object) {
        // no track playing
        //noTrackMsg.style.display = 'flex';
        trackName.textContent = "Silence..."
      } else {
        //noTrackMsg.style.display = 'none';

        let artists = []
        track = data.body.item
        for (var v of track.artists) {
          artists.push(v.name)
        }
        trackArtist.textContent = artists.join(', ')
        trackName.textContent = track.name
        trackImage.src = track.album.images[0].url
        addTrackTrigger.classList.add('ready')
        if (add) {
          addTrack()
        } else {
          updateUI()
        }
      }
    },
    function(err) {
      console.error('getTrack', err)
    }
  )
}

// Add/remove current playing track if it's not already in playlist
function addTrack() {
  let uri = track.uri
  let id = uri.split(':')[2]
  let i = playlist.tracks.indexOf(id)
  if (i < 0) {
    S.addTracksToPlaylist(user, playlist.id, [uri])
      .then(function(data) {
        playlist.tracks.push(id)
        updateUI()
      }, function(err) {
        console.error('addTrack', err)
      });
  } else {
    S.removeTracksFromPlaylist(user, playlist.id, [uri])
      .then(function(data) {
        playlist.tracks.splice(i, 1)
        updateUI()
      }, function(err) {
        console.error('removeTracks', err)
      }
    )
  }
}

// Dom event listeners
addTrackTrigger.addEventListener('click', () => {
  addTrack()
})
