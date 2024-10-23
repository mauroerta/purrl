/**
 * shamelessly copied, kudos to Next.js
 * https://github.com/vercel/next.js/blob/0878db247ccde1938eaa10d3aaf12d547cc48631/packages/next/src/lib/mkcert.ts
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { X509Certificate, createPrivateKey } from "node:crypto";
import { execSync } from "node:child_process";
import { logger } from "../../logger";

const MKCERT_VERSION = "v1.4.4";
const CERT_DIR = `${process.cwd()}/certificates`;
const DEFAULT_HOSTS = ["localhost", "127.0.0.1", "::1"];

export async function createSSLOptions(destinations: string[]) {
  const paths = await createSelfSignedCertificate(destinations);

  if (!paths) {
    return undefined;
  }

  return {
    cert: fs.readFileSync(paths.cert, "utf-8"),
    key: fs.readFileSync(paths.key, "utf-8"),
  };
}

async function createSelfSignedCertificate(destinations: string[]) {
  try {
    const binaryPath = await downloadBinary();
    if (!binaryPath) {
      throw new Error("missing mkcert binary");
    }

    const resolvedCertDir = path.resolve(CERT_DIR);

    await fs.promises.mkdir(resolvedCertDir, {
      recursive: true,
    });

    const keyPath = path.resolve(resolvedCertDir, "localhost-key.pem");
    const certPath = path.resolve(resolvedCertDir, "localhost.pem");

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const cert = new X509Certificate(fs.readFileSync(certPath));
      const key = fs.readFileSync(keyPath);

      const checkedHosts = destinations.every((destination) =>
        cert.checkHost(destination)
      );

      if (checkedHosts && cert.checkPrivateKey(createPrivateKey(key))) {
        logger.info("Using already generated self signed certificate");
        const caLocation = execSync(`"${binaryPath}" -CAROOT`)
          .toString()
          .trim();

        return {
          key: keyPath,
          cert: certPath,
          rootCA: `${caLocation}/rootCA.pem`,
        };
      }
    }

    logger.info(
      "Attempting to generate self signed certificate. This may prompt for your password"
    );

    const hosts = Array.from(new Set([...DEFAULT_HOSTS, ...destinations]));

    execSync(
      `"${binaryPath}" -install -key-file "${keyPath}" -cert-file "${certPath}" ${hosts.join(
        " "
      )}`,
      { stdio: "ignore" }
    );

    const caLocation = execSync(`"${binaryPath}" -CAROOT`).toString().trim();

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      throw new Error("Certificate files not found");
    }

    logger.info(`CA Root certificate created in ${caLocation}`);
    logger.info(`Certificates created in ${resolvedCertDir}`);

    return {
      key: keyPath,
      cert: certPath,
      rootCA: `${caLocation}/rootCA.pem`,
    };
  } catch (err) {
    logger.error(
      "Failed to generate self-signed certificate. Falling back to http.",
      err
    );
  }
}

function getBinaryName() {
  const platform = process.platform;
  const arch = process.arch === "x64" ? "amd64" : process.arch;

  if (platform === "win32") {
    return `mkcert-${MKCERT_VERSION}-windows-${arch}.exe`;
  }

  if (platform === "darwin") {
    return `mkcert-${MKCERT_VERSION}-darwin-${arch}`;
  }

  if (platform === "linux") {
    return `mkcert-${MKCERT_VERSION}-linux-${arch}`;
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

async function downloadBinary() {
  try {
    const binaryName = getBinaryName();
    const binaryPath = path.join(CERT_DIR, binaryName);

    if (fs.existsSync(binaryPath)) {
      return binaryPath;
    }

    const downloadUrl = `https://github.com/FiloSottile/mkcert/releases/download/${MKCERT_VERSION}/${binaryName}`;

    await fs.promises.mkdir(`${process.cwd()}/certificates`, {
      recursive: true,
    });

    logger.info("Downloading mkcert package...");

    const response = await fetch(downloadUrl);

    if (!response.ok || !response.body) {
      throw new Error(`request failed with status ${response.status}`);
    }

    logger.info("Download response was successful, writing to disk");

    const binaryWriteStream = fs.createWriteStream(binaryPath);

    await response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          return new Promise((resolve, reject) => {
            binaryWriteStream.write(chunk, (error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve();
            });
          });
        },
        close() {
          return new Promise((resolve, reject) => {
            binaryWriteStream.close((error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve();
            });
          });
        },
      })
    );

    await fs.promises.chmod(binaryPath, Number.parseInt("755", 8));

    return binaryPath;
  } catch (err) {
    logger.error("Error downloading mkcert:", err);
  }
}
