/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/auth.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/auth.js":
/*!*********************!*\
  !*** ./src/auth.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  ipcRenderer,
  shell
} = __webpack_require__(/*! electron */ "electron");

const Spotify = __webpack_require__(/*! ./spotify */ "./src/spotify.js");

let state, tokens;
Spotify.init();

function initAuthorization() {
  const array = new Uint32Array(1);
  state = window.crypto.getRandomValues(array)[0].toString();
  Spotify.authorize(state);
}

ipcRenderer.on('authorized', (event, data) => {
  console.log('autoh');
  let params = new URLSearchParams(data.split('?').pop());
  let authCode = params.get('code');

  if (params.get('state') !== state) {
    // todo generic error
    return false;
  }

  Spotify.getTokens(authCode).then(tokens => {
    debugger;
    Spotify.setTokens(tokens);
  }).then(() => {
    return Spotify.setUser();
  }).then(() => {
    document.getElementById('message').textContent = 'success!';
  }).catch(err => {
    console.log(err);
  });
});

function launchClicked() {
  ipcRenderer.send('launch-clicked');
}

async function savePlaylist() {
  let playlist = await Spotify.setPlaylist(document.getElementById('playlist-name').value);
}

document.getElementById('authorize').addEventListener('click', initAuthorization); // initAuthorization()

document.getElementById('launch').addEventListener('click', launchClicked);
document.getElementById('save-playlist-name').addEventListener('click', savePlaylist);

/***/ }),

/***/ "./src/spotify.js":
/*!************************!*\
  !*** ./src/spotify.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  ipcRenderer,
  shell
} = __webpack_require__(/*! electron */ "electron");

const qs = __webpack_require__(/*! qs */ "qs");

const axios = __webpack_require__(/*! axios */ "axios");

__webpack_require__(/*! dotenv */ "dotenv").config();

const redirectUri = 'heartlist://';
const authRequest = axios.create({
  baseURL: 'https://accounts.spotify.com/'
});
const authHeader = 'Basic ' + new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
authRequest.defaults.headers.common['Authorization'] = authHeader;
authRequest.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
const apiRequest = axios.create({
  baseURL: 'https://api.spotify.com/'
});
const config = {
  tokens: null,
  user: null,
  playlist: null
}; // axios.interceptors.request.use(function (config) {
//   debugger
//   return config
// }, function (error) {
//   // Do something with request error
//   return Promise.reject(error);
// });

let currentRequestOptions;

function api(options) {
  currentRequestOptions = options;
  if (options.method === undefined) options.method = 'GET';
  return apiRequest(options).then(resp => {
    if (resp.status >= 200 && resp.status < 300) {
      return resp;
    } else {
      console.log('err');
      return false;
    }
  }).catch(err => {
    let data = err.response.data;

    if (data.error) {
      var message = data.error.message;
      console.log('api err', message);
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
      debugger;
      authRequest(request).then(function (resp) {
        if (resp.status === 200) {
          module.exports.setTokens(resp.data);
          return apiRequest(currentRequestOptions);
        } else {// todo assume we lost user auth.
          // show auth / start screen
        }
      }).catch(err => {
        debugger;
      });
    }

    return err;
  });
}

module.exports = {
  init: () => {
    console.log(process.execPath);

    for (let k in config) {
      let stored = localStorage.getItem(k);

      if (stored !== null) {
        config[k] = JSON.parse(stored);
      }
    }

    if (config.tokens === null) {} else {
      module.exports.setTokens(config.tokens);
    }

    return config;
  },
  authorize: function (state) {
    const scope = ['user-read-currently-playing', 'user-read-playback-state', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-private', 'playlist-read-collaborative'].join(' ');
    const params = qs.stringify({
      'client_id': process.env.CLIENT_ID,
      'response_type': 'code',
      'scope': scope,
      'state': state,
      'redirect_uri': redirectUri
    });
    const url = authRequest.defaults.baseURL + 'authorize';
    shell.openExternal(`${url}?${params}`);
  },
  getTokens: async function (authCode) {
    let options = {
      method: 'POST',
      data: qs.stringify({
        'grant_type': 'authorization_code',
        'code': authCode,
        'redirect_uri': redirectUri
      }),
      url: 'api/token'
    };
    let request = await authRequest(options);
    debugger;
    return request.data;
  },
  setTokens: tokens => {
    config.tokens = { ...config.tokens,
      ...tokens
    };
    apiRequest.defaults.headers.common['Authorization'] = `Bearer ${config.tokens.access_token}`;
    localStorage.setItem('tokens', JSON.stringify(config.tokens));
  },
  setUser: async () => {
    let options = {
      url: 'v1/me'
    };
    let request = await api(options);
    config.user = request.data;
    localStorage.setItem('user', JSON.stringify(config.user));
    return config.user;
  },
  setPlaylist: async name => {
    if (name.length < 1) name = 'Heartlist';
    let options = {
      url: `users/${config.user.id}/playlists`,
      method: 'POST',
      data: {
        name: name,
        public: false
      }
    };
    let playlist = await api(options);
    config.playlist = playlist;
    localStorage.setItem('playlist', JSON.stringify(playlist));
    return playlist;
  },
  getPlaylistTracks: () => {
    let options = {
      url: `v1/playlists/${config.playlist.id}/tracks`
    };
    let tracks = api(optoins);
  },
  addTrack: uri => {
    let options = {
      url: `playlists/${config.playlist.id}/tracks`,
      method: 'POST',
      data: {
        uris: uri
      }
    };
    let track = api(options);
    return track;
  },
  player: async () => {
    let request = await api({
      url: 'v1/me/player'
    });
    return request.data;
  },
  currentlyPlaying: async () => {
    // apiRequest.defaults.headers.common['Authorization'] = `Bearer 1234`
    let request = await api({
      url: 'v1/me/player/currently-playing'
    });
    return request.data;
  }
};

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "qs":
/*!*********************!*\
  !*** external "qs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("qs");

/***/ })

/******/ });
//# sourceMappingURL=auth.js.map