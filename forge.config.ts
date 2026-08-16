import type { ForgeConfig } from "@electron-forge/shared-types";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import rapidenv from "rapidenv";
import { createAppImage } from "./scripts/appimage";
import path from "node:path";
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
  hooks: {
    postMake: async (forgeConfig, makeResults) => {
      // Find the Linux build results
      const linuxResult = makeResults.find(
        (res) => res.platform === "linux" && res.arch === "x64",
      );

      if (linuxResult) {
        // Path to the unpackaged app folder created by Forge packager
        const appDir = path.resolve(__dirname, "out", "OpenAnime-linux-x64");
        const outDir = path.resolve(__dirname, "out", "make");
        const iconPath = path.resolve(__dirname, "assets", "icon.png");

        const appImagePath = await createAppImage({
          appDir,
          outDir,
          appName: "OpenAnime",
          executableName: "openanime",
          iconPath,
          arch: "x86_64",
        });

        // Register the generated AppImage into Forge's artifacts list
        linuxResult.artifacts.push(appImagePath);
      }

      return makeResults;
    },
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
