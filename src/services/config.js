const Store = require('electron-store');
const schema = {
  tokens: {
    type: 'object',
    default: {},
  },
  user: {
    type: 'object',
    default: {},
  },
  playlist: {
    type: 'object',
    default: {},
  },
  playing: {
    type: 'object',
    default: {},
  },
}

module.exports = new Store({schema});


