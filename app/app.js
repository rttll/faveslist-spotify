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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./config/env_development.json":
/*!*************************************!*\
  !*** ./config/env_development.json ***!
  \*************************************/
/*! exports provided: name, CLIENT_ID, CLIENT_SECRET, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"development\",\"CLIENT_ID\":\"888bc60b0f344bf7b76288346e535054\",\"CLIENT_SECRET\":\"599d82e255c649d4834ba8c22ad2766b\"}");

/***/ }),

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "preact");
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(preact__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _stylesheets_app_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stylesheets/app.css */ "./src/stylesheets/app.css");
/* harmony import */ var _components_App_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/App.jsx */ "./src/components/App.jsx");
/* harmony import */ var _helpers_context_menu_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers/context_menu.js */ "./src/helpers/context_menu.js");
/* harmony import */ var _helpers_external_links_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./helpers/external_links.js */ "./src/helpers/external_links.js");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_5__);


 // Small helpers you might want to keep





const {
  ipcRenderer,
  shell
} = __webpack_require__(/*! electron */ "electron");

const {
  globalShortcut
} = __webpack_require__(/*! electron */ "electron").remote;

const Spotify = __webpack_require__(/*! ./services/spotify.js */ "./src/services/spotify.js");

let AppMethods;
ipcRenderer.on('app-init', async () => {
  let response = await Spotify.getFaveslistTracks();
  let tracks = response.data.items.map(obj => obj.track.uri);
  ipcRenderer.invoke('replace-config', {
    key: 'hearts',
    value: tracks
  });
  init();
});
ipcRenderer.on('window-toggled', (e, arg) => {
  if (arg === 'open') {
    AppMethods.hydrateTrack();
  }
});
ipcRenderer.on('shortcut', async () => {
  let added = await AppMethods.heartClicked();

  if (added) {
    ipcRenderer.invoke('update-config', {
      key: 'hearts',
      value: added.uri
    });
  }
});

async function init() {
  Object(preact__WEBPACK_IMPORTED_MODULE_0__["render"])(Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_components_App_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], {
    ipcRenderer: ipcRenderer,
    Spotify: Spotify,
    ref: app => AppMethods = app
  }), document.getElementById('app'));
}
/* 

  inspect element 
  
  
  */


const {
  remote
} = __webpack_require__(/*! electron */ "electron");

const {
  Menu,
  MenuItem
} = remote;
let rightClickPosition;
const menu = new Menu();
menu.append(new MenuItem({
  label: 'Inspect Element',
  click: () => {
    remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y);
  }
}));
window.addEventListener('contextmenu', e => {
  e.preventDefault();
  rightClickPosition = {
    x: e.x,
    y: e.y
  };
  menu.popup(remote.getCurrentWindow());
}, false);

/***/ }),

/***/ "./src/components/App.jsx":
/*!********************************!*\
  !*** ./src/components/App.jsx ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return App; });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "preact");
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(preact__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _IconAction_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./IconAction.jsx */ "./src/components/IconAction.jsx");
/* harmony import */ var _Image_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Image.jsx */ "./src/components/Image.jsx");
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





const {
  remote
} = __webpack_require__(/*! electron */ "electron");

const {
  Menu,
  MenuItem
} = remote;
const schema = {
  loading: true,
  hasTrack: false,
  hearted: false,
  item: {
    album: {
      artists: [],
      images: []
    },
    name: 'Loading...'
  }
};
class App extends preact__WEBPACK_IMPORTED_MODULE_0__["Component"] {
  constructor(props) {
    super(props);

    _defineProperty(this, "state", {
      loading: true,
      hasTrack: false,
      hearted: false,
      item: {
        album: {
          artists: [],
          images: []
        },
        name: 'Loading...'
      }
    });

    _defineProperty(this, "heartClicked", async function (e) {
      await this.hydrateTrack();

      if (this.state.hasTrack) {
        try {
          let added = await this.Spotify.addTrack(this.state.item.uri);

          if (added) {
            this.setState({
              hearted: true
            });
            return this.state.item;
          } else {
            return false;
          }
        } catch (error) {
          console.log(error);
        }
      }
    });

    _defineProperty(this, "openAppMenu", e => {
      // let rightClickPosition = {x: e.x, y: e.y}
      this.menu.popup(remote.getCurrentWindow());
    });

    _defineProperty(this, "quitWasClicked", () => {
      this.ipcRenderer.send('quit-app');
    });

    this.Spotify = props.Spotify;
    this.ipcRenderer = props.ipcRenderer;
    this.heartClicked = this.heartClicked.bind(this);
    this.quitWasClicked = this.quitWasClicked.bind(this);
    const template = [{
      label: 'Quit',
      role: 'quit'
    }];
    this.menu = Menu.buildFromTemplate(template);
  } // {State.item} structure matches Spotify structure, for referenceability


