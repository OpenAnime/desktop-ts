{
  description = "OpenAnime desktop application";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      openanime = pkgs.stdenvNoCC.mkDerivation (finalAttrs: {
        pname = "openanime";
        version = "2.2.0";

        src = pkgs.lib.cleanSourceWith {
          src = ./.;
          filter =
            path: type:
            pkgs.lib.cleanSourceFilter path type
            && !(builtins.elem (baseNameOf path) [
              ".env"
              "node_modules"
              "out"
              "src"
            ]);
        };

        yarnOfflineCache = pkgs.fetchYarnDeps {
          yarnLock = "${finalAttrs.src}/yarn.lock";
          hash = "sha256-Cgf3kugJb3xmxLXnpCv4UC6SLuhNc4omVn+TyMudWmM=";
        };

        nativeBuildInputs = with pkgs; [
          copyDesktopItems
          makeWrapper
          nodejs_24
          yarn
          yarnBuildHook
          yarnConfigHook
        ];

        env.ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
        yarnBuildScript = "build";

        postPatch = ''
          substituteInPlace scripts/obfuscate.mjs \
            --replace-fail \
              "const obfuscatorOptions = {" \
              "const obfuscatorOptions = { seed: 1,"
          substituteInPlace app/main.ts \
            --replace-fail \
              "configureUpdater();" \
              "if (process.env.OPENANIME_NIX_PACKAGE !== \"1\") configureUpdater();" \
            --replace-fail \
              "registerUpdaterEvents();" \
              "if (process.env.OPENANIME_NIX_PACKAGE !== \"1\") registerUpdaterEvents();"
          substituteInPlace app/window.ts \
            --replace-fail \
              "  autoUpdater.checkForUpdates();" \
              "  if (process.env.OPENANIME_NIX_PACKAGE !== \"1\") autoUpdater.checkForUpdates();"
        '';

        installPhase = ''
          runHook preInstall

          rm -rf node_modules
          yarn install \
            --offline \
            --frozen-lockfile \
            --production=true \
            --ignore-scripts \
            --no-progress \
            --non-interactive

          install -d "$out/lib/openanime"
          cp -a assets node_modules package.json src unpacked "$out/lib/openanime/"

          install -Dm644 assets/icon.png "$out/share/icons/hicolor/64x64/apps/openanime.png"
          install -Dm644 LICENSE "$out/share/licenses/openanime/LICENSE"

          makeWrapper ${pkgs.lib.getExe pkgs.electron_43} "$out/bin/openanime" \
            --inherit-argv0 \
            --set-default ELECTRON_FORCE_IS_PACKAGED 1 \
            --set OPENANIME_NIX_PACKAGE 1 \
            --suffix PATH : ${pkgs.lib.makeBinPath [ pkgs.xdg-utils ]} \
            --add-flags "$out/lib/openanime" \
            --add-flags "--ozone-platform=x11" \
            --add-flags "--disable-gpu-sandbox"

          runHook postInstall
        '';

        desktopItems = [
          (pkgs.makeDesktopItem {
            name = "openanime";
            desktopName = "OpenAnime";
            genericName = "Anime streaming client";
            comment = "Desktop client for OpenAnime";
            exec = "openanime";
            icon = "openanime";
            startupWMClass = "openanime";
            categories = [
              "AudioVideo"
              "Video"
            ];
            keywords = [
              "anime"
              "streaming"
              "video"
            ];
            terminal = false;
            type = "Application";
          })
        ];

        strictDeps = true;

        meta = {
          description = "Desktop client for OpenAnime";
          homepage = "https://openani.me";
          license = pkgs.lib.licenses.gpl3Only;
          mainProgram = "openanime";
          platforms = pkgs.lib.platforms.linux;
        };
      });
    in
    {
      packages.${system} = {
        default = openanime;
        inherit openanime;
      };

      formatter.${system} = pkgs.nixfmt-tree;
    };
}
