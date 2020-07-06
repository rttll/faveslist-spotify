import { h, Component } from 'preact'

export default function IconAction(props) {

  const iconStyle = function() {
    let style = {
      fill: 'white',
      stroke: '#2d3748' // bg-gray-800
    }
    if (props.isHearted) {
      style = {
        fill: '#2d3748',
        stroke: '#2d3748'
      }
    }
    return style
  }

  return (
    <div class="col-span-2 h-full px-3 flex">
      <svg xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 14.49 13.78"
        class="h-6 m-auto cursor-pointer"
        onClick={this.props.onClick} >
        <polygon 
          fill={iconStyle().fill}
          stroke={iconStyle().stroke}
          points="7.25 0 9.48 4.54 14.49 5.26 10.87 8.8 11.72 13.78 7.25 11.43 2.77 13.78 3.62 8.8 0 5.26 5.01 4.54 7.25 0" />
      </svg>
      
    </div>
  )

}
