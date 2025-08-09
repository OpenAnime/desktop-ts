export interface RPC {
  state: string;
  details: string;
  startTimestamp: string;
  endTimestamp: string;
  largeImageText: string;
  smallImageText: string;
  partyId: string;
  partySize: string;
  partyMax: string;
  joinSecret: string;
}
export type Theme = "dark" | "light" | "system";
