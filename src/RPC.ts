import { Client } from "@xhayper/discord-rpc";
import config from './config.js';
import logger from 'electron-log';
import { RPC } from "./types.js";

const rpc = new Client({
    clientId: config.DiscordClientID
});

interface ActivityData {
    [key: string]: any;
}

let activity: ActivityData = {};
let loginInterval: NodeJS.Timeout | undefined;

export async function setActivity(data: ActivityData): Promise<void> {
    if (!rpc) return;
    activity = data;
}


function updateActivity(): void {
    rpc.user?.setActivity(activity);
}

rpc.on('ready', () => {
    logger.info('RPC is ready');
    updateActivity();
    if (loginInterval) clearInterval(loginInterval);
    setInterval(() => {
        updateActivity();
    }, 5000);
});

rpc.on('error', (error: Error) => {
    logger.error(error);
});

rpc.login()