import { h, Component } from 'preact'

export default function Image(props) {

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