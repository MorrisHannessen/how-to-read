#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const NAME = "how-to-read";
const REPO = "MorrisHannessen/how-to-read";
const ROOT = path.resolve(__dirname, "..");
const SOURCE_SKILL = path.join(ROOT, "skills", NAME);
const SOURCE_PLUGIN = path.join(ROOT, "plugins", NAME);
const SOURCE_CURSOR_RULE = path.join(SOURCE_PLUGIN, "rules", `${NAME}.mdc`);
const START = "<!-- how-to-read:start -->";
const END = "<!-- how-to-read:end -->";
const TARGETS = new Set(["claude", "codex", "cursor", "copilot"]);

function parseArgs(argv) {
  const options = {
    dryRun: false,
    uninstall: false,
    only: [],
    repo: null,
    home: process.env.HOW_TO_READ_HOME || os.homedir(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") continue;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--uninstall" || arg === "-u") options.uninstall = true;
    else if (arg === "--repo") options.repo = requireValue(argv, ++index, arg);
    else if (arg === "--home") options.home = requireValue(argv, ++index, arg);
    else if (arg === "--only") options.only.push(requireValue(argv, ++index, arg));
    else if (arg === "--list") options.list = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  for (const target of options.only) {
    if (!TARGETS.has(target)) throw new Error(`Unknown target: ${target}`);
  }

  options.home = path.resolve(options.home);
  if (options.repo) options.repo = path.resolve(options.repo);
  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} needs a value.`);
  }
  return value;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

function skillBody() {
  return stripFrontmatter(
    fs.readFileSync(path.join(SOURCE_SKILL, "SKILL.md"), "utf8"),
  );
}

function block(body) {
  return `${START}\n${body.trim()}\n${END}`;
}

function replaceBlock(existing, body) {
  const pattern = new RegExp(
    `${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}`,
    "g",
  );
  const nextBlock = block(body);
  if (pattern.test(existing)) return existing.replace(pattern, nextBlock);
  const spacer = existing.trim() ? "\n\n" : "";
  return `${existing.replace(/\s+$/, "")}${spacer}${nextBlock}\n`;
}

function removeBlock(existing) {
  const pattern = new RegExp(
    `\\s*${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}\\s*`,
    "g",
  );
  const next = existing.replace(pattern, "\n").trim();
  return next ? `${next}\n` : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertOwnedPath(target, base) {
  const resolved = path.resolve(target);
  const resolvedBase = path.resolve(base);
  const relative = path.relative(resolvedBase, resolved);
  if (
    path.basename(resolved) !== NAME ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing unsafe owned path: ${resolved}`);
  }
}

function copyOwned(source, target, base, options) {
  assertOwnedPath(target, base);
  note(options, `copy ${source} -> ${target}`);
  if (options.dryRun) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
}

function removeOwned(target, base, options) {
  assertOwnedPath(target, base);
  note(options, `remove ${target}`);
  if (!options.dryRun) fs.rmSync(target, { recursive: true, force: true });
}

function writeManaged(file, body, options) {
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const next = replaceBlock(existing, body);
  note(options, `update ${file}`);
  if (options.dryRun) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, next, "utf8");
}

function removeManaged(file, options) {
  if (!fs.existsSync(file)) return;
  const existing = fs.readFileSync(file, "utf8");
  const next = removeBlock(existing);
  note(options, `strip How to Read block from ${file}`);
  if (options.dryRun) return;
  if (next) fs.writeFileSync(file, next, "utf8");
  else fs.rmSync(file, { force: true });
}

