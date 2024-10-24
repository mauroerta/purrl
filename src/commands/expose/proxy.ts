import httpProxy from "http-proxy";
import process from "node:process";
import type { ExposeCommandFlags } from "./types";
import { hostsStore } from "./storage";
import { createSSLOptions } from "./ssl";
import { logger } from "../../logger";
import chalk from "chalk";

export async function startProxy(
  flags: ExposeCommandFlags,
  origin: string,
  destination: string
) {
  const [host = "127.0.0.1", port = "80"] = origin.split(":");
  const normalizedHost = host === "localhost" ? "127.0.0.1" : host;
  const destinationPort = flags.ssl ? 443 : 80;

  await hostsStore.append(normalizedHost, destination);

  const sslOptions = flags.ssl
    ? await createSSLOptions([host, normalizedHost, destination])
    : undefined;

  const proxy = httpProxy.createProxyServer({
    target: {
      host: normalizedHost,
      port,
      protocol: "http",
    },
    ssl: sslOptions,
    changeOrigin: normalizedHost !== destination,
  });

  proxy.listen(destinationPort, destination);

  const exposedUrl = `${flags.ssl ? "https" : "http"}://${destination}`;

  logger.success("Listening on", exposedUrl, "on port", destinationPort);
  logger.info("└──", chalk.italic("Target", `http://${host}:${port}`));

  logger.info("Press Ctrl+C to stop");

  return new Promise<void>((resolve) => {
    async function closeAndRestore(error: unknown) {
      if (error) {
        logger.error(error);
      }

      await hostsStore.restore();

      resolve();
    }

    process.on("exit", closeAndRestore);
  });
}
