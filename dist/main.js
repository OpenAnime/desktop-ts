import { app, BrowserWindow, ipcMain, shell, nativeTheme } from 'electron';
import settings from 'electron-settings';
import log from 'electron-log';
import os from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import { hashHWID } from './license.js';
import { setActivity } from './RPC.js';
import contextMenu from 'electron-context-menu';
// @ts-expect-error -> In vite there are no types for the following line. Electron forge error
import started from "electron-squirrel-startup";
if (started)
    app.quit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
log.initialize();
log.info("App started");
contextMenu({
    prepend: (defaultActions, parameters, browserWindow) => [
        {
            label: 'Rainbow',
            // Only show it when right-clicking images
            visible: parameters.mediaType === 'image'
        },
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
let mainWindow;
const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#ffffff',
            height: 20
        },
        webPreferences: {
            preload: join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            additionalArguments: [
                `--os=${JSON.stringify({
                    hwid: await hashHWID(),
                    key: await settings.get('key'),
                    platform: os.platform(),
                    release: os.release(),
                    type: os.type(),
                })}`,
            ],
        },
    });
    mainWindow.loadURL(config.Servers.App);
    mainWindow.maximize();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
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
ipcMain.on("theme.set", async (event, theme) => {
    nativeTheme.themeSource = theme;
    log.info("Theme set to:", theme);
});
