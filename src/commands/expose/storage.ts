import fs from "node:fs/promises";
import { name } from "../../../package.json";

function createHostsStore() {
  let backup: string | undefined;

  async function load() {
    const hostsFile = await fs.readFile("/etc/hosts", "utf8");

    backup = hostsFile;

    await fs.writeFile("./backups/hosts", hostsFile);

    return backup;
  }

  async function append(origin: string, destination: string) {
    await load();

    if (!backup) {
      backup = "";
    }

    const commentLine = `# DO NOT TOUCH - AUTOMATICALLY ADDED BY ${name} COMMAND`;
    const hostLine = `${origin} ${destination}`;
    const isAlreadyAdded = backup.includes(`${origin} ${destination}`);

    if (isAlreadyAdded) {
      console.log(
        `Resolution to ${destination} for the ${origin} already added`
      );
      return;
    }

    const hosts = [
      backup,
      backup.includes(commentLine) ? "" : commentLine,
      hostLine,
    ]
      .filter(Boolean)
      .join("\n");

    await fs.writeFile("/etc/hosts", hosts);
  }

  function restore() {
    if (!backup) {
      return;
    }

    return fs.writeFile("/etc/hosts", backup);
  }

  return { load, append, restore };
}

export const storage = createHostsStore();
