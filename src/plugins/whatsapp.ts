import { WAProto } from "baileys";
import type { CommandModule } from "../types/Command.ts";

export default [
  {
    pattern: "name",
    fromMe: true,
    isGroup: false,
    desc: "Change your whatsapp name",
    type: "whatsapp",
    execute: async (msg, args) => {
      if (!args) return await msg.reply("Provide WhatsApp name");
      await msg.client.updateProfileName(args);
      return await msg.reply("WhatsApp Name updated!");
    },
  },
  {
    pattern: "chatpin",
    fromMe: true,
    isGroup: false,
    desc: "Pin a chat",
    type: "whatsapp",
    execute: async (msg) => {
      if (!msg.quoted) return await msg.reply("Reply a messsage");
      await msg.client.chatModify({ pin: true }, msg.from);
      return await msg.reply("chat pinned.");
    },
  },
  {
    pattern: "chatunpin",
    fromMe: true,
    isGroup: false,
    desc: "Unpin a chat",
    type: "whatsapp",
    execute: async (msg) => {
      if (!msg.quoted) return await msg.reply("Reply a messsage");
      await msg.client.chatModify({ pin: false }, msg.from);
      return await msg.reply("chat unpinned.");
    },
  },
  {
    pattern: "pin",
    fromMe: true,
    isGroup: false,
    desc: "Pin a message",
    type: "whatsapp",
    execute: async (msg) => {
      if (!msg.quoted) return await msg.reply("Reply a messsage");
      return await msg.client.sendMessage(msg.from, {
        pin: msg.quoted.key,
        type: WAProto.PinInChat.Type.PIN_FOR_ALL,
        time: 604800,
      });
    },
  },
  {
    pattern: "unpin",
    fromMe: true,
    isGroup: false,
    desc: "Unpin a message",
    type: "whatsapp",
    execute: async (msg) => {
      if (!msg.quoted) return await msg.reply("Reply a messsage");
      return await msg.client.sendMessage(msg.from, {
        pin: msg.quoted.key,
        type: WAProto.PinInChat.Type.UNPIN_FOR_ALL,
        time: 604800,
      });
    },
  },
  {
    pattern: "clear",
    fromMe: true,
    isGroup: false,
    desc: "clear chat",
    type: "whatsapp",
    execute: async (msg) => {
      await msg.client.chatModify(
        {
          clear: true,
          lastMessages: [
            {
              key: msg.key,
              messageTimestamp: msg.messageTimestamp,
            },
          ],
        },
        msg.from,
      );
    },
  },
  {
    pattern: "delete",
    fromMe: true,
    isGroup: false,
    desc: "delete a chat",
    type: "whatsapp",
    execute: async (msg) => {
      return await msg.client.chatModify(
        {
          delete: true,
          lastMessages: [
            {
              key: msg.key,
              messageTimestamp: msg.messageTimestamp,
            },
          ],
        },
        msg.from,
      );
    },
  },
  {
    pattern: "archive",
    fromMe: true,
    isGroup: false,
    desc: "archive chat",
    type: "whatsapp",
    execute: async (msg) => {
      return await msg.client.chatModify(
        {
          archive: true,
          lastMessages: [
            {
              key: msg.key,
              messageTimestamp: msg.messageTimestamp,
            },
          ],
        },
        msg.from,
      );
    },
  },
  {
    pattern: "unarchive",
    fromMe: true,
    isGroup: false,
    desc: "unarchive chat",
    type: "whatsapp",
    execute: async (msg) => {
      return await msg.client.chatModify(
        {
          archive: false,
          lastMessages: [
            {
              key: msg.key,
              messageTimestamp: msg.messageTimestamp,
            },
          ],
        },
        msg.from,
      );
    },
  },
  {
    pattern: "pp",
    fromMe: true,
    isGroup: false,
    desc: "Set a new profile photo",
    type: "whatsapp",
    execute: async (msg) => {
      if (!msg.quoted?.image) return await msg.reply("Reply an Image");
      const image = await msg.quoted.download();
      return await msg.client.updateProfilePicture(msg.client.user.id, image);
    },
  },
  {
    pattern: "fullpp",
    fromMe: true,
    isGroup: false,
    desc: "Set high resolution profile photo",
    type: "whatsapp",
    execute: async (msg) => {
      if (!msg.quoted?.image) return await msg.reply("Reply an Image");
      const image = await msg.quoted.download();
      return await msg.client.updateProfilePicture(msg.client.user.id, image, {
        width: 324,
        height: 720,
      });
    },
  },
] satisfies CommandModule[];
