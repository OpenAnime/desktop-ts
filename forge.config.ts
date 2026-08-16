import type { ForgeConfig } from "@electron-forge/shared-types";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import rapidenv from "rapidenv";
const env = rapidenv();

env.load();

const ignore = [
  "/app",
  "/forge.config.ts",
  "/README.md",
  "/tsconfig.json",
  "/.gitignore",
  "/.npmrc",
  "/.env",
  "/.env.example",
  "/scripts",
];

const config: ForgeConfig = {
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  packagerConfig: {
    name: "OpenAnime", // Display name
    executableName: "openanime", // Executable name
    asar: true,
    icon: "assets/icon.ico",
    osxSign: {},
    extraResource: "unpacked",
    ignore,
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        authors: "Kax",
        loadingGif: "./assets/cat.gif",
      },
      // uras orospusu şu kediyi bir kez daha
      // kaldırırsan amını yurdunu sikicem artık
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: {},
    },
    {
      name: "@electron-forge/maker-deb",
      platforms: ["linux"],
      config: {},
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "OpenAnime",
          name: "desktop-ts",
        },
        prerelease: false,
      },
    },
  ],
};

export default config;
