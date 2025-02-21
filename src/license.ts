import { net } from 'electron'
import config from './config.js'

export async function hashHWID() {
    const hwid = await import("hwid");
    const res = await net
        .fetch(`${config.Servers.KMSServer}/hash`, {
            method: "POST",
            body: JSON.stringify({ HWID: await hwid.getHWID() }),
            headers: { "Content-Type": "application/json" },
        })
    interface IHashHWIDResponse {
        HWID: string;
    }
    const data = <IHashHWIDResponse>(await res.json())
    if (res.ok) {
        return data.HWID;
    } else {
        throw new Error("Failed to hash HWID")
    }
}