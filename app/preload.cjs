const { contextBridge, ipcRenderer } = require('electron');

const args = process.argv;
const colors = args.find((arg) => arg.startsWith("--colors"))?.slice(9) || '';
console.log(args)
const app = JSON.parse(args.find((arg) => arg.startsWith("--app-info"))?.slice(11) || '{}');
const os = JSON.parse(args.find((arg) => arg.startsWith("--os"))?.slice(5) || '{}');

const theme = colors ? JSON.parse(colors) : null;

contextBridge.exposeInMainWorld("NativeApp", {
    fetchInfo: () => {
        return {
            isNative: true,
            theme,
            os,
            version: [
                {
                    name: "Client",
                    v: app.version,
                },
                {
                    name: "Electron",
                    v: process.versions.electron,
                },
                {
                    name: "Node",
                    v: process.versions.node,
                },
                {
                    name: "Chrome",
                    v: process.versions.chrome,
                },
                {
                    name: "V8",
                    v: process.versions.v8,
                },
            ],
        };
    },

    close: () => ipcRenderer.send("close"),
    startRPC: () => ipcRenderer.send("rpc.start"),
    stopRPC: () => ipcRenderer.send("rpc.stop"),
    updateRPC: (data) => ipcRenderer.send("rpc.update", data),
    setTheme: (theme) => ipcRenderer.send("theme.set", theme),
    clearKey: () => ipcRenderer.send("key.clear"),
    setKey: (value) => ipcRenderer.send("key.set", value),
});