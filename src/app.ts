import { buildApplication } from "@stricli/core";
import { name, version } from "../package.json";
import { exposeCommand } from "./commands/expose/command";

export const app = buildApplication(exposeCommand, {
  name,
  versionInfo: {
    currentVersion: version,
  },
});
