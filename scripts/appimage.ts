import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

interface MakeAppImageOptions {
  appDir: string;
  outDir: string;
  appName: string;
  executableName: string;
  iconPath: string;
  arch?: string;
}

export async function createAppImage({
  appDir,
  outDir,
  appName,
  executableName,
  iconPath,
  arch = "x86_64",
}: MakeAppImageOptions): Promise<string> {
  const finalAppImageName = `${appName}-${arch}.AppImage`;
  const appImagePath = path.join(outDir, finalAppImageName);

  // 1. Clean previous AppRun if it exists and symlink the binary
  const appRunPath = path.join(appDir, "AppRun");
  if (fs.existsSync(appRunPath)) {
    fs.unlinkSync(appRunPath);
  }
  fs.symlinkSync(executableName, appRunPath);

  // 2. Handle Icon (Must be present for appimagetool validation)
  const targetIconName = `${executableName}.png`;
  const targetIconPath = path.join(appDir, targetIconName);

  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, targetIconPath);
  } else {
    // If not found, create an empty file or fallback so appimagetool doesn't hard-fail
    console.warn(
      `[AppImage] Warning: Icon not found at ${iconPath}. Using fallback touch.`,
    );
    fs.writeFileSync(targetIconPath, "");
  }

  // Symlink icon to .DirIcon (Standard AppDir requirement)
  const dirIconPath = path.join(appDir, ".DirIcon");
  if (fs.existsSync(dirIconPath)) {
    fs.unlinkSync(dirIconPath);
  }
  fs.symlinkSync(targetIconName, dirIconPath);

  // 3. Create the .desktop entry
  const desktopContent = `[Desktop Entry]
Name=${appName}
Exec=${executableName}
Icon=${executableName}
Type=Application
Categories=AudioVideo;Player;
Terminal=false
`;
  fs.writeFileSync(
    path.join(appDir, `${executableName}.desktop`),
    desktopContent,
    "utf-8",
  );

  // 4. Ensure destination directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 5. Run appimagetool with FUSE bypass enabled
  console.log(`[AppImage] Packaging ${finalAppImageName}...`);
  try {
    execSync(`appimagetool "${appDir}" "${appImagePath}"`, {
      stdio: "inherit",
      env: {
        ...process.env,
        ARCH: arch,
        APPIMAGE_EXTRACT_AND_RUN: "1", // Bypasses /dev/fuse in WSL/Docker
      },
    });
    console.log(`[AppImage] Successfully created at: ${appImagePath}`);
    return appImagePath;
  } catch (error) {
    console.error("[AppImage] Failed to generate AppImage.");
    throw error;
  }
}
