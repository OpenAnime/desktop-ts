import {
  app,
  autoUpdater,
  BrowserWindow,
  dialog,
  nativeTheme,
  shell,
} from "electron";
import os from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import config from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;

export function createWindow() {
  const backgroundColor = nativeTheme.shouldUseDarkColors
    ? "#212121"
    : "#f2f2f2";
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: nativeTheme.shouldUseDarkColors ? "#fff" : "#000",
      height: 20,
    },

    trafficLightPosition: { x: 16, y: 16 },
    backgroundMaterial: "mica",
    backgroundColor: os.platform() === "linux" ? backgroundColor : undefined,
    vibrancy: "window",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      //contextIsolation: true,
    },
  });

  mainWindow.loadURL(config.Servers.App);

  let themeDialog: Promise<void | Electron.MessageBoxReturnValue> | undefined;

  nativeTheme.on("updated", () => {
    if (!themeDialog) {
      themeDialog = dialog
        .showMessageBox({
          type: "info",
          title: "Tema Değişikliği",
          message:
            "Görünüşe göre sistem temanızı değiştirdiniz. Uygulamanın düzgün görünmesi için lütfen uygulamayı yeniden başlatın.",
          buttons: ["Daha Sonra", "Şimdi Yeniden Başlat"],
        })
        .then((response) => {
          if (response.response === 1) {
            app.relaunch();
            app.quit();
          } else {
            return;
          }
          themeDialog = undefined;
        });
    }
  });

  //mainWindow.maximize();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (os.platform() === "linux") {
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow?.webContents.insertCSS(`
      .topbar > div.header-right {
      margin-right: 8rem !important;
      }
      `);
    });
  }

  autoUpdater.checkForUpdates();
}

export function hasMainWindow() {
  return mainWindow !== null;
}
