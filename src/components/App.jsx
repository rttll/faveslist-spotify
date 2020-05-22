import { h, Component, createRef } from 'preact'

function Image(props) {

  const loadingImageStyles = {
    width: '64px',
    height: '64px',
  }
  const images = props.state.item.album.images
  if (images.length > 0) {
    return (
      <img src={images[images.length-1]['url']} alt="Track Image" />
    )
  } else {
    return <div style={loadingImageStyles} class="bg-gray-100"></div>
  }
}

export default class App extends Component {
  constructor(props) {
    super(props)
    this.Spotify = props.Spotify
  }

  // {State.item} structure matches Spotify structure, for referenceability
  state = {
    loading: true,
    hasTrack: false,
    heart: false,
    item: {
      album: {
        artists: [],
        images: []
      },
      name: 'Loading...'
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.hydrateTrack()
      // debugger
    }, 1000);
  }

  hydrateTrack() {
    this.Spotify.currentlyPlaying().then((data) => {

      let stateString = JSON.stringify(this.state)
      let update = JSON.parse(stateString)
      update.loading = false
      if (data.item) {
        update.hasTrack = true
        update.item = data.item
      } else {
        update.item.name = 'No track playing'
      }
      this.setState(update, () => {
        console.log(this.state)
      })  
    }).catch((err) => {
      console.error('App.jsx ', err)
    })
  }

  appClass() {
    return ''
  }

  isHearted() {

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
      <div class="max-w-sm rounded overflow-hidden shadow-lg flex" className={this.appClass()}>
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
              {/* <IconAction /> */}
              <div class="h-full px-4 flex cursor-pointer hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 825.73 755.65" class="h-6 m-auto">
                  <g id="heart" data-name="Layer 2"><g id="main">
                    <path d="M755.64,412.85c93.75-94.73,93.45-247.51-.9-341.86h0c-94.35-94.35-247.13-94.65-341.86-.9l0,0v0C318.12-23.66,165.34-23.36,71,71h0c-94.35,94.35-94.65,247.13-.9,341.86h0L412.86,755.65,754.74,413.78h0l.91-.92Z" 
                    style="fill:#0d0709"/></g></g></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}