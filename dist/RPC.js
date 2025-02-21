import { Client } from "@xhayper/discord-rpc";
import config from './config.js';
import logger from 'electron-log';
const rpc = new Client({
    clientId: config.DiscordClientID
});
let activity = {};
let loginInterval;
export async function setActivity(data) {
    if (!rpc)
        return;
    activity = data;
}
function updateActivity() {
    var _a;
    (_a = rpc.user) === null || _a === void 0 ? void 0 : _a.setActivity(activity);
}
rpc.on('ready', () => {
    logger.info('RPC is ready');
    updateActivity();
    if (loginInterval)
        clearInterval(loginInterval);
    setInterval(() => {
        updateActivity();
    }, 5000);
});
rpc.on('error', (error) => {
    logger.error(error);
});
rpc.login();
