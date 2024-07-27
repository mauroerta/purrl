import { $ } from "bun";
import { mkdir, exists, writeFile, readFile } from "node:fs/promises";
import { Command } from "commander";

const CONFIG_FOLDER = "./.https";
const TMP_HOSTS_PATH = `${CONFIG_FOLDER}/hosts`;
const HOSTS_PATH = "/private/etc/hosts";

function getDomainName(domain: string) {
  if (domain.endsWith(".local")) {
    return domain;
  }
  return `${domain}.local`;
}

async function createConfigFolder() {
  const configFolderExists = await exists(CONFIG_FOLDER);
  if (!configFolderExists) {
    await mkdir(CONFIG_FOLDER, { recursive: true });
  }
}

async function copyHostsFile({
  domain,
  port,
}: {
  domain: string;
  port: number;
}) {
  const hostsFile = await readFile(HOSTS_PATH, {
    encoding: "utf-8",
  });
  const newLine = `127.0.0.1:${port} ${getDomainName(domain)}`;

  if (!hostsFile.includes(newLine)) {
    await writeFile(
      TMP_HOSTS_PATH,
      [hostsFile, "# DO NOT TOUCH", newLine].join("\n") + "\n"
    );
  }
}

async function start({ domain, port }: { domain: string; port: number }) {
  try {
    console.log("Creating config folder");
    await createConfigFolder();
    console.log("Initializing temporary hosts file");
    await copyHostsFile({ domain, port });
    console.log("Mounting temporary hosts file");
    await $`mount --bind ${TMP_HOSTS_PATH} ${HOSTS_PATH}`;

    console.log(
      "The server is listening at",
      `http://${getDomainName(domain)}`
    );
  } catch (e) {
    console.error("Failed to start the server", e);
  }
}

async function stop() {
  console.log("Stop");

  await $`unmount -f ${HOSTS_PATH}`;
}

const program = new Command();

const result = program
  .name("https")
  .description("Starts a local https server")
  .arguments("<command>")
  .option("-d, --domain <string>", "Domain name without extension")
  .option("-p, --port [number]", "Port number", "3000")
  .option("-s, --ssl", "Specify whether to use SSL", true)
  .on("start", start)
  .on("stop", stop)
  .parse();

const { domain, port } = result.opts();
const command = result.argument("<command>").args;

async function execute() {
  await start({ domain, port: Number.parseInt(port) });

  Bun.spawn({
    cmd: command,
    cwd: process.cwd(),
    stdout: "pipe",
    async onExit() {
      await stop();
    },
  });
}

execute();