  componentDidMount() {
    this.hydrateTrack();
  }

  async hydrateTrack() {
    try {
      let update;
      let current = JSON.parse(JSON.stringify(this.state));
      current.loading = false;
      let currentlyPlaying = await this.Spotify.currentlyPlaying();

      if (currentlyPlaying.item) {
        let hearts = await this.ipcRenderer.invoke('getConfig', 'hearts');
        update = {
          hearted: hearts.indexOf(currentlyPlaying.item.uri) > -1,
          hasTrack: true,
          item: currentlyPlaying.item
        };
      } else {
        update = current;
        update.item.name = 'No track playing';
      }

      await this.setState({ ...current,
        ...update
      });
    } catch (error) {
      console.log(error);
    }
  }

  trackName() {
    return this.state.item.name;
  }

  artists() {
    const artists = this.state.item.album.artists;

    if (artists.length > 0) {
      return artists.map(a => a.name).join(' & ');
    } else {
      return '';
    }
  }

  render() {
    return Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "w-full flex flex-col px-4 pt-4"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "max-w-sm rounded overflow-hidden shadow-lg flex"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "bg-gray-200 flex-grow"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "flex"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_Image_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], {
      state: this.state
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "w-full grid grid-cols-12"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "col-span-10 pl-3 py-2"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "text-gray-800 font-bold text-md select-none truncate"
    }, this.trackName()), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("p", {
      class: "text-gray-800 text-base select-none"
    }, this.artists())), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])(_IconAction_jsx__WEBPACK_IMPORTED_MODULE_1__["default"], {
      isHearted: this.state.hearted,
      onClick: this.heartClicked
    }))))), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "mt-4 -mx-4 border-t border-gray-400 flex"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "py-2 px-4 w-full flex items-center justify-between"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("svg", {
      style: "width:50px",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1546.58 270.85"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("g", {
      id: "Layer_2",
      "data-name": "Layer 2"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("g", {
      id: "main"
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M11.65,267.94H0V0H11.65Zm23.31,0H23.31V0H35Zm23.31,0H46.62V0H58.27ZM180.53,11.65H81.58V23.31h99V35H81.58V46.62h99V58.27H81.58V69.93h99V81.58H81.58V93.24h69.81v11.65H81.58v11.66h69.81V128.2H81.58v11.66h69.81v11.65H81.58v11.54h69.81V174.7H81.58v93.24H69.93V0h110.6Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M285.41,270.27c-62.7,0-113.63-50.23-113.63-113a113.63,113.63,0,0,1,227.26,0V267.94H387.39V157.22a102,102,0,0,0-204,0c0,56.29,45.69,101.51,102,101.51,2.91,0,5.83-.23,8.74-.46V246.73c-2.91.23-5.83.35-8.74.35-49.88,0-90.32-40-90.32-89.86a90.32,90.32,0,0,1,180.64,0V267.94H364.08V157.22a78.67,78.67,0,1,0-78.67,78.32c2.91,0,5.83-.23,8.74-.47V223.42a73.3,73.3,0,0,1-8.74.58,66.84,66.84,0,1,1,67-66.78V267.94H340.77V157.22a55.36,55.36,0,1,0-55.36,55.13,52.71,52.71,0,0,0,8.74-.7V199.88a42.94,42.94,0,0,1-8.74.93,43.59,43.59,0,1,1,43.71-43.59V267.94H317.46V157.22a32.05,32.05,0,1,0-32,32.05,31,31,0,0,0,8.74-1.28V175.64a20,20,0,0,1-8.74,2,20.4,20.4,0,1,1,20.39-20.4V267.94A88.39,88.39,0,0,1,285.41,270.27Zm8.74-113a8.74,8.74,0,1,0-17.48,0,8.74,8.74,0,1,0,17.48,0Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M390.29,46.62h12.35l61.77,221.32H452.17Zm24.59,0h12.24l61.76,221.32H476.65Zm24.47,0h12.24l61.77,221.32H501.12Zm24.48,0h12.23L538,267.94H525.71Zm160.37,0L562.43,267.94H550.19L488.3,46.62h12.24l6.76,24,6.64-24H526.3L513.36,92.54l6.18,21.91,19-67.83h12.24l-25.06,89.74,6.06,21.91L563,46.62h12.24L538,180.18l6.06,22L587.48,46.62h12.24l-49.53,177.5L556.25,246,612,46.62Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M691.66,163.05h145.1c-.23,4-.58,7.81-1.16,11.65H696.32a32.83,32.83,0,0,0,13.52,11.66H833.15c-1,4-2.33,7.81-3.73,11.65H739a44.14,44.14,0,0,1-15.62,2.92,43.65,43.65,0,1,1,0-87.3,44.82,44.82,0,0,1,15.27,2.8h22.14a55.31,55.31,0,1,0,.12,81.58l8.16,8.28a67,67,0,1,1,7.34-89.86h14.1a78.5,78.5,0,1,0-13.17,98.13l8.28,8.28a90.35,90.35,0,1,1,18.29-106.41h12.82A101.68,101.68,0,1,0,794,231l8,8.27a113,113,0,0,1-78.67,31.58c-62.82,0-113.75-50.81-113.75-113.51a113.69,113.69,0,0,1,223.54-29.26H710.07a32.35,32.35,0,0,0-13.63,11.66H835.6c.58,3.85.93,7.69,1.16,11.65h-145a25,25,0,0,0-.59,6A46,46,0,0,0,691.66,163.05Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M998,120.86v2H986.39v-2a65.56,65.56,0,1,0-65.5,65.5,7.29,7.29,0,0,1,0,14.57,7.06,7.06,0,0,1-6.06-3.15,79.52,79.52,0,0,1-12.82-2.1,18.94,18.94,0,1,0,18.88-21,53.85,53.85,0,1,1,53.85-53.84v2H963.08v-2a42.25,42.25,0,1,0-42.19,42.19,30.6,30.6,0,1,1-30.65,30.65v-2A77.17,77.17,0,1,1,998,120.86Zm0,72.84a77.15,77.15,0,1,1-154.3,0v-2h11.54v2a65.56,65.56,0,1,0,65.61-65.5,7.29,7.29,0,1,1,0-14.57,7,7,0,0,1,6,3.15,75.56,75.56,0,0,1,12.82,2.1,18.94,18.94,0,1,0-18.77,21,53.85,53.85,0,1,1-54,53.84v-2h11.66v2a42.25,42.25,0,1,0,42.3-42.31,30.54,30.54,0,1,1,30.54-30.53v2A77.2,77.2,0,0,1,998,193.7Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M1021.34,267.94h-11.65V0h11.65Zm23.31,0H1033V0h11.65Zm23.31,0H1056.3V0H1068Zm23.31,0h-11.66V0h11.66Zm23.31,0h-11.66V0h11.66Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M1235.07.12V11.77H1130.3V.12ZM1130.3,23.31h104.77V35H1130.3Zm104.77,244.63h-11.65V58.27h-11.65V267.94h-11.66V58.27h-11.54V267.94h-11.65V58.27h-11.66V267.94h-11.65V58.27H1142V267.94H1130.3V46.62h104.77Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M1401,120.86v2h-11.66v-2a65.56,65.56,0,1,0-65.5,65.5,7.29,7.29,0,0,1,0,14.57,7.07,7.07,0,0,1-6.06-3.15,79.52,79.52,0,0,1-12.82-2.1,18.94,18.94,0,1,0,18.88-21,53.85,53.85,0,1,1,53.85-53.84v2h-11.66v-2a42.25,42.25,0,1,0-42.19,42.19,30.6,30.6,0,1,1-30.65,30.65v-2A77.18,77.18,0,1,1,1401,120.86Zm0,72.84a77.16,77.16,0,0,1-154.31,0v-2h11.54v2a65.56,65.56,0,1,0,65.61-65.5,7.29,7.29,0,1,1,0-14.57,7,7,0,0,1,6,3.15,75.4,75.4,0,0,1,12.82,2.1,18.94,18.94,0,1,0-18.77,21,53.85,53.85,0,1,1-54,53.84v-2h11.66v2a42.25,42.25,0,1,0,42.3-42.31,30.54,30.54,0,1,1,30.54-30.53v2A77.21,77.21,0,0,1,1401,193.7Z",
      style: "fill:#ff9cd6"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("path", {
      d: "M1523.27,256.29h23.31v11.65h-23.31a110.64,110.64,0,0,1-110.6-110.72V0h11.65V157.22A99,99,0,0,0,1523.27,256.29Zm0-23.31h23.31v11.65h-23.31A87.34,87.34,0,0,1,1436,157.22V0h11.65V157.22A75.74,75.74,0,0,0,1523.27,233Zm0-23.31h23.31v11.65h-23.31a64,64,0,0,1-64-64.1V0h11.65V157.22A52.36,52.36,0,0,0,1523.27,209.67Zm0-23.31h23.31V198h-23.31a40.66,40.66,0,0,1-40.67-40.79V0h11.53V157.22A29.15,29.15,0,0,0,1523.27,186.36Zm-5.83-128.09V69.93h29.14V81.58h-29.14V93.24h29.14v11.65h-29.14v11.66h29.14V128.2h-29.14v11.66h29.14v11.65h-29.14v5.71a5.85,5.85,0,0,0,5.83,5.83h23.31V174.7h-23.31a17.52,17.52,0,0,1-17.48-17.48V0h11.65V46.62h29.14V58.27Z",
      style: "fill:#ff9cd6"
    })))), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "flex space-x-1",
      onClick: this.openAppMenu
    }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "w-1 h-1 bg-gray-700 rounded-full"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "w-1 h-1 bg-gray-700 rounded-full"
    }), Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      class: "w-1 h-1 bg-gray-700 rounded-full"
    })))));
  }

}

