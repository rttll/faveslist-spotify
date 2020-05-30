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

let mainWindow, authWindow, tray, trayImage, config;

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

app.on("ready", () => {
  
  setApplicationMenu();

  app.setAsDefaultProtocolClient('faveslist')
  app.requestSingleInstanceLock()

  config = require('./services/config')

  globalShortcut.register('CommandOrControl+Shift+K', () => {
    mainWindow.webContents.send('shortcut')
  })

  if (env.name === "development") {
    // config.openInEditor()
    // config.clear()
  }

  // Tray
  const trayImage = nativeImage.createFromPath(`${__dirname}/assets/images/trayTemplate.png`)

  tray = new Tray(trayImage)
  tray.on('click', function() {
    if (mainWindow !== undefined)
      toggleWindow()
  })

  authWindow = createWindow('auth', {
    backgroundColor: '#d2f1f4', // sea green
    width: 750,
    height: 620,
    center: true,
    transparent: true,
    resizable: env.name === "development",
    titleBarStyle: 'hidden',
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
    createMainWindow()
  } else {
    showUserAuthWindow()
  }

});

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 64,
    show: true,
    frame: false,
    transparent: true,
    resizable: env.name === "development",
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

  mainWindow.on('blur', () => {
    mainWindow.hide()
  })

  setMainWindowPosition()
    
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
    // authWindow.openDevTools({mode: 'detach'});
  }

  authWindow.show()

  authWindow.webContents.on('did-finish-load', () => {
    let store = config.store;
    let state = {
      authorize: Object.keys(store.tokens).length < 1,
      playlist: Object.keys(store.playlist).length < 1,
      done: true 
    }    
    authWindow.webContents.send('did-finish-load', state)
  })
  
}


app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+Shift+K')
})

app.on("window-all-closed", () => {
  app.quit();
});

app.on('open-url', function (event, url) {
  event.preventDefault()
  authWindow.webContents.send('authorized', url)
})

ipcMain.handle('getConfig', (e, key) => {
  if (key === undefined) {
    return config.store
  } else {
    return config.get(`${key}`)
  }
})

function updateConfig(arg) {
  let current = JSON.parse(
    JSON.stringify(config.get(arg.key))
  )
  if (Array.isArray(current)) {
    current.push(arg.value)
    config.set(arg.key, current)
  } else {
    config.set(arg.key, {...current, ...arg.value})
  }
  return config.store
}

function replaceConfig(arg) {
  config.set(arg.key, arg.value)
  return config.store
}

ipcMain.handle('replace-config', (e, arg) => {
  return replaceConfig(arg)
})

ipcMain.handle('update-config', (e, arg) => {
  return updateConfig(arg)
})

ipcMain.handle('get-setup-state', () => {
  let store = config.store;
  return {
    authorize: store.tokens.access_token,
    playist: store.playlist.id
  }
})

ipcMain.on('setup-complete', (e, key) => {
  authWindow.hide()
  createMainWindow()
})