import { h, render, Component, createRef } from 'preact';

export default class App extends Component {

  state = {
    spotifyState: null,
    playlist: {
      name: 'foo'
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
      }).then(() => {
        return this.props.Spotify.setUser()
      }).then(() => {
        document.getElementById('message').textContent = 'success!'
      }).catch((err) => {
        console.log(err)
      })
  }

  playlistInput = createRef();

  savePlaylist = async () => {
    let playlist = await this.props.Spotify.setPlaylist(this.playlistInput.current.value)
    debugger
  }

  render() {
    return (
      <div class="">
        <div>
          <button onClick={this.authorize}>Authorize!</button>
          <br /> <br />
        </div>
        <input type="text" ref={this.playlistInput} value={this.state.playlist.name} />
        <button onClick={this.savePlaylist}>Click</button>
      </div>
    );
  }
}