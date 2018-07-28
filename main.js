'use strict'

const {app, BrowserWindow, Tray, nativeImage, ipcMain, globalShortcut, shell, protocol} = require('electron')
const path = require('path')
let tray
let win

//https://beta.developer.spotify.com/dashboard/applications/dfeed83a84d445d7b1a36ecc23eb5ac5
//https://www.spotify.com/us/account/apps/


app.on('ready', () => {
  init();
  app.setAsDefaultProtocolClient('metafy')
  //console.log('checking', app.isDefaultProtocolClient('metafy'))
})

// Protocol handler for osx
app.on('open-url', function (event, url) {
  event.preventDefault()
  win.webContents.send('authorized',
    {
      code: url.split('&')[0].split('=')[1],
      state: url.split('&')[1].split('=')[1]
    }
  )
})

function init() {
  // Tray
  image = nativeImage.createFromPath(`${__dirname}/assets/images/heart.png`)
  image.setTemplateImage(true);
  tray = new Tray(image)
  tray.on('click', function() {
    toggleWindow()
  })

  // Main window
  win = new BrowserWindow({
    width: 350,
    height: 140,
    show: false,
    frame: false,
    transparent: true
  })

  win.loadURL(`file://${__dirname}/index.html`)
  //win.webContents.openDevTools()
  win.on('blur', () => {
    win.hide()
  })
  win.on('closed', () => {
    win = null
  })
}
const toggleWindow = () => {
  if (win.isVisible()) {
    win.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const winPos = win.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (trayPos.width / 2) - 5)
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (winPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }

  win.setPosition(x, y, false)
  win.show()
  win.focus()
  win.webContents.send('window-toggled', 'open')
}


