'use strict'

const {app, BrowserWindow, Tray, nativeImage, ipcMain, globalShortcut, shell, protocol} = require('electron')
const path = require('path')
let tray, win, authWin, settingsWin, image

app.on('ready', () => {
  init();
  app.setAsDefaultProtocolClient('heartlist')
  //console.log('checking', app.isDefaultProtocolClient('heartlist'))
})

// After authorized
app.on('open-url', function (event, url) {
  event.preventDefault()
  authWin.webContents.send('authorized',
    {
      code: url.split('&')[0].split('=')[1],
      state: url.split('&')[1].split('=')[1]
    }
  )
})

function init() {
  // Tray
  image = nativeImage.createFromPath(`${__dirname}/assets/images/heartlist-black.png`)
  image.setTemplateImage(true);
  tray = new Tray(image)
  tray.on('click', function() {
    toggleWindow()
  })

  // Auth win
  authWin = new BrowserWindow({
    width: 300,
    height: 450,
    show: false
  })

  authWin.loadURL(`file://${__dirname}/auth.html`)
  authWin.on('blur', () => {
    authWin.hide()
  })
  authWin.on('closed', () => {
    authWin = null
  })

  // Settings window
  settingsWin = new BrowserWindow({
    width: 300,
    height: 450,
    show: false
  })

  settingsWin.loadURL(`file://${__dirname}/settings.html`)
  settingsWin.on('blur', () => {
    settingsWin.hide()
  })
  settingsWin.on('closed', () => {
    settingsWin = null
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

// Listen for requests to open window
ipcMain.on('open-window', (event, arg) => {
  toggleWindow()
})

// Called from auth window, need to
ipcMain.on('request-auth', (event, arg) => {
  authWin.show()
  authWin.focus()
  //authWin.webContents.openDevTools()
})

// Auth complete
ipcMain.on('initial-auth-complete', (event, arg) => {
  settingsWin.show()
  settingsWin.focus()
  settingsWin.webContents.send('initial-auth-complete');
})

// Settings saved
ipcMain.on('done-with-settings', (e, arg) => {
  settingsWin.hide()
  win.webContents.send('done-with-settings', 'open')
})
