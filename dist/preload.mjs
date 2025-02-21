var _a, _b, _c;
import { contextBridge, ipcRenderer } from 'electron';
const args = process.argv;
const colors = ((_a = args.find((arg) => arg.startsWith("--colors"))) === null || _a === void 0 ? void 0 : _a.slice(9)) || '';
const release = JSON.parse(((_b = args.find((arg) => arg.startsWith("--release"))) === null || _b === void 0 ? void 0 : _b.slice(10)) || '{}');
const os = JSON.parse(((_c = args.find((arg) => arg.startsWith("--os"))) === null || _c === void 0 ? void 0 : _c.slice(5)) || '{}');
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
                    v: release.version,
                },
                {
                    name: "Channel",
                    v: release.channel,
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
    updateRPC: (data) => ipcRenderer.send("rpc.update", data),
    setTheme: (theme) => ipcRenderer.send("theme.set", theme),
    clearKey: () => ipcRenderer.send("key.clear"),
    setKey: (value) => ipcRenderer.send("key.set", value),
});
