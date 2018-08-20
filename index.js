// TODO
// Check if need to refresh before getting track
// Parse accessSetAt as date
// Save action when getting track
// and only set user once, and not rely on it to continue
// with setting up playlist


'use strict'

const {ipcRenderer, shell} = require('electron')
const {globalShortcut} = require('electron').remote
const jetpack = require("fs-jetpack");
const Spotify = require('spotify-web-api-node');
const S = new Spotify({
  redirectUri: 'heartlist://'
});

// Feature
let playlistName = "Heartlist",
    playlist = null,
    track = null;

// Auth
let user = localStorage.getItem('user'),
    state = "",
    secrets = {},
    scopes = ['user-read-currently-playing', 'user-read-playback-state', 'playlist-read-private', 'playlist-modify-private', 'playlist-read-collaborative', 'playlist-modify-public'];

// Action in progress.
let gettingTrack = false,
    addingTrack = false;

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
  console.log(secrets)
  if (localStorage.getItem('refreshToken') != null) {
    refreshAccess();
  } else {
    requestAuth();
  }
}

function requestAuth() {
  // Make sure any old auth tokens are cleared
/*
  if (localStorage.getItem('refreshToken') != null) {
    localStorage.removeItem('refreshToken');
  }
*/
  // Generate random string for Spotify state
  var array = new Uint32Array(1);
  state = (window.crypto.getRandomValues(array)[0]).toString()

  // Open browser and request auth from user.
  shell.openExternal(S.createAuthorizeURL(scopes, state))
}

// Callback for ipcRenderer authorized listener
// This is only when user first opens app and authorizes
function userJustAuthorized(code) {
  S.authorizationCodeGrant(code).then(
    function(data) {
      setAccess({access: data.body['access_token'], refresh: data.body['refresh_token']})
    },
    function(err) {
      console.error('userJustAuthorized', err)
    }
  );
}

// Set access & refresh tokens.
function setAccess(data) {
  if (typeof data.access === 'string') {
    // Set access
    S.setAccessToken(data.access);
    // Save time set
    localStorage.setItem('access', Date.now())
  }
  if (typeof data.refresh === 'string') {
    console.log('setting refresh')
    // Set and save
    S.setRefreshToken(data.refesh);
    localStorage.setItem('refreshToken', data.refresh);
  }

  // On initial setup, set user
  // setUser() will then set playlist
  if (user === null) {
    setUser();
  } else {
    setPlaylist();
  }


  // Continue
  if (gettingTrack) {
    getTrack();
  }
}

function refreshAccess() {
  console.log('refreshAccess', localStorage)
  S.refreshAccessToken().then(
    function(data) {
      console.log('refreshed access', data)
      setAccess({access: data.body['access_token']});
    },
    function(err) {
      // If can't refresh, assume we lost authorization.
      console.error('refreshAccess', err);
      requestAuth();
    }
  );
}

// Called from main process after user authorizes
ipcRenderer.on('authorized', (event, data) => {
  if (data.state === state) {
    userJustAuthorized(data.code)
  }
})

// Sets user, then continues to playlist setup
function setUser() {
  S.getMe().then(
    function(data) {
      // Set user
      user = data.body.id
      // Save user for later use
      localStorage.setItem('user', data.body.id)
      // Continue to get Playlist
      setPlaylist();
    },
    function(err) {
      console.error('setUser', err)
      // Assume it expired and refresh it
      refreshAccess();
    }
  );
}

// Get playlist
function setPlaylist() {
  let attempts = 3;
  for (let i = 0; i < attempts; i++) {
    if (playlist !== null) {
      break;
    }
    S.getUserPlaylists(user, {limit: 50, offset: i*50}).then(
      function(data) {
        for (let item of data.body.items) {
          if (item.name === playlistName) {
            // Set playlist
            playlist = item;
            // Set the shortcut
            globalShortcut.register('CommandOrControl+Shift+K', () => {
              addTrack();
            })
            // Get updated tracks
            getUpdatedTracks();
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

// Get tracks from playlist
// For checking against current playing track
// to avoid adding dupes.
function getUpdatedTracks() {
  S.getPlaylistTracks(user, playlist.id).then(
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
    getTrack();
  }
})

// Get current playing track, then display
function getTrack() {
  // check if need to refresh
  let time = parseInt(localStorage.getItem('access'));
  if ( (time + (60*60*1000)) < Date.now() ) {
    console.log('getTrack, need to refresh')
    gettingTrack = true;
    refreshAccess();
  } else {
    S.getMyCurrentPlayingTrack(user)
    .then(
      function(data) {
        if (Object.keys(data.body).length === 0 && data.body.constructor === Object) {
          // no track playing
          //noTrackMsg.style.display = 'flex';
          trackName.textContent = "Silence..."
        } else {
          gettingTrack = false;
          let artists = []
          track = data.body.item
          for (var v of track.artists) {
            artists.push(v.name)
          }
          trackArtist.textContent = artists.join(', ')
          trackName.textContent = track.name
          trackImage.src = track.album.images[0].url
          addTrackTrigger.classList.add('ready')
          updateUI()
          if (addingTrack) {
            addTrack();
          }
        }
      },
      function(err) {
        console.error('getTrack', err)
      }
    )
  }
}

// Add/remove current playing track if it's not already in playlist
function addTrack() {
  // Always get track before adding
  if (!addingTrack) {
    addingTrack = true;
    getTrack()
  } else {
    let id = track.uri.split(':')[2];
    if (playlist.tracks.indexOf(id) < 0) {
      S.addTracksToPlaylist(user, playlist.id, [track.uri])
      .then(function(data) {
        addingTrack = false;
        playlist.tracks.push(id)
        updateUI()
      }, function(err) {
        console.error('addTrack', err)
      });
    }
  }
}

// Dom event listeners
addTrackTrigger.addEventListener('click', () => {
  addTrack()
})
