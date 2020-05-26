import { h, render, Component, createRef } from 'preact';
import { ipcRenderer } from 'electron';
import '../stylesheets/loading.css'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.Spotify = this.props.Spotify
    this.ipcRenderer = this.props.ipcRenderer
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
      },
      playlistsContainerClass: 'hidden',
      playlistsLoadingClass: '',
      playlists: []
    }
  }

  playlistInput = createRef();

  componentDidMount() {
    this.Spotify.init()
  }

  authorize = () => {
    const array = new Uint32Array(1);
    this.state.spotifyState = (window.crypto.getRandomValues(array)[0]).toString()
    this.Spotify.authorize(this.state.spotifyState)
  }

  spotifyWasAuthorized = (params) => {
    let authCode = params.get('code')
    if (params.get('state') !== this.state.spotifyState) {
      // todo generic error
      return false
    }
    this.Spotify.getTokens(authCode)
      .then( (tokens) => {
        this.Spotify.setTokens(tokens)
        ipcRenderer.invoke('replace-config', {key: 'tokens', value: tokens})
      }).then(() => {
        return this.Spotify.setUser()
      }).then((user) => {
        ipcRenderer.invoke('replace-config', {key: 'user', value: user})
        this.setState({step: 'playlist'})
      }).catch((err) => {
        console.log(err)
      })
  }

  getPlaylists(resolve, reject, url = undefined) { 
    this.Spotify.getPlaylists(url).then(async (resp) => {
      var current = JSON.parse(
        JSON.stringify(this.state.playlists)
      )
      var userID = await ipcRenderer.invoke('getConfig', 'user.id')
      this.setState({
          playlists: current.concat( resp.data.items.filter(item => item.owner.id === userID) )
      })
      if (resp.data.items.length < 20) {
        resolve()
      } else {
        var url = resp.data.next
        this.getPlaylists(resolve, reject, url)        
      }
    }).catch((err) => {
      reject(err)
    })

  }

  showUserPlaylists = async () => {
    this.setState({playlistsContainerClass: ''})
    await this.setState({playlists: []})
    new Promise((resolve, reject) => {
      this.getPlaylists(resolve, reject)
    }).then(() => {
      this.setState({playlists: resp})
    }).catch((err) => {
      console.log(err)
    }) 
  }

  hideUserPlaylists = () => {
    this.setState({playlistsContainerClass: 'hidden'})
  }

  saveExisting = async (e) => {
    let playlist = await this.Spotify.getPlaylist(e.currentTarget.dataset.id)
    delete playlist.tracks
    ipcRenderer.invoke('replace-config', {key: 'playlist', value: playlist})
    this.setState({showPlaylists: false}, () => {
      this.setState({step: 'done'})
    })
  }

  savePlaylist = async () => {
    let val = this.playlistInput.current.value.trim()
    if (val.length > 0) {
      let playlist = await this.Spotify.setPlaylist(val)
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
        <div class="mx-auto max-w-sm text-center">
          <p class="uppercase">Heartlist</p>
        </div>
    
        <div class="relative p-4 flex flex-col justify-center rounded-sm w-screen mx-auto text-center flex-grow overflow-hidden">
          
          <div className={ ' w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('authorize') }>
            <div>
            <h1 class="text-3xl">Connect to Spotify</h1>
            <p class="mb-6 text-base">Heartlist needs access to create and manage playlist on your Spotify account.</p>
            <button
              class="bg-purple-600 text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
              onClick={this.authorize} >
              Authorize</button>

            </div>
          </div>
          
          <div className={ 'relative  w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('playlist') }>
            <div class="">
              <h1 class="text-3xl">Create Playlist</h1>
              <p class="mb-6 text-base">
                Heartlist keeps all your faves in a playlist on Spotify.
              </p>
              <div class="p-4">
                <input 
                  type="text" 
                  class="bg-gray-100 border rounded-sm block w-full p-4 outline-none focus:shadow-outline" 
                  placeholder="Enter playlist name"
                  ref={this.playlistInput} 
                  value={this.state.playlist.name} />
              </div>
              <button 
                class="bg-purple-600 text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
                onClick={this.savePlaylist} >
                Create Playlist
              </button>
              <p className="mt-2 text-sm">
                or&nbsp;
                <a href="#" onClick={this.showUserPlaylists} class="text-purple-400">choose from existing</a>
              </p>
            </div>

            <div className={`${this.state.playlistsContainerClass} absolute bg-gray-100 inset-x-0 bottom-0 top-0 flex flex-col transition-all ease-in duration-75 p-16`}>
              <div className="w-full flex flex-col items-left overflow-y-auto">
                <ul class="text-left flex-grow loading">
                  {this.state.playlists.map((p) => 
                    <li 
                      data-id={p.id} 
                      key={p.id}
                      class="cursor-pointer z-10 relative bg-gray-100 hover:text-purple-400"
                      onClick={this.saveExisting}
                    >
                      {p.name}
                    </li>
                  )}
                </ul>  
              </div>
              <a href="#" class="text-sm text-right block mt-2 text-purple-400" onClick={this.hideUserPlaylists}>Cancel</a>
            </div>

          </div>
  
          <div className={ ' w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('done') }>
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