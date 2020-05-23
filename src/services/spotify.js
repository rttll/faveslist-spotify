const {ipcRenderer, shell} = require('electron')
const qs = require('qs');
const axios = require('axios')

require('dotenv').config()

const redirectUri = 'heartlist://'
const appConfig = {
  playlist: null
}
let refreshToken;

const authRequest = axios.create({
  baseURL: 'https://accounts.spotify.com/'
})

const authHeader = 'Basic ' + new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
authRequest.defaults.headers.common['Authorization'] = authHeader
authRequest.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';

const apiRequest = axios.create({
  baseURL: 'https://api.spotify.com/v1/'
})

apiRequest.interceptors.request.use(async function (config) {
  
  if (config.headers.common['Authorization'] === undefined) {
    let tokens = await module.exports.init()
    config.headers['Authorization'] = `Bearer ${tokens.access_token}`
  }

  return config
}, function (error) {
  return Promise.reject(error);
});

// TODO: this needs to then resend the api request
apiRequest.interceptors.response.use(function(config) {
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
    ipcRenderer.invoke('updateConfig', {key: 'tokens', value: refresh.data})
    // TODO resend api request here
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

async function apiErrorHandler(err) {
  let data = {}
  let status = null;
  // The err response doesn't always have {data}
  // e.g. if the request completely fails

  if (err.response.data) data = err.response.data
  if (data.error) {
    status = data.error.status
  }

  if (status === 401) {
    let authOptions = {
      method: 'POST', 
      data: qs.stringify({
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken
      }),
      url: 'api/token'
    };
    return authRequest(authOptions).then(function(resp) {
      if (resp.status === 200) {
        module.exports.setTokens(resp.data)
        ipcRenderer.invoke('updateConfig', {key: 'tokens', value: resp.data})
        return resp.data
        // api(currentRequestOptions)
      } else {
        // todo assume we lost user auth.
        // show auth / start screen
      }
    }).catch((err) => {
      console.log('api err - could not refresh token?', err)
      return err
    })
  }  
}

async function setConfig() {
  if (appConfig.playlist === null) {
    appConfig.playlist = await ipcRenderer.invoke('getConfig', 'playlist')
  }
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
    if (name.length < 1) name = 'Heartlist'
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
  getHeartlistTracks: async () => {
    await setConfig()
    let options = {
      url: `playlists/${appConfig.playlist.id}/tracks`
    }
    return await api(options)
  },
  addRemoveTrack: async (trackURI, method) => {
    await setConfig()
    let options = {
      url: `playlists/${appConfig.playlist.id}/tracks`,
      method: method,
      data: {
        uris: [trackURI]
      }
    }
    return await api(options)
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



