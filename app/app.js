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

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed (from ./node_modules/babel-loader/lib/index.js):\nSyntaxError: /Users/adrian/Projects/faveslist/faveslist-spotify/src/app.js: Unexpected token (40:4)\n\n\u001b[0m \u001b[90m 38 | \u001b[39masync \u001b[36mfunction\u001b[39m init() {\u001b[0m\n\u001b[0m \u001b[90m 39 | \u001b[39m  render(\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 40 | \u001b[39m    \u001b[33m<\u001b[39m\u001b[33mApp\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m    | \u001b[39m    \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 41 | \u001b[39m    ipcRenderer\u001b[33m=\u001b[39m{ ipcRenderer }\u001b[0m\n\u001b[0m \u001b[90m 42 | \u001b[39m    \u001b[33mSpotify\u001b[39m\u001b[33m=\u001b[39m{ \u001b[33mSpotify\u001b[39m }\u001b[0m\n\u001b[0m \u001b[90m 43 | \u001b[39m    ref\u001b[33m=\u001b[39m{app \u001b[33m=>\u001b[39m \u001b[33mAppMethods\u001b[39m \u001b[33m=\u001b[39m app}\u001b[0m\n    at Parser._raise (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:742:17)\n    at Parser.raiseWithData (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:735:17)\n    at Parser.raise (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:729:17)\n    at Parser.unexpected (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:8779:16)\n    at Parser.parseExprAtom (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:10074:20)\n    at Parser.parseExprSubscripts (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:9624:23)\n    at Parser.parseMaybeUnary (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:9604:21)\n    at Parser.parseExprOps (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:9474:23)\n    at Parser.parseMaybeConditional (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:9447:23)\n    at Parser.parseMaybeAssign (/Users/adrian/Projects/faveslist/faveslist-spotify/node_modules/@babel/parser/lib/index.js:9402:21)");

/***/ })

/******/ });
//# sourceMappingURL=app.js.map