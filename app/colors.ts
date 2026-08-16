import { systemPreferences } from "electron";
import os from "os";
import Color from "color";

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

export async function getColors() {
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
