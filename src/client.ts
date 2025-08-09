import {
  makeWASocket,
  delay,
  type CacheStore,
  type BaileysEventMap,
} from "baileys";
import pino from "pino";
import Cache from "@cacheable/node-cache";
import config from "../config.ts";
import { useSqliteAuthState } from "./utils/auth.ts";
import {
  Call,
  ConnectionUpdate,
  MessagesUpsert,
  MessagesUpdate,
  MessagingHistorySet,
  GroupsUpdate,
  GroupsUpsert,
  GroupParticipantsUpdate,
  PresenceUpdate,
} from "./events/index.ts";
import { GroupCache } from "./utils/schemas/metadata.ts";
import { makeSocketCache } from "./events/hooks/socket.ts";

const msgRetryCounterCache = new Cache() as CacheStore;
const logger = pino({ level: "silent" });

export const startSock = async () => {
  const { state, saveCreds } = await useSqliteAuthState();

  const sock = makeWASocket({
    auth: state,
    logger,
    msgRetryCounterCache,
    cachedGroupMetadata: async (jid) => {
      return await GroupCache.get.one(jid);
    },
  });

  if (!sock.authState.creds.registered) {
    await delay(3000);
    const code = await sock.requestPairingCode(config.NUMBER, config.PAIR_CODE);
    logger.info(`Connect with: ${code}`);
  }

  const handlers: {
    [K in keyof BaileysEventMap]?: (arg: BaileysEventMap[K]) => any;
  } = {
    call: Call,
    "connection.update": ConnectionUpdate,
    "creds.update": () => saveCreds(),
    "messages.upsert": MessagesUpsert(sock),
    "messages.update": MessagesUpdate,
    "messaging-history.set": MessagingHistorySet,
    "groups.update": GroupsUpdate,
    "groups.upsert": GroupsUpsert,
    "group-participants.update": GroupParticipantsUpdate,
    "presence.update": PresenceUpdate,
  };

  sock.ev.process(async (events) => {
    for (const [event, data] of Object.entries(events)) {
      const handler = handlers[event as keyof BaileysEventMap];
      if (handler) await handler(data as any);
    }
  });

  makeSocketCache(sock);
  return sock;
};

startSock();
