'use strict'

const {app, BrowserWindow, Tray, nativeImage, ipcMain, globalShortcut, shell, protocol} = require('electron')
const path = require('path')
let tray, win, authWin, image

app.on('ready', () => {
  // let lockSingle = app.requestSingleInstanceLock() // fix the second instance issue. 
  let protocol = app.setAsDefaultProtocolClient('heartlist')
  if (protocol) init();
})

function init() {
  // Tray
  image = nativeImage.createFromPath(`${__dirname}/assets/images/heartlist-black.png`)
  image.setTemplateImage(true);
  tray = new Tray(image)
  tray.on('click', function() {
    toggleWindow()
  })

  // Main window
  win = new BrowserWindow({
    width: 350,
    height: 140,
    show: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadURL(`file://${__dirname}/index.html`)
  win.webContents.openDevTools({
    mode: 'detach'
  })
  win.on('blur', () => {
    // win.hide()
  })
  win.on('closed', () => {
    win = null
  })

  authWin = new BrowserWindow({
    width: 1300,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  authWin.on('blur', () => {
    // authWin.hide()
  })

  authWin.on('closed', () => {
    authWin = null
  })

}

const toggleWindow = () => {
  if (win.isVisible()) {
    win.hide()
  } else {
    // This will call getTrack()
    win.webContents.send('window-toggled', 'open')
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
}

function showUserAuthWindow() {
  authWin.loadURL(`file://${__dirname}/auth.html`)
  authWin.webContents.openDevTools()
  authWin.show()
}


// Listen for requests to open window
ipcMain.on('open-window', (event, arg) => {
  showWindow()
})

ipcMain.on('show-user-auth-window', () => {
  showUserAuthWindow()
})

ipcMain.on('launch-clicked', () => {
  authWin.close()
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // authWin.close()
  console.log('authorized')
  authWin.webContents.send('authorized', url)
})