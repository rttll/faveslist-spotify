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

"use strict";


const {
  ipcRenderer,
  shell
} = __webpack_require__(/*! electron */ "electron");

const Spotify = __webpack_require__(/*! ./spotify */ "./src/spotify.js");

let authCode, state, tokens;

function buttonClicked() {
  const array = new Uint32Array(1);
  state = window.crypto.getRandomValues(array)[0].toString();
  Spotify.authorize(state);
}

ipcRenderer.on('authorized', (event, data) => {
  let params = new URLSearchParams(data.split('?').pop());
  authCode = params.get('code');

  if (params.get('state') !== state) {
    // todo generic error
    return false;
  }

  Spotify.getTokens(authCode).then(spotifyResponse => {
    if (spotifyResponse.status === 200) {
      tokens = spotifyResponse.data;
      localStorage.setItem('heartlist', JSON.stringify(tokens));
      document.getElementById('message').textContent = 'success!';
    } else {// todo generic error
    }
  }).catch(err => {
    debugger;
    console.log(err);
  });
});

function launchClicked() {
  ipcRenderer.send('launch-clicked');
}

document.getElementById('authorize').addEventListener('click', buttonClicked);
document.getElementById('launch').addEventListener('click', launchClicked);

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
const baseURL = 'https://accounts.spotify.com';
const authHeader = 'Basic ' + new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
axios.defaults.headers.common['Authorization'] = authHeader;
let tokens;

function getTokens(authCode) {
  let options = {
    method: 'POST',
    data: qs.stringify({
      'grant_type': 'authorization_code',
      'code': authCode,
      'redirect_uri': redirectUri
    }),
    url: baseURL + '/api/token'
  };
  return axios(options).then(resp => {
    tokens = resp.data;
    return resp;
  }).catch(err => {
    return err;
  });
}

function getUserAuth(state) {
  const scopes = ['user-read-currently-playing', 'user-read-playback-state', 'playlist-read-private', 'playlist-modify-private', 'playlist-read-collaborative', 'playlist-modify-public'];
  const options = {
    method: 'GET',
    data: qs.stringify({
      'client_id': process.env.CLIENT_ID,
      'response_type': 'code',
      'scope': scopes,
      'state': state,
      'redirect_uri': redirectUri
    }),
    responseType: 'document',
    url: baseURL + '/authorize'
  };
  shell.openExternal(`${options.url}?${options.data}`);
}

module.exports = {
  authorize: getUserAuth,
  getTokens: getTokens
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