import { h, render, Component, createRef } from 'preact';
import { ipcRenderer } from 'electron';

export default class App extends Component {

  constructor(props) {
    super(props)
    let step;
    for (let k in props.setupState) {
      if (props.setupState[k]) {
        step = k;
        break;
      }
    }
    this.state = {
      spotifyState: null,
      step: step,
      playlist: {
        name: null
      }
    }
  }


  playlistInput = createRef();

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
        ipcRenderer.invoke('replace-config', {key: 'tokens', value: tokens})
      }).then(() => {
        return this.props.Spotify.setUser()
      }).then((user) => {
        ipcRenderer.invoke('replace-config', {key: 'user', value: user})
        this.setState({step: 'playlist'})
      }).catch((err) => {
        console.log(err)
      })
  }

  savePlaylist = async () => {
    let val = this.playlistInput.current.value.trim()
    if (val.length > 0) {
      let playlist = await this.props.Spotify.setPlaylist(val)
      ipcRenderer.invoke('replace-config', {key: 'playlist', value: playlist})
      this.setState({step: 'done'})
    }
  }

  done() {
    ipcRenderer.send('setup-complete')
  }

  getClass(step) {
    let klass = step === this.state.step ? 'active' : 'hidden'
    return klass
  }
  
  navState(step) {
    let klass = step === this.state.step ? 'bg-purple-900' : 'border border-purple-900'
    return klass
  }

  render() {
    return (
      <div class="flex flex-col justify-between h-screen pt-4">
        <div class="mx-auto max-w-sm my-4 text-center">
          <p class="uppercase">Heartlist</p>
        </div>
    
        <div class="p-4 flex flex-col justify-center rounded-sm w-screen mx-auto text-center flex-grow overflow-hidden">
          
          <div className={ '-mt-16 w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('authorize') }>
            <div>
            <h1 class="text-3xl">Connect to Spotify</h1>
            <p class="mb-6 text-base">Heartlist needs access to create and manage playlist on your Spotify account.</p>
            <button 
              class="bg-purple-600 text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
              onClick={this.authorize} >
              Authorize</button>

            </div>
          </div>
          
          <div className={ '-mt-16 w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('playlist') }>
            <div>
              <h1 class="text-3xl">Create Playlist</h1>
              <p class="mb-6 text-base">
                Heartlist keeps all your faves in a playlist on Spotify.
              </p>
              <div class="p-4">
                <input 
                  type="text" 
                  class="bg-gray-100 border rounded-sm block w-full p-4 outline-none focus:shadow-outline" 
                  placeholder="Faves"
                  ref={this.playlistInput} 
                  value={this.state.playlist.name} />
              </div>
              <button 
                class="bg-purple-600 text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
                onClick={this.savePlaylist} >
                Create Playlist
              </button>
            </div>
  
          </div>
  
          <div className={ '-mt-16 w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('done') }>
            <div>
              <h1 class="text-3xl">Done!</h1>
              <p class="mb-6 text-base">
                Check out more settings in 
                <a href="">Settings</a>
              </p>
              <button 
                class="bg-purple-600 text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
                onClick={this.done} >
                Open Faveslist
              </button>
            </div>
          </div>

        </div>
          
        <div class="mx-auto max-w-sm text-center">
          <nav class="flex space-x-1 my-8 mx-auto w-8">
            <div className={'h-2 w-2 rounded-full ' + this.navState('authorize') }></div>
            <div className={'h-2 w-2 rounded-full ' + this.navState('playlist') }></div>
            <div className={'h-2 w-2 rounded-full ' + this.navState('done') }></div>
          </nav>
        </div>

      </div>
           
      );
  }
}