/***/ }),

/***/ "./src/components/IconAction.jsx":
/*!***************************************!*\
  !*** ./src/components/IconAction.jsx ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return IconAction; });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "preact");
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(preact__WEBPACK_IMPORTED_MODULE_0__);

function IconAction(props) {
  const iconStyle = function () {
    let style = {
      fill: 'white',
      stroke: '#2d3748' // bg-gray-800

    };

    if (props.isHearted) {
      style = {
        fill: '#2d3748',
        stroke: '#2d3748'
      };
    }

    return style;
  };

  return Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
    class: "col-span-2 h-full px-3 flex"
  }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 14.49 13.78",
    class: "h-6 m-auto cursor-pointer",
    onClick: this.props.onClick
  }, Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("polygon", {
    fill: iconStyle().fill,
    stroke: iconStyle().stroke,
    points: "7.25 0 9.48 4.54 14.49 5.26 10.87 8.8 11.72 13.78 7.25 11.43 2.77 13.78 3.62 8.8 0 5.26 5.01 4.54 7.25 0"
  })));
}

/***/ }),

/***/ "./src/components/Image.jsx":
/*!**********************************!*\
  !*** ./src/components/Image.jsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Image; });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "preact");
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(preact__WEBPACK_IMPORTED_MODULE_0__);

function Image(props) {
  const loadingImageStyles = {
    width: '64px',
    height: '64px'
  };
  const images = props.state.item.album.images;

  if (images.length > 0) {
    return Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("img", {
      src: images[images.length - 1]['url'],
      alt: "Track Image"
    });
  } else {
    return Object(preact__WEBPACK_IMPORTED_MODULE_0__["h"])("div", {
      style: loadingImageStyles,
      class: "bg-gray-100"
    });
  }
}

/***/ }),

