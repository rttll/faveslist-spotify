import { h, Component } from 'preact'

export default function IconAction(props) {

  const iconStyle = function() {
    let style = {
      fill: 'white',
      stroke: 'black'
    }
    if (props.isHearted) {
      style = {
        fill: 'black',
        stroke: 'black'
      }
    }
    return style
  }

  return (
    <div class="h-full px-4 flex cursor-pointer hover:bg-gray-800" onClick={this.props.onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 825.73 755.65" class="h-6 m-auto">
        <path
          fill={iconStyle().fill}
          stroke={iconStyle().stroke}
          d="M755.64,412.85c93.75-94.73,93.45-247.51-.9-341.86h0c-94.35-94.35-247.13-94.65-341.86-.9l0,0v0C318.12-23.66,165.34-23.36,71,71h0c-94.35,94.35-94.65,247.13-.9,341.86h0L412.86,755.65,754.74,413.78h0l.91-.92Z" 
        />
      </svg>
    </div>
  )

}
