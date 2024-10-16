import fs from "node:fs/promises";

function createHostsStore() {
  async function load() {
    const hostsFile = await fs.readFile("/etc/hosts", "utf8");

    await fs.writeFile("./backups/hosts", hostsFile);

    return hostsFile;
  }

  async function append(origin: string, destination: string) {
    const current = await load();

    const hostLine = `${origin} ${destination}`;
    const isAlreadyAdded = current.includes(`${origin} ${destination}`);

    if (isAlreadyAdded) {
      console.log(
        `Resolution to ${destination} for the ${origin} already added`
      );
      return;
    }

    const hosts = `${current}\n${hostLine}`;

    await fs.writeFile("/etc/hosts", hosts);
  }

  async function restore() {
    const backup = await fs.readFile("./backups/hosts", "utf8");

    console.log("Restoring /etc/hosts with", backup);

    return fs.writeFile("/etc/hosts", backup);
  }

  return { load, append, restore };
}

export const storage = createHostsStore();
