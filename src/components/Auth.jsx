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
    let klass = step === this.state.step ? 'bg-gray-900' : 'border border-gray-900'
    return klass
  }

  render() {
    return (
      <div class="flex flex-col justify-between h-screen pt-4">
        <div class="mx-auto max-w-sm text-center py-2">
          <svg style="width:100px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1546.58 270.85"><g id="Layer_2" data-name="Layer 2"><g id="main"><path d="M11.65,267.94H0V0H11.65Zm23.31,0H23.31V0H35Zm23.31,0H46.62V0H58.27ZM180.53,11.65H81.58V23.31h99V35H81.58V46.62h99V58.27H81.58V69.93h99V81.58H81.58V93.24h69.81v11.65H81.58v11.66h69.81V128.2H81.58v11.66h69.81v11.65H81.58v11.54h69.81V174.7H81.58v93.24H69.93V0h110.6Z" style="fill:#ff9cd6"/><path d="M285.41,270.27c-62.7,0-113.63-50.23-113.63-113a113.63,113.63,0,0,1,227.26,0V267.94H387.39V157.22a102,102,0,0,0-204,0c0,56.29,45.69,101.51,102,101.51,2.91,0,5.83-.23,8.74-.46V246.73c-2.91.23-5.83.35-8.74.35-49.88,0-90.32-40-90.32-89.86a90.32,90.32,0,0,1,180.64,0V267.94H364.08V157.22a78.67,78.67,0,1,0-78.67,78.32c2.91,0,5.83-.23,8.74-.47V223.42a73.3,73.3,0,0,1-8.74.58,66.84,66.84,0,1,1,67-66.78V267.94H340.77V157.22a55.36,55.36,0,1,0-55.36,55.13,52.71,52.71,0,0,0,8.74-.7V199.88a42.94,42.94,0,0,1-8.74.93,43.59,43.59,0,1,1,43.71-43.59V267.94H317.46V157.22a32.05,32.05,0,1,0-32,32.05,31,31,0,0,0,8.74-1.28V175.64a20,20,0,0,1-8.74,2,20.4,20.4,0,1,1,20.39-20.4V267.94A88.39,88.39,0,0,1,285.41,270.27Zm8.74-113a8.74,8.74,0,1,0-17.48,0,8.74,8.74,0,1,0,17.48,0Z" style="fill:#ff9cd6"/><path d="M390.29,46.62h12.35l61.77,221.32H452.17Zm24.59,0h12.24l61.76,221.32H476.65Zm24.47,0h12.24l61.77,221.32H501.12Zm24.48,0h12.23L538,267.94H525.71Zm160.37,0L562.43,267.94H550.19L488.3,46.62h12.24l6.76,24,6.64-24H526.3L513.36,92.54l6.18,21.91,19-67.83h12.24l-25.06,89.74,6.06,21.91L563,46.62h12.24L538,180.18l6.06,22L587.48,46.62h12.24l-49.53,177.5L556.25,246,612,46.62Z" style="fill:#ff9cd6"/><path d="M691.66,163.05h145.1c-.23,4-.58,7.81-1.16,11.65H696.32a32.83,32.83,0,0,0,13.52,11.66H833.15c-1,4-2.33,7.81-3.73,11.65H739a44.14,44.14,0,0,1-15.62,2.92,43.65,43.65,0,1,1,0-87.3,44.82,44.82,0,0,1,15.27,2.8h22.14a55.31,55.31,0,1,0,.12,81.58l8.16,8.28a67,67,0,1,1,7.34-89.86h14.1a78.5,78.5,0,1,0-13.17,98.13l8.28,8.28a90.35,90.35,0,1,1,18.29-106.41h12.82A101.68,101.68,0,1,0,794,231l8,8.27a113,113,0,0,1-78.67,31.58c-62.82,0-113.75-50.81-113.75-113.51a113.69,113.69,0,0,1,223.54-29.26H710.07a32.35,32.35,0,0,0-13.63,11.66H835.6c.58,3.85.93,7.69,1.16,11.65h-145a25,25,0,0,0-.59,6A46,46,0,0,0,691.66,163.05Z" style="fill:#ff9cd6"/><path d="M998,120.86v2H986.39v-2a65.56,65.56,0,1,0-65.5,65.5,7.29,7.29,0,0,1,0,14.57,7.06,7.06,0,0,1-6.06-3.15,79.52,79.52,0,0,1-12.82-2.1,18.94,18.94,0,1,0,18.88-21,53.85,53.85,0,1,1,53.85-53.84v2H963.08v-2a42.25,42.25,0,1,0-42.19,42.19,30.6,30.6,0,1,1-30.65,30.65v-2A77.17,77.17,0,1,1,998,120.86Zm0,72.84a77.15,77.15,0,1,1-154.3,0v-2h11.54v2a65.56,65.56,0,1,0,65.61-65.5,7.29,7.29,0,1,1,0-14.57,7,7,0,0,1,6,3.15,75.56,75.56,0,0,1,12.82,2.1,18.94,18.94,0,1,0-18.77,21,53.85,53.85,0,1,1-54,53.84v-2h11.66v2a42.25,42.25,0,1,0,42.3-42.31,30.54,30.54,0,1,1,30.54-30.53v2A77.2,77.2,0,0,1,998,193.7Z" style="fill:#ff9cd6"/><path d="M1021.34,267.94h-11.65V0h11.65Zm23.31,0H1033V0h11.65Zm23.31,0H1056.3V0H1068Zm23.31,0h-11.66V0h11.66Zm23.31,0h-11.66V0h11.66Z" style="fill:#ff9cd6"/><path d="M1235.07.12V11.77H1130.3V.12ZM1130.3,23.31h104.77V35H1130.3Zm104.77,244.63h-11.65V58.27h-11.65V267.94h-11.66V58.27h-11.54V267.94h-11.65V58.27h-11.66V267.94h-11.65V58.27H1142V267.94H1130.3V46.62h104.77Z" style="fill:#ff9cd6"/><path d="M1401,120.86v2h-11.66v-2a65.56,65.56,0,1,0-65.5,65.5,7.29,7.29,0,0,1,0,14.57,7.07,7.07,0,0,1-6.06-3.15,79.52,79.52,0,0,1-12.82-2.1,18.94,18.94,0,1,0,18.88-21,53.85,53.85,0,1,1,53.85-53.84v2h-11.66v-2a42.25,42.25,0,1,0-42.19,42.19,30.6,30.6,0,1,1-30.65,30.65v-2A77.18,77.18,0,1,1,1401,120.86Zm0,72.84a77.16,77.16,0,0,1-154.31,0v-2h11.54v2a65.56,65.56,0,1,0,65.61-65.5,7.29,7.29,0,1,1,0-14.57,7,7,0,0,1,6,3.15,75.4,75.4,0,0,1,12.82,2.1,18.94,18.94,0,1,0-18.77,21,53.85,53.85,0,1,1-54,53.84v-2h11.66v2a42.25,42.25,0,1,0,42.3-42.31,30.54,30.54,0,1,1,30.54-30.53v2A77.21,77.21,0,0,1,1401,193.7Z" style="fill:#ff9cd6"/><path d="M1523.27,256.29h23.31v11.65h-23.31a110.64,110.64,0,0,1-110.6-110.72V0h11.65V157.22A99,99,0,0,0,1523.27,256.29Zm0-23.31h23.31v11.65h-23.31A87.34,87.34,0,0,1,1436,157.22V0h11.65V157.22A75.74,75.74,0,0,0,1523.27,233Zm0-23.31h23.31v11.65h-23.31a64,64,0,0,1-64-64.1V0h11.65V157.22A52.36,52.36,0,0,0,1523.27,209.67Zm0-23.31h23.31V198h-23.31a40.66,40.66,0,0,1-40.67-40.79V0h11.53V157.22A29.15,29.15,0,0,0,1523.27,186.36Zm-5.83-128.09V69.93h29.14V81.58h-29.14V93.24h29.14v11.65h-29.14v11.66h29.14V128.2h-29.14v11.66h29.14v11.65h-29.14v5.71a5.85,5.85,0,0,0,5.83,5.83h23.31V174.7h-23.31a17.52,17.52,0,0,1-17.48-17.48V0h11.65V46.62h29.14V58.27Z" style="fill:#ff9cd6"/></g></g></svg>
        </div>
    
        <div class="relative p-4 flex flex-col justify-center rounded-sm w-screen mx-auto text-center flex-grow overflow-hidden">
          
          <div className={ ' w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('authorize') }>
            <div>
            <h1 class="text-3xl">Connect to Spotify</h1>
            <p class="mb-6 text-base">Faveslist needs access to create and manage playlist on your Spotify account.</p>
            <button
              class="bg-hotpink text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
              onClick={this.authorize} >
              Authorize</button>

            </div>
          </div>
          
          <div className={ 'relative  w-2/3 px-16 flex flex-col justify-center mx-auto bg-gray-100 shadow-lg flex-grow h-full ' + this.getClass('playlist') }>
            <div class="">
              <h1 class="text-3xl">Create Playlist</h1>
              <p class="mb-6 text-sm">
                Faveslist keeps all your faves in a playlist on Spotify.
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
                class="bg-hotpink text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
                onClick={this.savePlaylist} >
                Create Playlist
              </button>
              <p className="mt-2 text-sm">
                or&nbsp;
                <a href="#" onClick={this.showUserPlaylists} class="text-hotpink">choose from existing</a>
              </p>
            </div>

            <div className={`${this.state.playlistsContainerClass} absolute bg-gray-100 inset-x-0 bottom-0 top-0 flex flex-col transition-all ease-in duration-75 p-16`}>
              <div className="w-full flex flex-col items-left overflow-y-auto">
                <ul class="text-left flex-grow loading">
                  {this.state.playlists.map((p) => 
                    <li 
                      data-id={p.id} 
                      key={p.id}
                      class="cursor-pointer z-10 relative bg-gray-100 hover:text-green-400"
                      onClick={this.saveExisting}
                    >
                      {p.name}
                    </li>
                  )}
                </ul>  
              </div>
              <a href="#" class="text-sm text-right block mt-2 text-hotpink" onClick={this.hideUserPlaylists}>Cancel</a>
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
                class="bg-hotpink text-white p-4 px-16 border rounded-full outline-none focus:shadow-outline"
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