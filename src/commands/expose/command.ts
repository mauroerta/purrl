import { buildCommand } from "@stricli/core";
import chalk from "chalk";

export const exposeCommand = buildCommand({
  loader: () => import("./proxy").then((module) => module.startProxy),
  parameters: {
    flags: {
      ssl: {
        kind: "boolean",
        brief: "If passed the destination will be exposed over HTTPS",
        default: false,
      },
    },
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Origin path",
          parse: String,
        },
        {
          brief: "Destination path",
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: "Expose your localhost to a custom local domain",
    customUsage: [
      chalk.italic(chalk.cyan("localhost:3000 example.local")),
      chalk.italic(
        chalk.cyan(
          "localhost:3000 example.local",
          chalk.bold("--ssl"),
          chalk.grey("# expose with https")
        )
      ),
    ],
  },
});
