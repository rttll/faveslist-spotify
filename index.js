'use strict'

const {ipcRenderer, shell} = require('electron')
const {globalShortcut} = require('electron').remote
const jetpack = require("fs-jetpack");
const Spotify = require('spotify-web-api-node');
const S = new Spotify({
  redirectUri: 'heartlist://'
});

let user = localStorage.getItem('user'),
    state = "",
    secrets = {},
    scopes = [
      'user-read-currently-playing',
      'user-read-playback-state',
      'user-library-read',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-private',
      'playlist-modify-public'
    ];

let playlistName = "Heartlist",
    playlist = null,
    track = null;

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
  if (localStorage.getItem('refreshToken') != null) {
    refreshAccess();
  } else {
    console.log('init - calling req auth')
    requestAuth();
  }
}

function requestAuth() {
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
    S.setAccessToken(data.access);
    // Save time set
    localStorage.setItem('access', Date.now())
  }
  if (typeof data.refresh === 'string') {
    // Set and save
    S.setRefreshToken(data.refesh);
    localStorage.setItem('refreshToken', data.refresh);
  }

  // On initial setup, set user, which will then set playlist
  if (user === null) {
    setUser();
  } else {
    setPlaylist();
  }

  // If getting a track was interrupted and we needed
  // to refresh access.
  if (gettingTrack) {
    getTrack();
  }

  // make playlist
  makePlaylist();

}

function refreshAccess() {
  S.setRefreshToken(localStorage.refreshToken);
  S.refreshAccessToken().then(
    function(data) {
      let params = {access: data.body['access_token']}
      // Docs said sometimes we'll get a new refresh token
      if (typeof data.body['refesh_token'] != 'undefined') {
        params['refresh'] = data.body['refesh_token']
      }
      setAccess(params)
    },
    function(err) {
      // If can't refresh, assume we lost authorization.
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

function updateHeartStatusInUI() {
  if (playlist.tracks.indexOf(track.id) > -1) {
    heart.classList.add('liked')
  } else {
    heart.classList.remove('liked')
  }

}

// Get track when window is opened.
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
    gettingTrack = true;
    refreshAccess();
  } else {
    S.getMyCurrentPlayingTrack(user)
    .then(
      function(data) {
        if (Object.keys(data.body).length === 0 && data.body.constructor === Object) {
          // TODO: better way to indicate error. UI is confusing
          trackName.textContent = "Silence..."
        } else {
          gettingTrack = false;
          track = data.body.item
          let artists = []
          for (var v of track.artists) {
            artists.push(v.name)
          }
          trackArtist.textContent = artists.join(', ')
          trackName.textContent = track.name
          trackImage.src = track.album.images[0].url
          addTrackTrigger.classList.add('ready')
          updateHeartStatusInUI()
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

// Add current playing track
function addTrack() {
  // Always get track before adding, to insure we heart actual current playing track.

  // addingTrack is always false at first
  if (!addingTrack) {
    // then we set it to true and get the track
    // getTrack() calls addTrack again
    // and then addingTrack is true, and all this gets skipped.
    addingTrack = true;
    getTrack()
  } else {
    let id = track.uri.split(':')[2];
    if (playlist.tracks.indexOf(id) < 0) {
      S.addTracksToPlaylist(user, playlist.id, [track.uri])
      .then(function(data) {
        addingTrack = false;
        playlist.tracks.push(id)
        updateHeartStatusInUI()
        // Send request to main process to open window
        ipcRenderer.send('open-window')
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

/*
  Playlist maker
*/

let library = [];
let c = 0;

function makePlaylist() {
  S.getMySavedTracks({
    limit : 20,
    offset: c*20
  })
  .then(function(data) {
    for (var i = 0; i < data.body.items.length; i++) {
      library.push(data.body.items[i].track.id)
    }
    if (c < 4) {
      console.log('Fetched ' + library.length + ' total tracks.')
      c++
      makePlaylist();
    } else {
      getTrackFeatures();
    }
  }, function(err) {
    console.log('Something went wrong!', err);
  });
}

let forNew = []

function getTrackFeatures() {
  console.log('getting features')
  S.getAudioFeaturesForTracks(library).then(
    function(data) {
      //console.log(data)
      for (var i = 0; i < data.body.audio_features.length; i++) {
        if (data.body.audio_features[i].acousticness > .9) {
          forNew.push(data.body.audio_features[i].uri)
        }
      }
      console.log('making playlist')
      S.createPlaylist(user, '100% Acoustic', { public : false }).then(
        function(data) {
          console.log('adding tracks')
          S.addTracksToPlaylist(user, data.body.id, forNew).then(
            function() {
              console.log('done!')
            }, function(err) {
              console.error(err)
            }
          )
        }, function(err) {
          console.error(err)
        }
      )
    }, function(err) {
      console.error(err)
    }
  )
/*
  for (var i = 0; i < library.length; i++) {
    if (i == 0) {
      S.getTrack(library[i]).then(
        function(data) {
          console.log(data)
        }, function() {

        }
      )
    }
  }
*/

}