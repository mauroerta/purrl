import fs from "node:fs";
import { logger } from "../../logger";

function createHostsStore() {
  async function load() {
    const hostsFile = await fs.promises.readFile("/etc/hosts", {
      encoding: "utf8",
    });

    await fs.promises.mkdir(`${process.cwd()}/backups`, {
      recursive: true,
    });

    await fs.promises.writeFile("./backups/hosts", hostsFile);

    return hostsFile;
  }

  async function append(origin: string, destination: string) {
    const current = await load();

    const hostLine = `${origin} ${destination}`;
    const isAlreadyAdded = current.includes(`${origin} ${destination}`);

    if (isAlreadyAdded) {
      return;
    }

    const hosts = `${current}\n${hostLine}`;

    await fs.promises.writeFile("/etc/hosts", hosts, {
      encoding: "utf8",
      mode: "0o755",
    });
  }

  async function restore() {
    const backup = await fs.promises.readFile("./backups/hosts", "utf8");

    logger.log("Restoring /etc/hosts with", backup);

    return fs.promises.writeFile("/etc/hosts", backup);
  }

  return { load, append, restore };
}

export const hostsStore = createHostsStore();
