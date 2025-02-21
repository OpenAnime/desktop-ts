import type { ForgeConfig } from '@electron-forge/shared-types';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import JSConfuser from "js-confuser";
import fs from "fs";

const config: ForgeConfig = {
    plugins: [
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true
        })
    ],
    packagerConfig: {
        asar: true,
        osxSign: {}
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            platforms: ['win32'],
            config: {
                authors: "Kax"
            }
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
            config: {}
        },
        {
            name: '@electron-forge/maker-deb',
            platforms: ['linux'],
            config: {}
        },
    ],
    hooks: {
        preStart: obfuscate,
        prePackage: obfuscate
    }
};
async function obfuscate() {
   /* fs.readdirSync("dist").forEach((file) => {
        if (file.endsWith(".js")) {
            const code = fs.readFileSync(`dist/${file}`, "utf8");
            JSConfuser.obfuscate(code, { target: "browser", preset: "low" })
                .then((result) => {
                    fs.writeFileSync(`ob/${file}`, result.code);
                    console.log(`Obfuscated ${file}`);
                })
                .catch((err) => {
                    throw err;
                });
        }
    }); */
}
export default config;