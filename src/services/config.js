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
  currentlyPlaying: {
    type: 'object',
    default: {},
  },
  hearts: {
    type: 'array',
    default: []
  }
}

module.exports = new Store({schema});


