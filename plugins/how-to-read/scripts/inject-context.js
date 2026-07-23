#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const skillPath = path.join(
  __dirname,
  "..",
  "skills",
  "how-to-read",
  "SKILL.md",
);

const skill = fs.readFileSync(skillPath, "utf8");
const body = skill.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();

process.stdout.write(
  `HOW I READ IS ACTIVE FOR EVERY USER-FACING RESPONSE.\n\n${body}\n`,
);