/***/ "./src/helpers/context_menu.js":
/*!*************************************!*\
  !*** ./src/helpers/context_menu.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
// This gives you default context menu (cut, copy, paste)
// in all input fields and textareas across your app.

const Menu = electron__WEBPACK_IMPORTED_MODULE_0__["remote"].Menu;
const MenuItem = electron__WEBPACK_IMPORTED_MODULE_0__["remote"].MenuItem;

const isAnyTextSelected = () => {
  return window.getSelection().toString() !== "";
};

const cut = new MenuItem({
  label: "Cut",
  click: () => {
    document.execCommand("cut");
  }
});
const copy = new MenuItem({
  label: "Copy",
  click: () => {
    document.execCommand("copy");
  }
});
const paste = new MenuItem({
  label: "Paste",
  click: () => {
    document.execCommand("paste");
  }
});
const normalMenu = new Menu();
normalMenu.append(copy);
const textEditingMenu = new Menu();
textEditingMenu.append(cut);
textEditingMenu.append(copy);
textEditingMenu.append(paste);
document.addEventListener("contextmenu", event => {
  switch (event.target.nodeName) {
    case "TEXTAREA":
    case "INPUT":
      event.preventDefault();
      textEditingMenu.popup(electron__WEBPACK_IMPORTED_MODULE_0__["remote"].getCurrentWindow());
      break;

    default:
      if (isAnyTextSelected()) {
        event.preventDefault();
        normalMenu.popup(electron__WEBPACK_IMPORTED_MODULE_0__["remote"].getCurrentWindow());
      }

  }
}, false);

/***/ }),