function copyFile(source, target, options) {
  note(options, `copy ${source} -> ${target}`);
  if (options.dryRun) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function removeFile(target, options) {
  if (!fs.existsSync(target)) return;
  note(options, `remove ${target}`);
  if (!options.dryRun) fs.rmSync(target, { force: true });
}

function note(options, message) {
  process.stdout.write(`${options.dryRun ? "[dry-run] " : ""}${message}\n`);
}

function selected(options, target) {
  return options.only.length === 0 || options.only.includes(target);
}

function installPersonal(options) {
  const body = skillBody();

  if (selected(options, "claude")) {
    copyOwned(
      SOURCE_SKILL,
      path.join(options.home, ".claude", "skills", NAME),
      options.home,
      options,
    );
    writeManaged(path.join(options.home, ".claude", "CLAUDE.md"), body, options);
  }

  if (selected(options, "codex")) {
    copyOwned(
      SOURCE_SKILL,
      path.join(options.home, ".agents", "skills", NAME),
      options.home,
      options,
    );
    writeManaged(path.join(options.home, ".codex", "AGENTS.md"), body, options);
  }

  if (selected(options, "cursor")) {
    copyOwned(
      SOURCE_PLUGIN,
      path.join(options.home, ".cursor", "plugins", "local", NAME),
      options.home,
      options,
    );
  }

  if (selected(options, "copilot")) {
    copyOwned(
      SOURCE_SKILL,
      path.join(options.home, ".copilot", "skills", NAME),
      options.home,
      options,
    );
    writeManaged(
      path.join(options.home, ".copilot", "copilot-instructions.md"),
      body,
      options,
    );
  }
}

function uninstallPersonal(options) {
  if (selected(options, "claude")) {
    removeOwned(
      path.join(options.home, ".claude", "skills", NAME),
      options.home,
      options,
    );
    removeManaged(path.join(options.home, ".claude", "CLAUDE.md"), options);
  }

  if (selected(options, "codex")) {
    removeOwned(
      path.join(options.home, ".agents", "skills", NAME),
      options.home,
      options,
    );
    removeManaged(path.join(options.home, ".codex", "AGENTS.md"), options);
  }

  if (selected(options, "cursor")) {
    removeOwned(
      path.join(options.home, ".cursor", "plugins", "local", NAME),
      options.home,
      options,
    );
  }

  if (selected(options, "copilot")) {
    removeOwned(
      path.join(options.home, ".copilot", "skills", NAME),
      options.home,
      options,
    );
    removeManaged(
      path.join(options.home, ".copilot", "copilot-instructions.md"),
      options,
    );
  }
}

function installRepo(options) {
  const repo = options.repo;
  const body = skillBody();

  if (selected(options, "claude")) {
    copyOwned(
      SOURCE_SKILL,
      path.join(repo, ".claude", "skills", NAME),
      repo,
      options,
    );
    writeManaged(path.join(repo, "CLAUDE.md"), body, options);
  }

  if (selected(options, "codex")) {
    copyOwned(
      SOURCE_SKILL,
      path.join(repo, ".agents", "skills", NAME),
      repo,
      options,
    );
  }

  if (selected(options, "codex")) {
    writeManaged(path.join(repo, "AGENTS.md"), body, options);
  }

  if (selected(options, "cursor")) {
    copyFile(
      SOURCE_CURSOR_RULE,
      path.join(repo, ".cursor", "rules", `${NAME}.mdc`),
      options,
    );
  }

  if (selected(options, "copilot")) {
    copyOwned(
      SOURCE_SKILL,
      path.join(repo, ".github", "skills", NAME),
      repo,
      options,
    );
    writeManaged(
      path.join(repo, ".github", "copilot-instructions.md"),
      body,
      options,
    );
  }
}

function uninstallRepo(options) {
  const repo = options.repo;

  if (selected(options, "claude")) {
    removeOwned(
      path.join(repo, ".claude", "skills", NAME),
      repo,
      options,
    );
    removeManaged(path.join(repo, "CLAUDE.md"), options);
  }

  if (selected(options, "codex")) {
    removeOwned(
      path.join(repo, ".agents", "skills", NAME),
      repo,
      options,
    );
  }

  if (selected(options, "codex")) {
    removeManaged(path.join(repo, "AGENTS.md"), options);
  }

  if (selected(options, "cursor")) {
    removeFile(path.join(repo, ".cursor", "rules", `${NAME}.mdc`), options);
  }

  if (selected(options, "copilot")) {
    removeOwned(
      path.join(repo, ".github", "skills", NAME),
      repo,
      options,
    );
    removeManaged(
      path.join(repo, ".github", "copilot-instructions.md"),
      options,
    );
  }
}

function printList() {
  process.stdout.write(
    [
      "claude  Claude Code skill + global CLAUDE.md",
      "codex   shared Agent Skill + global Codex AGENTS.md",
      "cursor  local Cursor plugin with an always-on rule",
      "copilot GitHub Copilot skill + personal instructions",
      "",
    ].join("\n"),
  );
}

function printHelp() {
  process.stdout.write(`How to Read installer

USAGE
  npx -y github:${REPO} -- [options]

OPTIONS
  --only <target>   Install one target. Repeat for several.
  --repo <path>     Install repository-level skills and always-on rules.
  --dry-run         Show changes without writing.
  --uninstall, -u   Remove owned files and managed instruction blocks.
  --list            List supported targets.
  --home <path>     Override the home directory.
  --help, -h        Show this help.

TARGETS
  claude, codex, cursor, copilot
`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();
  if (options.list) return printList();

  if (!fs.existsSync(SOURCE_SKILL)) {
    throw new Error(`Skill source is missing: ${SOURCE_SKILL}`);
  }

  if (options.repo) {
    if (!fs.existsSync(options.repo) && !options.dryRun) {
      throw new Error(`Repository path does not exist: ${options.repo}`);
    }
    if (options.uninstall) uninstallRepo(options);
    else installRepo(options);
  } else if (options.uninstall) {
    uninstallPersonal(options);
  } else {
    installPersonal(options);
  }

  process.stdout.write(
    `${options.uninstall ? "Uninstall" : "Install"} complete. Restart the agent or open a new session.\n`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
