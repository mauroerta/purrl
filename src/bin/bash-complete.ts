#!/usr/bin/env node
import { proposeCompletions } from "@stricli/core";
import { buildContext } from "../context";
import { app } from "../app";
const inputs = process.argv.slice(3);
if (process.env["COMP_LINE"]?.endsWith(" ")) {
  inputs.push("");
}
await proposeCompletions(app, inputs, buildContext(process));
