import httpProxy from "http-proxy";
import process from "node:process";
import type { ExposeCommandFlags } from "./types";
import { storage } from "./storage";

export async function startProxy(
  flags: ExposeCommandFlags,
  origin: string,
  destination: string
) {
  const [host = "127.0.0.1", port = "80"] = origin.split(":");
  const realHost = host === "localhost" ? "127.0.0.1" : host;

  await storage.append(realHost, destination);

  const proxy = httpProxy.createProxyServer({
    target: {
      host: realHost,
      port,
      protocol: flags.ssl ? "https" : "http",
    },
    changeOrigin: origin !== destination,
  });

  console.log("Listening on", destination);
  console.log("Target", {
    host,
    port,
  });
  console.log("Press Ctrl+C to stop");

  proxy.listen(80, destination);

  return new Promise<void>((resolve) => {
    async function closeAndRestore() {
      console.log("Restoring hosts file");

      await storage.restore();

      resolve();
    }

    proxy.on("close", closeAndRestore);
    proxy.on("end", closeAndRestore);
    proxy.on("error", closeAndRestore);
    process.on("exit", closeAndRestore);
  });
}
