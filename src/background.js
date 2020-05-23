// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu, BrowserWindow, Tray, nativeImage, ipcMain, globalShortcut, shell, protocol, ipcRenderer} from 'electron';
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import createWindow from "./helpers/window";


// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

let mainWindow, authWindow, tray, trayImages, config;

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

function setTrayImage(k) {
  tray.setImage(trayImages[k])
}

app.on("ready", () => {

  setApplicationMenu();

  app.setAsDefaultProtocolClient('heartlist')
  app.requestSingleInstanceLock()

  config = require('./services/config')

  globalShortcut.register('CommandOrControl+Shift+K', () => {
    setTrayImage('pending')
    mainWindow.webContents.send('shortcut')
  })

  if (env.name === "development") {
    // config.openInEditor()
    // config.clear()
  }

  // Tray
  trayImages = {
    base: nativeImage.createFromPath(`${__dirname}/static/heart.png`),
    pending: nativeImage.createFromPath(`${__dirname}/static/heart-pending.png`),
    success: nativeImage.createFromPath(`${__dirname}/static/heart-success.png`)
  }
  // trayImages.base.isMacTemplateImage = true
  // trayImages.pending.isMacTemplateImage = true
  // trayImages.success.isMacTemplateImage = true
  tray = new Tray(trayImages.base)
  tray.on('click', function() {
    toggleWindow()
  })

  createMainWindow()

  authWindow = createWindow('auth', {
    width: 1300,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  let store = config.store,
      access = store.tokens.access_token,
      refresh = store.tokens.refresh_token,
      userID = store.user.id,
      playlistID = store.playlist.id;

  if (access && refresh && userID && playlistID) {
    showMainWindow()
  } else {
    showUserAuthWindow()
  }
});


const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 350,
    // height: 130,
    height: 64,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );
    
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-init')
  })
  
  if (env.name === "development") {
    // mainWindow.openDevTools({mode: 'detach'});
  }

  setMainWindowPosition()
  showMainWindow()
    
}

const setMainWindowPosition = () => {
  const trayBounds = tray.getBounds()
  const bounds = mainWindow.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayBounds.x - bounds.width / 2)
    y = Math.round(trayBounds.y - trayBounds.height + 5)
  } else {
    x = Math.round(trayBounds.x - (trayBounds.width / 2) - (bounds.width / 2))
    y = Math.round(trayBounds.y - trayBounds.height * 10)
  }
  mainWindow.setPosition(x, y, false)
}

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    // This will call getTrack()
    mainWindow.webContents.send('window-toggled', 'open')
    showMainWindow()
  }
}

const showMainWindow = () => {
  mainWindow.show()
  mainWindow.focus()
}

const showUserAuthWindow = () => {
  authWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "auth.html"),
      protocol: "file:",
      slashes: true
    })
  );
  
  if (env.name === "development") {
    // authWindow.openDevTools()
    //{mode: 'detach'});
  }
  authWindow.show()
  authWindow.webContents.on('did-finish-load', () => {
    authWindow.webContents.send('did-finish-load')
  })
  
}

app.on('browser-window-blur', (e, win) => {
  if (env === 'production')
    win.hide()
})

app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+Shift+K')
})

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle('getConfig', (e, key) => {
  if (key === undefined) {
    return config.store
  } else {
    return config.get(`${key}`)
  }
})

ipcMain.handle('setConfig', (e, arg) => {
  let current = config.get(arg.key)
  config.set(arg.key, {...current, ...arg.value})
  return config.store
})

ipcMain.on('track-was-hearted', () => {
  setTrayImage('success')
  setTimeout(() => {
    setTrayImage('base')
  }, 2000);
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  authWindow.webContents.send('authorized', url)
})

app.on('second-instance', (event, argv, cwd) => {
  console.log('secon')
})