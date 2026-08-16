const { contextBridge, ipcRenderer } = require("electron");

const initialData = ipcRenderer.sendSync("app.get-initial-info");

contextBridge.exposeInMainWorld("NativeApp", {
  fetchInfo: () => ({
    isNative: true,
    theme: initialData.theme,
    os: initialData.os,
    version: [
      { name: "Client", v: initialData.app.version },
      { name: "Electron", v: process.versions.electron },
      { name: "Node", v: process.versions.node },
      { name: "Chrome", v: process.versions.chrome },
      { name: "V8", v: process.versions.v8 },
    ],
  }),

  close: () => ipcRenderer.send("close"),
  // RPC is disabled for now; keep these methods for renderer compatibility.
  startRPC: () => {},
  stopRPC: () => {},
  updateRPC: () => {},
  setTheme: (theme) => ipcRenderer.send("theme.set", theme),
  clearKey: () => ipcRenderer.send("key.clear"),
  setKey: (value) => ipcRenderer.send("key.set", value),
});