/***/ "./src/helpers/external_links.js":
/*!***************************************!*\
  !*** ./src/helpers/external_links.js ***!
  \***************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
// Convenient way for opening links in external browser, not in the app.
// Useful especially if you have a lot of links to deal with.
//
// Usage:
//
// Every link with class ".js-external-link" will be opened in external browser.
// <a class="js-external-link" href="http://google.com">google</a>
//
// The same behaviour for many links can be achieved by adding
// this class to any parent tag of an anchor tag.
// <p class="js-external-link">
//    <a href="http://google.com">google</a>
//    <a href="http://bing.com">bing</a>
// </p>


const supportExternalLinks = event => {
  let href;
  let isExternal = false;

  const checkDomElement = element => {
    if (element.nodeName === "A") {
      href = element.getAttribute("href");
    }

    if (element.classList.contains("js-external-link")) {
      isExternal = true;
    }

    if (href && isExternal) {
      electron__WEBPACK_IMPORTED_MODULE_0__["shell"].openExternal(href);
      event.preventDefault();
    } else if (element.parentElement) {
      checkDomElement(element.parentElement);
    }
  };

  checkDomElement(event.target);
};

document.addEventListener("click", supportExternalLinks, false);

/***/ }),

/***/ "./src/services/spotify.js":
/*!*********************************!*\
  !*** ./src/services/spotify.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  ipcRenderer,
  shell
} = __webpack_require__(/*! electron */ "electron");

const qs = __webpack_require__(/*! qs */ "qs");

const axios = __webpack_require__(/*! axios */ "axios");

const env = __webpack_require__(/*! env */ "./config/env_development.json");

const redirectUri = 'faveslist://';
const appConfig = {
  playlist: null
};
let refreshToken;
const authRequest = axios.create({
  baseURL: 'https://accounts.spotify.com/'
});
const authHeader = 'Basic ' + new Buffer.from(env.CLIENT_ID + ':' + env.CLIENT_SECRET).toString('base64');
authRequest.defaults.headers.common['Authorization'] = authHeader;
authRequest.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
const apiRequest = axios.create({
  baseURL: 'https://api.spotify.com/v1/'
});
const simRequest = axios.create({
  baseURL: 'https://httpstat.us/'
});
simRequest.interceptors.response.use(function (config) {
  return config;
}, async function (error) {
  if (true) {
    let refresh = await simRequest({
      url: '200'
    });
    let original = axios.create({
      baseURL: error.config.baseURL
    });
    return await original({
      url: '200'
    });
  } else {}
});
apiRequest.interceptors.request.use(async function (config) {
  if (config.headers.common['Authorization'] === undefined) {
    let tokens = await module.exports.init();
    config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
  }

  return config;
}, function (error) {
  debugger;
  return Promise.reject(error);
});
apiRequest.interceptors.response.use(function (config) {
  // debugger
  return config;
}, async function (error) {
  if (error.response.data.error.status === 401) {
    let authOptions = {
      method: 'POST',
      data: qs.stringify({
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken
      }),
      url: 'api/token'
    };
    let refresh = await authRequest(authOptions);
    module.exports.setTokens(refresh.data);
    ipcRenderer.invoke('update-config', {
      key: 'tokens',
      value: refresh.data
    }); // Return/retry original

    return await apiRequest({
      url: error.config.url
    });
  } else {
    return error.response;
  }
});
let currentRequestOptions,
    currentRequestAttempts = 0;

