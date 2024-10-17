import fs from "node:fs/promises";
import { logger } from "../../logger";

function createHostsStore() {
  async function load() {
    const hostsFile = await fs.readFile("/etc/hosts", {
      encoding: "utf8",
    });

    await fs.writeFile("./backups/hosts", hostsFile);

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

    await fs.writeFile("/etc/hosts", hosts, {
      encoding: "utf8",
      mode: "0o755",
    });
  }

  async function restore() {
    const backup = await fs.readFile("./backups/hosts", "utf8");

    logger.log("Restoring /etc/hosts with", backup);

    await fs.chmod("/etc/hosts", 0o755);

    return fs.writeFile("/etc/hosts", backup);
  }

  return { load, append, restore };
}

export const storage = createHostsStore();
