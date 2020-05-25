import { h, Component, createRef } from 'preact'
import IconAction from './IconAction.jsx'
import Image from './Image.jsx'

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
}

export default class App extends Component {
  
  constructor(props) {
    super(props)
    this.Spotify = props.Spotify
    this.ipcRenderer = props.ipcRenderer
    this.heartClicked = this.heartClicked.bind(this)
  }

  // {State.item} structure matches Spotify structure, for referenceability
  state = {
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
  }

  componentDidMount() {
    this.hydrateTrack()
    // setTimeout(() => {
    //   debugger
    // }, 1000);
  }

  async hydrateTrack() {
    try {
      let update;
      let current = JSON.parse(
        JSON.stringify(this.state)
      )
      current.loading = false
      let currentlyPlaying = await this.Spotify.currentlyPlaying()
      if (currentlyPlaying.item) {
        let hearts = await this.ipcRenderer.invoke('getConfig', 'hearts')
        update = {
          hearted: hearts.indexOf(currentlyPlaying.item.uri) > -1,
          hasTrack: true,
          item: currentlyPlaying.item
        }
      } else {
        update = current
        update.item.name = 'No track playing'
      }
      await this.setState({...current, ...update})
    } catch (error) {
      console.log(error)
    }
  }

  heartClicked = async function(e) {
    await this.hydrateTrack()
    if (this.state.hasTrack) {
      try {
        let added = await this.Spotify.addTrack(this.state.item.uri)
        if (added) {
          this.setState({hearted: true})
          return this.state.item
        } else {
          return false
        }
      } catch (error) {
        console.log(error)      
      }
    }
  }

  trackName() {
    return this.state.item.name
  }

  artists() {
    const artists = this.state.item.album.artists;
    if (artists.length > 0) {
      return artists.map(a => a.name).join(' & ')
    } else {
      return ''
    }
  }

  render() {
    return (
      <div class="max-w-sm rounded overflow-hidden shadow-lg flex" >
        <div class="bg-gray-200 flex-grow">
          <div class="flex">
            <Image state={this.state} />
            <div class="w-full grid grid-cols-12">
              <div class="col-span-10 pl-3 py-2">
                <div class="text-gray-800 font-bold text-md select-none truncate">
                  {this.trackName()}
                </div>
                <p class="text-gray-800 text-base select-none">
                  {this.artists()}
                </p>
              </div>
              <IconAction isHearted={this.state.hearted} onClick={this.heartClicked} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}