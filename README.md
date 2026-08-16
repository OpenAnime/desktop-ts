# OpenAnime Desktop App

## Prerequisites

- **Node.js**: `v22.x` or `v24.x` (LTS)
- **Yarn**: `1.x` (Classic) or modern Yarn
- **Git**

## Linux Build Setup

> **Note for WSL users:** Always clone and run the project inside the native Linux filesystem (e.g., `~/projects/openanime-desktop-ts`), not on mounted Windows paths (`/mnt/...`).

### 1. Install System Dependencies

#### Debian / Ubuntu / WSL

```bash
sudo apt update && sudo apt install -y \
  libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libgtk-3-0 libgbm1 libasound2 libx11-xcb1 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libxshmfence1 libxkbcommon0 \
  rpm fakeroot dpkg file libfuse2 wget

```

#### Arch Linux / Manjaro

```bash
sudo pacman -Syu --noconfirm \
  glib2 nss atk at-spi2-atk libcups libdrm gtk3 \
  mesa alsa-lib libx11 libxcomposite libxdamage \
  libxfixes libxrandr libxshmfence libxkbcommon \
  rpm-tools fakeroot dpkg file fuse2 wget

```

#### Fedora / RHEL

```bash
sudo dnf install -y \
  glib2 nss atk at-spi2-atk libcups libdrm gtk3 \
  mesa-libgbm alsa-lib libX11 libXcomposite libXdamage \
  libXfixes libXrandr libxshmfence libxkbcommon \
  rpm-build fakeroot dpkg file fuse-libs wget

```

### 2. Install `appimagetool` (For AppImage Generation)

```bash
sudo wget -O /usr/local/bin/appimagetool "[https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage](https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage)"
sudo chmod +x /usr/local/bin/appimagetool

```

### 3. Development & Packaging Commands (Linux)

```bash
# Install Node dependencies
yarn install

# Start in development mode
yarn start

# Package distributables (.deb, .rpm, .AppImage)
yarn make --platform=linux --arch=x64

```

**Output Artifacts:** `out/make/`

- `out/make/deb/x64/*.deb`
- `out/make/rpm/x64/*.rpm`
- `out/make/OpenAnime-x86_64.AppImage`

## Windows Build Setup

Run commands directly in **PowerShell** or **Command Prompt** (Native Windows).

### 1. Install Prerequisites

Using `winget`:

```powershell
winget install OpenJS.NodeJS.LTS

```

Enable Yarn:

```powershell
corepack enable
corepack prepare yarn@stable --activate

```

### 2. Development & Packaging Commands (Windows)

```powershell
# Install dependencies
yarn install

# Start development mode
yarn start

# Package distributables (Squirrel.Windows installer and ZIP)
yarn make --platform=win32 --arch=x64

```

**Output Artifacts:** `out/make/squirrel.windows/x64/`

- `OpenAnime-*-Setup.exe`
- `OpenAnime-*-full.nupkg`
- `RELEASES`

## WebGPU Requirements on Linux

To leverage WebGPU acceleration on Linux, ensure Vulkan drivers are present:

```bash
# Verify Vulkan runtime
vulkaninfo --summary

```

Launch with hardware acceleration / Vulkan enabled if testing without a native desktop compositor:

```bash
yarn start --enable-features=Vulkan,WebGPU --use-vulkan

```

## Clean Rebuild

If encountering caching, permission, or stale build errors:

### Linux / WSL

```bash
rm -rf out dist .webpack node_modules yarn.lock
yarn install
yarn make

```

### Windows (PowerShell)

```powershell
Remove-Item -Recurse -Force out, dist, .webpack, node_modules, yarn.lock -ErrorAction SilentlyContinue
yarn install
yarn make

```
