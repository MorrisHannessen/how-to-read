import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");
}

function json(relative) {
  return JSON.parse(read(relative));
}

function packageSkill() {
  const result = spawnSync("python", [path.join(root, "scripts/package_skill.py")], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    0,
    `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
}

function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

test("canonical skill has valid minimal frontmatter", () => {
  const skill = read("skills/how-to-read/SKILL.md");
  assert.match(skill, /^---\nname: how-to-read\ndescription: >\n/);
  assert.match(skill, /\n---\n\n# How to Read\n/);
  assert.doesNotMatch(skill, /TODO|\[TODO:/i);
  assert.match(skill, /Give the \*\*smallest complete answer\*\* by default\./);
  assert.match(skill, /Match the reader and requested depth/);
});

test("OpenAI metadata supports implicit invocation", () => {
  const metadata = read("skills/how-to-read/agents/openai.yaml");
  assert.match(metadata, /display_name: "How to Read"/);
  assert.match(metadata, /default_prompt: "Use \$how-to-read/);
  assert.match(metadata, /allow_implicit_invocation: true/);
});

test("all plugin manifests parse and identify the same plugin", () => {
  const expectedVersion = json("package.json").version;
  const manifests = [
    "plugins/how-to-read/.claude-plugin/plugin.json",
    "plugins/how-to-read/.codex-plugin/plugin.json",
    "plugins/how-to-read/.cursor-plugin/plugin.json",
    "plugins/how-to-read/plugin.json",
  ].map(json);

  for (const manifest of manifests) {
    assert.equal(manifest.name, "how-to-read");
    assert.equal(manifest.version, expectedVersion);
    assert.equal(manifest.license, "MIT");
  }
});

test("all version-bearing metadata matches the package version", () => {
  const expectedVersion = json("package.json").version;
  const githubMarketplace = json(".github/plugin/marketplace.json");

  assert.equal(expectedVersion, "1.1.0");
  assert.equal(githubMarketplace.metadata.version, expectedVersion);
  assert.equal(githubMarketplace.plugins[0].version, expectedVersion);
});

test("marketplaces point to the packaged plugin", () => {
  const claude = json(".claude-plugin/marketplace.json");
  const cursor = json(".cursor-plugin/marketplace.json");
  const codex = json(".agents/plugins/marketplace.json");
  const copilot = json(".github/plugin/marketplace.json");

  assert.equal(claude.plugins[0].source, "./plugins/how-to-read");
  assert.equal(cursor.plugins[0].source, "plugins/how-to-read");
  assert.equal(codex.plugins[0].source.path, "./plugins/how-to-read");
  assert.equal(copilot.plugins[0].source, "./plugins/how-to-read");
  assert.ok(fs.existsSync(path.join(root, "plugins", "how-to-read")));
});

test("Cursor packages an always-on rule", () => {
  const rule = read("plugins/how-to-read/rules/how-to-read.mdc");
  const manifest = json("plugins/how-to-read/.cursor-plugin/plugin.json");

  assert.equal(manifest.rules, "./rules/");
  assert.match(rule, /^---\ndescription: .+\nalwaysApply: true\n---\n/);
  assert.match(rule, /# How to Read/);
});

test("Claude and Codex can discover the SessionStart hook", () => {
  const hooks = json("plugins/how-to-read/hooks/hooks.json");
  const handler = hooks.hooks.SessionStart[0].hooks[0];

  assert.equal(handler.type, "command");
  assert.match(handler.command, /inject-context\.js/);
  assert.ok(fs.existsSync(path.join(root, "plugins/how-to-read/scripts/inject-context.js")));
});

test("generated skill copy matches the canonical source", () => {
  assert.equal(
    read("plugins/how-to-read/skills/how-to-read/SKILL.md"),
    read("skills/how-to-read/SKILL.md"),
  );
  assert.equal(
    read("plugins/how-to-read/skills/how-to-read/agents/openai.yaml"),
    read("skills/how-to-read/agents/openai.yaml"),
  );
});

test("skill archive is reproducible across source timestamps", () => {
  const source = path.join(root, "skills/how-to-read/SKILL.md");
  const archive = path.join(root, "dist/how-to-read.skill");
  const original = fs.statSync(source);

  try {
    packageSkill();
    const first = sha256(archive);
    fs.utimesSync(source, original.atime, new Date(original.mtimeMs + 60_000));
    packageSkill();
    assert.equal(sha256(archive), first);
  } finally {
    fs.utimesSync(source, original.atime, original.mtime);
  }
});
