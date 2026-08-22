import { app } from "electron";
import log from "electron-log";
// @ts-expect-error -> In vite there are no types for the following line. Electron forge error
import started from "electron-squirrel-startup";
import os from "os";
import { registerContextMenu } from "./context-menu.js";
import { registerIpcHandlers } from "./ipc.js";
import { configureUpdater, registerUpdaterEvents } from "./updater.js";
import { createWindow, hasMainWindow } from "./window.js";

if (os.platform() === "linux") {
  app.commandLine.appendSwitch("ozone-platform", "x11");
  app.commandLine.appendSwitch("use-vulkan");
  app.commandLine.appendSwitch("enable-features", "Vulkan");
} else {
  app.commandLine.appendSwitch("force_high_performance_gpu", "1");
  app.commandLine.appendSwitch("enable-features", "Vulkan,D3D12,Metal,WebGPU");
  app.commandLine.appendSwitch("use-vulkan");
}
app.commandLine.appendSwitch("enable-unsafe-webgpu", "1");
if (started) app.quit();

log.initialize();
log.info("App started");

configureUpdater();
registerContextMenu();
registerIpcHandlers();
registerUpdaterEvents();

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {});

app.on("activate", () => {
  if (!hasMainWindow()) {
    createWindow();
  }
});
