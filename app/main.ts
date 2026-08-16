import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  nativeTheme,
  autoUpdater,
  dialog,
  systemPreferences,
} from "electron";
import settings from "electron-settings";
import log from "electron-log";
import os from "os";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import config from "./config.js";
import { setActivity, startRPC, stopRPC } from "./RPC.js";
import contextMenu from "electron-context-menu";
// @ts-expect-error -> In vite there are no types for the following line. Electron forge error
import started from "electron-squirrel-startup";
import { Theme } from "./types.js";
if (started) app.quit();
import Color from "color";

const updateURL = `${config.Servers.ReleaseServer}/update/${
  process.platform
}/${app.getVersion()}`;
autoUpdater.setFeedURL({ url: updateURL });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

log.initialize();
log.info("App started");

let yok: BrowserWindow | null;

contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: "Search Google for “{selection}”",
      // Only show it when right-clicking text
      visible: parameters.selectionText.trim().length > 0,
      click: () => {
        shell.openExternal(
          `https://google.com/search?q=${encodeURIComponent(
            parameters.selectionText,
          )}`,
        );
      },
    },
    {
      label: "???",
      visible: parameters.selectionText.includes("uras"),
      click: () => {
        yok = new BrowserWindow({
          frame: false,
          fullscreen: true,
        });

        yok.loadFile(join(__dirname, "../assets/popup.html"));
        yok.setIgnoreMouseEvents(true);
        yok.setAlwaysOnTop(true, "screen-saver");
        yok.on("close", (e) => {
          e.preventDefault();
        });
      },
    },
  ],
});

let mainWindow: BrowserWindow | null;

app.commandLine.appendSwitch("force_high_performance_gpu", "1");

function generateWinUI3Palette(baseHex: string) {
  const base = Color(baseHex);
  const white = Color("#FFFFFF");
  const black = Color("#000000");

  return {
    accentDark3: base.mix(black, 0.65).hsl().array(),
    accentDark2: base.mix(black, 0.4).hsl().array(),
    accentDark1: base.mix(black, 0.2).hsl().array(),
    accentBase: base.hsl().array(),
    accentLight1: base.mix(white, 0.25).hsl().array(),
    accentLight2: base.mix(white, 0.5).hsl().array(),
    accentLight3: base.mix(white, 0.75).hsl().array(),
  };
}

async function getColors() {
  let baseHex = "#0078D4"; // Default Windows accent color
  const platform = os.platform();

  if (platform === "win32" || platform === "darwin") {
    try {
      const systemAccent = await systemPreferences.getAccentColor();
      if (systemAccent) {
        // systemPreferences returns 'RRGGBBAA' or 'RRGGBB'
        baseHex = `#${systemAccent.slice(0, 6)}`;
      }
    } catch (e) {
      console.warn("Failed to read system accent color:", e);
    }
  }

  return generateWinUI3Palette(baseHex);
}

const createWindow = async () => {
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
    backgroundColor: os.platform() === "linux" ? "#212121" : undefined,
    vibrancy: "window",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      //contextIsolation: true,
    },
  });

  mainWindow.loadURL(config.Servers.App);

  let themeDialog: any;

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
          themeDialog = null;
        });
    }
  });

  //mainWindow.maximize();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  autoUpdater.checkForUpdates();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("quit", () => {});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("app.get-initial-info", async (event) => {
  const colors = await getColors();
  const appObject = {
    version: app.getVersion(),
  };

  event.returnValue = {
    colors,
    os: {
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
    },
    app: appObject,
  };
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
autoUpdater.on("checking-for-update", () => {
  log.info("Checking for updates");
});
autoUpdater.on("update-available", () => {
  log.info("Update available");
});
autoUpdater.on("update-downloaded", () => {
  log.info("Update downloaded");
  dialog
    .showMessageBox({
      type: "info",
      title: "Yeni bir güncelleme mevcut",
      message:
        "Yeni bir güncelleme mevcut. Uygulamayı şimdi güncellemek istiyor musunuz?",
      buttons: ["Evet", "Daha sonra"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});
autoUpdater.on("update-not-available", () => {
  log.info("Update not available");
});
autoUpdater.on("error", (error) => {
  log.error("Error while checking for updates:", error);
});
