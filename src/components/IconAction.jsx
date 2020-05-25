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
        viewBox="0 0 825.73 755.65" 
        class="h-6 m-auto cursor-pointer"
        onClick={this.props.onClick} >
        <path
          fill={iconStyle().fill}
          stroke={iconStyle().stroke}
          d="M755.64,412.85c93.75-94.73,93.45-247.51-.9-341.86h0c-94.35-94.35-247.13-94.65-341.86-.9l0,0v0C318.12-23.66,165.34-23.36,71,71h0c-94.35,94.35-94.65,247.13-.9,341.86h0L412.86,755.65,754.74,413.78h0l.91-.92Z" 
        />
      </svg>
    </div>
  )

}
