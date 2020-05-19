// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu, BrowserWindow, Tray, nativeImage, ipcMain, globalShortcut, shell, protocol} from 'electron';
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import createWindow from "./helpers/window";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

let mainWindow, authWindow, tray, image;

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    // This will call getTrack()
    mainWindow.webContents.send('window-toggled', 'open')
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const winPos = mainWindow.getBounds()
  let x, y = 0
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (trayPos.width / 2) - 5)
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (winPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }

  mainWindow.setPosition(x, y, false)
  mainWindow.show()
  mainWindow.focus()
}

if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

app.on("ready", () => {

  setApplicationMenu();

  app.setAsDefaultProtocolClient('heartlist')

  // Tray
  image = nativeImage.createFromPath(`${__dirname}/heart.png`)
  image.isMacTemplateImage = true
  tray = new Tray(image)
  tray.on('click', function() {
    toggleWindow()
  })

  mainWindow = createWindow("main", {
    width: 350,
    height: 140,
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

  if (env.name === "development") {
    // mainWindow.openDevTools({mode: 'detach'});
  }

  authWindow = createWindow('auth', {
    width: 1300,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  showUserAuthWindow()

});

app.on("window-all-closed", () => {
  app.quit();
});


function showUserAuthWindow() {
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
}


// Listen for requests to open window
ipcMain.on('open-window', (event, arg) => {
  showWindow()
})

ipcMain.on('show-user-auth-window', () => {
  console.log('hh')
  showUserAuthWindow()
})

ipcMain.on('launch-clicked', () => {
  authWindow.close()
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // authWin.close()
  console.log('authorized')
  authWindow.webContents.send('authorized', url)
})

app.on('second-instance', (event, argv, cwd) => {
  console.log('secon')
})