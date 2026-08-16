import { app, autoUpdater, dialog } from "electron";
import log from "electron-log";
import config from "./config.js";

export function configureUpdater() {
  const updateURL = `${config.Servers.ReleaseServer}/update/${
    process.platform
  }/${app.getVersion()}`;

  autoUpdater.setFeedURL({ url: updateURL });
}

export function registerUpdaterEvents() {
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
}
