import { join, extname, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { readdir } from "fs/promises";
import type { CommandModule, InternalCommand } from "../types/Command.ts";
import { logger } from "./logger.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const commandMap = new Map<string, InternalCommand>();

export function registerCommand(cmd: CommandModule) {
  const buildRegex = (p: string) =>
    new RegExp(`^\\s*(${p})(?:\\s+([\\s\\S]+))?$`, "i");

  if (cmd && cmd.pattern) {
    const keys = [cmd.pattern, ...(cmd.aliases || [])];
    for (const key of keys) {
      if (!commandMap.has(key)) {
        commandMap.set(key, {
          ...cmd,
          patternRegex: buildRegex(key),
        });
      }
    }
  } else if (cmd && cmd.on) {
    // special case: no pattern but should still be registered
    commandMap.set(`__event_${Math.random()}`, cmd);
  }
}

export async function syncPlugins(dir: string, extensions: string[] = [""]) {
  const root = join(__dirname, dir);
  commandMap.clear();

  const scan = async (p: string) => {
    for (const entry of await readdir(p, { withFileTypes: true })) {
      const full = join(p, entry.name);
      if (entry.isDirectory()) {
        await scan(full);
      } else if (extensions.includes(extname(entry.name))) {
        try {
          const mod = await import(pathToFileURL(full).href);
          const loaded = mod.default;
          if (Array.isArray(loaded)) {
            for (const item of loaded) registerCommand(item);
          } else {
            registerCommand(loaded);
          }
        } catch (err) {
          logger.error(`Plugin ${entry.name} failed:`, (err as Error).message);
        }
      }
    }
  };

  await scan(root);
}
