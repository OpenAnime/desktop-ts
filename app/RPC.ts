import * as DiscordRPC from "discord-rpc";
import log from "electron-log";
import config from "./config.js";

log.info("Starting RPC");
interface ActivityData {
  details?: string;
  state?: string;
  startTimestamp?: Date;
  // add other DiscordRPC presence properties here
}
let activity: ActivityData = {};
let loginInterval: NodeJS.Timeout | null = null;
let errorCount: number = 0;
let rpc: DiscordRPC.Client | null = null;

let rpcUpdateTimeout: NodeJS.Timeout | null = null;

export async function startRPC(): Promise<void> {
  if (rpc) {
    log.info("RPC is already started. Ignoring startRPC call.");
  } else {
    rpc = new DiscordRPC.Client({ transport: "ipc" });

    rpc.on("ready", () => {
      log.info("RPC is ready");
      updateActivity();
      if (loginInterval) {
        clearInterval(loginInterval);
        loginInterval = null;
      }
      // Update the activity every 5 seconds
    });

    rpc.on("error", (error: Error) => {
      log.error("RPC encountered an error:", error);
    });

    rpc.login({ clientId: config.DiscordClientID }).catch((error: Error) => {
      log.error("Initial login failed:", error);
      errorCount++;
      if (errorCount < 5) {
        if (loginInterval) {
          clearInterval(loginInterval);
        }
        retryLogin();
      } else {
        if (loginInterval) {
          clearInterval(loginInterval);
          loginInterval = null;
        }
        log.error("Failed to login after 5 attempts");
      }
    });
  }
}

export async function stopRPC(): Promise<void> {
  if (rpc) {
    rpc.destroy();
    rpc = null;
  }
}

export async function setActivity(data: ActivityData): Promise<void> {
  clearTimeout(rpcUpdateTimeout!);

  rpcUpdateTimeout = setTimeout(() => {
    activity = data;
    updateActivity();
  }, 3000)
}

function updateActivity(): void {
  if (rpc) {
    rpc.setActivity(activity).catch((error: Error) => {
      log.error("Error setting activity:", error);
    });
  }
}

function retryLogin(): void {
  loginInterval = setInterval(() => {
    if (rpc) {
      rpc.login({ clientId: config.DiscordClientID }).catch((error: Error) => {
        errorCount++;
        log.error("Retry login failed:", error);
        if (errorCount >= 5 && loginInterval) {
          clearInterval(loginInterval);
          loginInterval = null;
          log.error("Failed to login after 5 attempts");
        }
      });
    }
  }, 2000);
}