async function api(options) {
  if (currentRequestAttempts > 1) {
    currentRequestAttempts = 0;
    throw new Error('unknown api error');
  } else {
    currentRequestAttempts++;
    currentRequestOptions = options;
  }

  if (options.method === undefined) options.method = 'GET';

  try {
    // debugger
    let request = await apiRequest(options);

    if (request.status >= 200 && request.status < 300) {
      currentRequestAttempts = 0;
      return request;
    } else {
      throw new Error('Uncaught error from Spotify');
    }
  } catch (error) {
    debugger;
  }
}

async function setConfig() {
  if (appConfig.playlist === null) {
    appConfig.playlist = await ipcRenderer.invoke('getConfig', 'playlist');
  }
}

async function trackAlreadyLiked(uri) {
  hearts = await ipcRenderer.invoke('getConfig', 'hearts');
  return hearts.indexOf(uri) > -1;
}

module.exports = {
  init: () => {
    return ipcRenderer.invoke('getConfig', 'tokens').then(tokens => {
      refreshToken = tokens.refresh_token;
      module.exports.setTokens(tokens);
      return tokens;
    }).catch(err => {});
  },
  authorize: function (state) {
    const scope = ['user-read-currently-playing', 'user-read-playback-state', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-private', 'playlist-read-collaborative'].join(' ');
    const params = qs.stringify({
      'client_id': env.CLIENT_ID,
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
    return request.data;
  },
  setTokens: tokens => {
    apiRequest.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
  },
  setUser: async () => {
    let options = {
      url: 'me'
    };
    let request = await api(options);
    return request.data;
  },
  setPlaylist: async name => {
    if (name.length < 1) name = 'Faveslist';
    let userID = await ipcRenderer.invoke('getConfig', 'user.id');
    let options = {
      url: `users/${userID}/playlists`,
      method: 'POST',
      data: {
        name: name,
        public: false
      }
    };
    let playlist = await api(options);
    return playlist.data;
  },
  getPlaylist: async id => {
    await setConfig();
    let options = {
      url: `playlists/${id}`
    };
    let request = await api(options);
    return request.data;
  },
  getPlaylists: async url => {
    if (url === undefined) {
      let userID = await ipcRenderer.invoke('getConfig', 'user.id');
      url = `users/${userID}/playlists`;
    }

    let options = {
      url: url,
      method: 'GET'
    };
    return await api(options);
  },
  getFaveslistTracks: async () => {
    await setConfig();
    let options = {
      url: `playlists/${appConfig.playlist.id}/tracks`
    };
    return await api(options);
  },
  addTrack: async trackURI => {
    if (await trackAlreadyLiked(trackURI)) {
      return false;
    }

    await setConfig();
    let options = {
      url: `playlists/${appConfig.playlist.id}/tracks`,
      method: 'POST',
      data: {
        uris: [trackURI]
      }
    };
    let request = await api(options);

    if (request.data.snapshot_id) {
      return true;
    } else {
      return false;
    }
  },
  player: async () => {
    let request = await api({
      url: 'me/player'
    });
    return request.data;
  },
  currentlyPlaying: async () => {
    // apiRequest.defaults.headers.common['Authorization'] = `Bearer 1234`
    let request = await api({
      url: 'me/player/currently-playing'
    });
    return request.data !== undefined ? request.data : request;
  }
};

/***/ }),

/***/ "./src/stylesheets/app.css":
/*!*********************************!*\
  !*** ./src/stylesheets/app.css ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "assets/css/app.css");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "preact":
/*!*************************!*\
  !*** external "preact" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("preact");

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
//# sourceMappingURL=app.js.map