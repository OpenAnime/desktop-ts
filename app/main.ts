import { app, BrowserWindow, ipcMain, shell, nativeTheme, autoUpdater, dialog } from 'electron';
import settings from 'electron-settings';
import log from 'electron-log'
import os from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import { hashHWID } from './license.js';
import { setActivity, startRPC, stopRPC } from './RPC.js';
import contextMenu from 'electron-context-menu';
// @ts-expect-error -> In vite there are no types for the following line. Electron forge error
import started from "electron-squirrel-startup";
import { Theme } from './types.js';
if (started) app.quit();

const updateURL = `${config.Servers.ReleaseServer}/update/${process.platform}/${app.getVersion()}`
autoUpdater.setFeedURL({ url: updateURL });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

log.initialize();
log.info("App started");

contextMenu({
    prepend: (defaultActions, parameters, browserWindow) => [
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            visible: parameters.selectionText.trim().length > 0,
            click: () => {
                shell.openExternal(`https://google.com/search?q=${encodeURIComponent(parameters.selectionText)}`);
            }
        }
    ]
});

let mainWindow: BrowserWindow | null;



const createWindow = async () => {
   const appObject = {
        version: app.getVersion(),
    }

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#ffffff',
            height: 20
        },
        //backgroundMaterial: 'mica',
        webPreferences: {
            preload: join(__dirname, 'preload.cjs'),
            //contextIsolation: true,
            additionalArguments: [
                `--os=${JSON.stringify({
                    hwid: await hashHWID(),
                    key: await settings.get('key'),
                    platform: os.platform(),
                    release: os.release(),
                    type: os.type(),
                })}`,
               `--app-info=${JSON.stringify(appObject)}`,
            ],
        },
    });

    mainWindow.loadURL(config.Servers.App);
    //mainWindow.maximize()
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    autoUpdater.checkForUpdates()
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on("key.set", async (event, value) => {
    console.log("New key:", value);
    await settings.set("key", value);
    app.relaunch();
    app.quit();
});
ipcMain.on("key.clear", async (event) => {
    await settings.unset("key");
    app.relaunch();
    app.quit();
});

ipcMain.on("rpc.update", async (event, activity) => {
    setActivity(activity);
});
ipcMain.on("rpc.start", async (event) => {
    startRPC();
});
ipcMain.on("rpc.stop", async (event) => {
    stopRPC();
});

ipcMain.on("theme.set", async (event, theme: Theme) => {
    nativeTheme.themeSource = theme;
    log.info("Theme set to:", theme);
});
autoUpdater.on('checking-for-update', () => {
    log.info("Checking for updates");
});
autoUpdater.on('update-available', () => {
    log.info("Update available");
});
autoUpdater.on('update-downloaded', () => {
    log.info("Update downloaded");
    dialog.showMessageBox({
        type: "info",
        title: "Yeni bir güncelleme mevcut",
        message: "Yeni bir güncelleme mevcut. Uygulamayı şimdi güncellemek istiyor musunuz?",
        buttons: ["Evet", "Daha sonra"],
        
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});
autoUpdater.on('update-not-available', () => {
    log.info("Update not available");
});
autoUpdater.on('error', (error) => {
    log.error("Error while checking for updates:", error);
});
