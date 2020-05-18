const {ipcRenderer, shell} = require('electron')
const qs = require('qs');
const axios = require('axios')
require('dotenv').config()

const redirectUri = 'heartlist://'

const authRequest = axios.create({
  baseURL: 'https://accounts.spotify.com/'
})

const authHeader = 'Basic ' + new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
authRequest.defaults.headers.common['Authorization'] = authHeader
authRequest.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

const apiRequest = axios.create({
  baseURL: 'https://api.spotify.com/'
})

const config = {
  tokens: null,
  user: null,
  playlist: null
}

  // axios.interceptors.request.use(function (config) {
  //   debugger
  //   return config
  // }, function (error) {
  //   // Do something with request error
  //   return Promise.reject(error);
  // });


let currentRequestOptions;
function api(options) {
  currentRequestOptions = options
  if (options.method === undefined) options.method = 'GET'
  return apiRequest(options).then((resp) => {
    if (resp.status >= 200 && resp.status < 300) {
      return resp
    } else {
      console.log('err')
      return false
    }
  }).catch((err) => {
    let data = err.response.data;
    if (data.error) {
      var message = data.error.message
      console.log('api err', message)
    }
    if (message === 'Invalid access token' || message === 'The access token expired') {
        let request = {
          method: 'POST', 
          data: qs.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': config.tokens.refresh_token
          }),
          url: 'api/token'
        };
        debugger
        authRequest(request).then(function(resp) {
          if (resp.status === 200) {
            module.exports.setTokens(resp.data)
            return apiRequest(currentRequestOptions)
          } else {
            // todo assume we lost user auth.
            // show auth / start screen
          }
        }).catch((err) => {
          debugger
        })
    }
    return err
  })

}

module.exports = {
  init: () => {
    console.log(process.execPath)
    for (let k in config) {
      let stored = localStorage.getItem(k)
      if (stored !== null) {
        config[k] = JSON.parse(stored)
      }
    }
    if (config.tokens === null) {
      
    } else {
      module.exports.setTokens(config.tokens)
    }
    return config
  },
  authorize: function (state) {
    const scope = [
      'user-read-currently-playing', 
      'user-read-playback-state', 
      'playlist-modify-private', 
      'playlist-modify-public', 
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ')
    const params = qs.stringify({
        'client_id': process.env.CLIENT_ID,
        'response_type': 'code',
        'scope': scope,
        'state': state,
        'redirect_uri': redirectUri
      })
    const url = authRequest.defaults.baseURL + 'authorize'
    shell.openExternal(`${url}?${params}`)
  },
  getTokens: async function(authCode) {
    let options = {
      method: 'POST', 
      data: qs.stringify({
        'grant_type': 'authorization_code',
        'code': authCode,
        'redirect_uri': redirectUri
      }),
      url: 'api/token'
    };
    let request = await authRequest(options)
    debugger
    return request.data
  },
  setTokens: (tokens) => {
    config.tokens = {...config.tokens, ...tokens}
    apiRequest.defaults.headers.common['Authorization'] = `Bearer ${config.tokens.access_token}`
    localStorage.setItem('tokens', JSON.stringify(config.tokens))
  },
  setUser: async () => {
    let options = {
      url: 'v1/me'
    }
    let request = await api(options)
    config.user = request.data
    localStorage.setItem('user', JSON.stringify(config.user))
    return config.user

  },
  setPlaylist: async (name) => {
    if (name.length < 1) name = 'Heartlist'
    let options = {
      url: `users/${config.user.id}/playlists`,
      method: 'POST',
      data: {
        name: name,
        public: false
      }
    }
    let playlist = await api(options)
    config.playlist = playlist
    localStorage.setItem('playlist', JSON.stringify(playlist))
    return playlist

  },
  getPlaylistTracks: () => {
    let options = {
      url: `v1/playlists/${config.playlist.id}/tracks`
    }
    let tracks = api(optoins)

  },
  addTrack: (uri) => {
    let options = {
      url: `playlists/${config.playlist.id}/tracks`,
      method: 'POST',
      data: {
        uris: uri
      }
    }
    let track = api(options)
    return track
  },
  player: async () => {
    let request = await api({url: 'v1/me/player'})
    return request.data
  },
  currentlyPlaying: async () => {
    // apiRequest.defaults.headers.common['Authorization'] = `Bearer 1234`
    let request = await api({url: 'v1/me/player/currently-playing'})
    return request.data    
  }
}



