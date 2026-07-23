#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "skills", "how-to-read");
const pluginDir = path.join(root, "plugins", "how-to-read");
const targetDir = path.join(pluginDir, "skills", "how-to-read");
const cursorRule = path.join(pluginDir, "rules", "how-to-read.mdc");
const check = process.argv.includes("--check");

function normalize(value) {
  return value.replace(/\r\n/g, "\n");
}

function read(file) {
  return normalize(fs.readFileSync(file, "utf8"));
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

function expectedCursorRule() {
  const body = stripFrontmatter(read(path.join(sourceDir, "SKILL.md")));
  return `---
description: Make every response easier to read.
alwaysApply: true
---

${body}
`;
}

function compareFile(source, target) {
  return fs.existsSync(target) && read(source) === read(target);
}

function verify() {
  const files = ["SKILL.md", path.join("agents", "openai.yaml")];
  const failures = files
    .filter((file) => !compareFile(path.join(sourceDir, file), path.join(targetDir, file)))
    .map((file) => `out of sync: plugins/how-to-read/skills/how-to-read/${file}`);

  if (!fs.existsSync(cursorRule) || read(cursorRule) !== expectedCursorRule()) {
    failures.push("out of sync: plugins/how-to-read/rules/how-to-read.mdc");
  }

  if (failures.length) {
    process.stderr.write(`${failures.join("\n")}\nRun: npm run sync\n`);
    process.exit(1);
  }

  process.stdout.write("Generated copies are in sync.\n");
}

function sync() {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  fs.mkdirSync(path.dirname(cursorRule), { recursive: true });
  fs.writeFileSync(cursorRule, expectedCursorRule(), "utf8");
  process.stdout.write("Synced skill copies and Cursor rule.\n");
}

if (check) {
  verify();
} else {
  sync();
}
