import { app, ipcMain, nativeTheme } from "electron";
import log from "electron-log";
import os from "os";
import { getColors } from "./colors.js";
import { setActivity, startRPC, stopRPC } from "./RPC.js";
import { Theme } from "./types.js";

export function registerIpcHandlers() {
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

  ipcMain.on("rpc.update", async (_event, activity) => {
    setActivity(activity);
  });

  ipcMain.on("rpc.start", async () => {
    startRPC();
  });

  ipcMain.on("rpc.stop", async () => {
    stopRPC();
  });

  ipcMain.on("theme.set", async (_event, theme: Theme) => {
    nativeTheme.themeSource = theme;
    log.info("Theme set to:", theme);
  });
}
