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
      let currentlyPlaying = await this.Spotify.currentlyPlaying()
      let stateString = JSON.stringify(this.state)
      let update = JSON.parse(stateString)
      update.loading = false
      if (currentlyPlaying.item) {
        update.hasTrack = true
        update.item = currentlyPlaying.item
      } else {
        update.item.name = 'No track playing'
      }
      await this.setState(update)
    } catch (error) {
      console.log(error)
    }
  }

  heartClicked = async function(e) {
    await this.hydrateTrack()
    if (this.state.hasTrack) {
      let method = this.state.hearted ? 'DELETE' : 'POST';
      try {
        await this.Spotify.addRemoveTrack(this.state.item.uri, method)
        this.setState({hearted: !this.state.hearted})
        return true
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
            <div class="w-full flex justify-between items-center">
              <div class="px-3 py-2">
                <div class="font-bold text-md truncate">
                  {this.trackName()}
                </div>
                <p class="text-gray-700 text-base">
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