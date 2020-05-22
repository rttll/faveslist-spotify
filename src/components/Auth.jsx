import { h, render, Component, createRef } from 'preact';
import { ipcRenderer } from 'electron';

export default class App extends Component {

  state = {
    spotifyState: null,
    playlist: {
      name: null
    }
  }

  

  componentDidMount() {
    this.props.Spotify.init()
  }

  authorize = () => {
    const array = new Uint32Array(1);
    this.state.spotifyState = (window.crypto.getRandomValues(array)[0]).toString()
    this.props.Spotify.authorize(this.state.spotifyState)
  }

  spotifyWasAuthorized = (params) => {
    let authCode = params.get('code')
    if (params.get('state') !== this.state.spotifyState) {
      // todo generic error
      return false
    }
    this.props.Spotify.getTokens(authCode)
      .then( (tokens) => {
        this.props.Spotify.setTokens(tokens)
        ipcRenderer.invoke('setConfig', {key: 'tokens', value: tokens})
      }).then(() => {
        return this.props.Spotify.setUser()
      }).then((user) => {
        ipcRenderer.invoke('setConfig', {key: 'user', value: user})
        // document.getElementById('message').textContent = 'success!'
      }).catch((err) => {
        console.log(err)
      })
  }

  playlistInput = createRef();

  savePlaylist = async () => {
    let playlist = await this.props.Spotify.setPlaylist(this.playlistInput.current.value)
    ipcRenderer.invoke('setConfig', {key: 'playlist', value: playlist})
  }

  render() {
    return (
      <div class="p-4">
        <div class="">
          <button 
            onClick={this.authorize}
            class="p-2 border"
          >
            Authorize!
          </button>
          <br /> <br />
        </div>
        <input 
          type="text" 
          ref={this.playlistInput} 
          value={this.state.playlist.name}
          class="p-4 border rounded"
        />
        <button
          class="p-4 rounded border"
         onClick={this.savePlaylist}>Click</button>
      </div>
    );
  }
}