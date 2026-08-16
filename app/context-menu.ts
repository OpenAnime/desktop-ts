import { BrowserWindow, shell } from "electron";
import contextMenu from "electron-context-menu";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let popupWindow: BrowserWindow | null = null;

export function registerContextMenu() {
  contextMenu({
    prepend: (_defaultActions, parameters) => [
      /* {
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
      },*/
      {
        label: "???",
        visible: parameters.selectionText.includes("uras"),
        click: () => {
          popupWindow = new BrowserWindow({
            frame: false,
            fullscreen: true,
          });

          popupWindow.loadFile(join(__dirname, "../assets/popup.html"));
          popupWindow.setIgnoreMouseEvents(true);
          popupWindow.setAlwaysOnTop(true, "screen-saver");
          popupWindow.on("close", (event) => {
            event.preventDefault();
          });
        },
      },
    ],
  });
}
