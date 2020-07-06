const {ipcRenderer, shell} = require('electron')
const qs = require('qs');
const axios = require('axios')
const env = require("env");

const redirectUri = 'faveslist://'
const appConfig = {
  playlist: null
}
let refreshToken;

const authRequest = axios.create({
  baseURL: 'https://accounts.spotify.com/'
})

const authHeader = 'Basic ' + new Buffer.from(env.CLIENT_ID + ':' + env.CLIENT_SECRET).toString('base64');
authRequest.defaults.headers.common['Authorization'] = authHeader
authRequest.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

const apiRequest = axios.create({
  baseURL: 'https://api.spotify.com/v1/'
})

const simRequest = axios.create({
  baseURL: 'https://httpstat.us/'
})

simRequest.interceptors.response.use(function(config) {
  return config
}, async function(error) {
  if (true) {
    let refresh = await simRequest({url: '200'})
    let original = axios.create({
      baseURL: error.config.baseURL
    })
    return await original({url: '200'})
  } else {
    return error.response
  }
})

apiRequest.interceptors.request.use(async function (config) {
  if (config.headers.common['Authorization'] === undefined) {
    let tokens = await module.exports.init()
    config.headers['Authorization'] = `Bearer ${tokens.access_token}`
  }
  return config
}, function (error) {
  debugger
  return Promise.reject(error);
});

apiRequest.interceptors.response.use(function(config) {
  // debugger
  return config
}, async function(error) {
  if (error.response.data.error.status === 401) {
    let authOptions = {
      method: 'POST', 
      data: qs.stringify({
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken
      }),
      url: 'api/token'
    };
    let refresh = await authRequest(authOptions)
    module.exports.setTokens(refresh.data)
    ipcRenderer.invoke('update-config', {key: 'tokens', value: refresh.data})
    // Return/retry original
    return await apiRequest({url: error.config.url})
  } else {
    return error.response
  }
})

let currentRequestOptions, currentRequestAttempts = 0;

async function api(options) {
  if (currentRequestAttempts > 1) {
    currentRequestAttempts = 0;
    throw new Error('unknown api error')
  } else {
    currentRequestAttempts++
    currentRequestOptions = options
  }

  if (options.method === undefined) options.method = 'GET'

  try {
    // debugger
    let request = await apiRequest(options)
    if (request.status >= 200 && request.status < 300) {
      currentRequestAttempts = 0
      return request
    } else {
      throw new Error('Uncaught error from Spotify')
    }
  } catch (error) {
    debugger
  }

}

async function setConfig() {
  if (appConfig.playlist === null) {
    appConfig.playlist = await ipcRenderer.invoke('getConfig', 'playlist')
  }
}

async function trackAlreadyLiked(uri) {
  hearts = await ipcRenderer.invoke('getConfig', 'hearts')
  return hearts.indexOf(uri) > -1
}


module.exports = {
  init: () => {
    return ipcRenderer.invoke('getConfig', 'tokens').then((tokens) => {
      refreshToken = tokens.refresh_token;
      module.exports.setTokens(tokens)
      return tokens
    }).catch((err) => {
    })
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
        'client_id': env.CLIENT_ID,
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
    return request.data
  },
  setTokens: (tokens) => {
    apiRequest.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`
  },
  setUser: async () => {
    let options = {
      url: 'me'
    }
    let request = await api(options)
    return request.data

  },
  setPlaylist: async (name) => {
    if (name.length < 1) name = 'Faveslist'
    let userID = await ipcRenderer.invoke('getConfig', 'user.id')
    let options = {
      url: `users/${userID}/playlists`,
      method: 'POST',
      data: {
        name: name,
        public: false
      }
    }
    let playlist = await api(options)
    return playlist.data
    
  },
  getPlaylist: async (id) => {
    await setConfig()
    let options = {
      url: `playlists/${id}`
    }
    let request = await api(options)
    return request.data
  },
  getPlaylists: async (url) => {
    if (url === undefined) {
      let userID = await ipcRenderer.invoke('getConfig', 'user.id')
      url = `users/${userID}/playlists`
    }
    let options = {
      url: url,
      method: 'GET'
    }
    return await api(options)
  },
  getFaveslistTracks: async () => {
    await setConfig()
    let options = {
      url: `playlists/${appConfig.playlist.id}/tracks`
    }
    return await api(options)
  },
  addTrack: async (trackURI) => {
    if ( await trackAlreadyLiked(trackURI) ) {
      return false
    }
    await setConfig()
    let options = {
      url: `playlists/${appConfig.playlist.id}/tracks`,
      method: 'POST',
      data: {
        uris: [trackURI]
      }
    }
    let request = await api(options)
    if (request.data.snapshot_id) {
      return true
    } else {
      return false
    }
  },
  player: async () => {
    let request = await api({url: 'me/player'})
    return request.data
  },
  currentlyPlaying: async () => {
    // apiRequest.defaults.headers.common['Authorization'] = `Bearer 1234`
    let request = await api({url: 'me/player/currently-playing'})
    return request.data !== undefined ? request.data : request
  }
}



