import type { ForgeConfig } from "@electron-forge/shared-types";
import rapidenv from "rapidenv";
import { createAppImage } from "./scripts/appimage";
import path from "node:path";
import { execSync } from "node:child_process";
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
  packagerConfig: {
    name: "OpenAnime", 
    executableName: "OpenAnime",
    asar: true,
    icon: "assets/icon",
    extraResource: "unpacked",
    ignore,
  },
  hooks: {
    postPackage: async (forgeConfig, packageResult) => {
      if (process.platform === "darwin") {
        const appPath = path.resolve(
          packageResult.outputPaths[0],
          "OpenAnime.app",
        );
        try {
          execSync(`codesign --force --deep --sign - "${appPath}"`);
        } catch (e) {
          console.warn("Codesign warning:", e);
        }
      }
    },
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
          executableName: "OpenAnime",
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
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        background: "./assets/dmg-background.png",
        icon: "./assets/icon.icns",
        iconSize: 96,
        format: "UDZO",
        window: {
          size: {
            width: 600,
            height: 400,
          },
        },
        contents: (opts: any) => [
          {
            x: 150,
            y: 200,
            type: "file",
            path: opts.appPath,
          },
          {
            x: 450,
            y: 200,
            type: "link",
            path: "/Applications",
          },
        ],
      },
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
