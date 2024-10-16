import httpProxy from "http-proxy";
import process from "node:process";
import type { ExposeCommandFlags } from "./types";
import { storage } from "./storage";

export async function startProxy(
  flags: ExposeCommandFlags,
  origin: string,
  destination: string
) {
  const [host = "localhost", port = "80"] = origin.split(":");

  await storage.append(host, destination);

  const proxy = httpProxy.createProxyServer({
    target: {
      host,
      port,
      protocol: flags.ssl ? "https" : "http",
    },
    changeOrigin: origin !== destination,
  });

  process.on("exit", storage.restore);

  proxy.listen(80, destination);

  return new Promise<void>((resolve) => {
    function closeAndRestore() {
      storage.restore();
      resolve();
    }

    proxy.on("close", closeAndRestore);
  });
}
