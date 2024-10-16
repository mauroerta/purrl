import { buildCommand } from "@stricli/core";

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
      "localhost:3000 example.local",
      "localhost:3000 example.local --ssl",
    ],
  },
});
