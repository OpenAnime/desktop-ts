import * as DiscordRPC from 'discord-rpc';
import log from 'electron-log';
import config from "./config.js"

log.info('Starting RPC');


const rpc = new DiscordRPC.Client({ transport: 'ipc' });

// Define an interface for our activity/presence data.
// You can extend this interface with additional properties as needed.
interface ActivityData {
  details?: string;
  state?: string;
  startTimestamp?: Date;
  // add other DiscordRPC presence properties here
}

let activity: ActivityData = {};
let loginInterval: NodeJS.Timeout | null = null;
let errorCount: number = 0;

export async function setActivity(data: ActivityData): Promise<void> {
  activity = data;
}

function updateActivity(): void {
  // Optionally, you might want to check if the client is ready
  rpc.setActivity(activity).catch((error: Error) => {
    log.error('Error setting activity:', error);
  });
}

rpc.on('ready', () => {
  log.info('RPC is ready');
  updateActivity();
  if (loginInterval) {
    clearInterval(loginInterval);
    loginInterval = null;
  }
  // Update the activity every 5 seconds
  setInterval(() => {
    updateActivity();
  }, 5000);
});

rpc.on('error', (error: Error) => {
  log.error('RPC encountered an error:', error);
});

rpc.login({ clientId: config.DiscordClientID }).catch((error: Error) => {
  log.error('Initial login failed:', error);
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
    log.error('Failed to login after 5 attempts');
  }
});

function retryLogin(): void {
  loginInterval = setInterval(() => {
    rpc.login({ clientId: config.DiscordClientID }).catch((error: Error) => {
      errorCount++;
      log.error('Retry login failed:', error);
      if (errorCount >= 5 && loginInterval) {
        clearInterval(loginInterval);
        loginInterval = null;
        log.error('Failed to login after 5 attempts');
      }
    });
  }, 2000);
}

