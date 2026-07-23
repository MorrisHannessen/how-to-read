import assert from "node:assert/strict";
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

test("canonical skill has valid minimal frontmatter", () => {
  const skill = read("skills/how-to-read/SKILL.md");
  assert.match(skill, /^---\nname: how-to-read\ndescription: >\n/);
  assert.match(skill, /\n---\n\n# How to Read\n/);
  assert.doesNotMatch(skill, /TODO|\[TODO:/i);
  assert.match(skill, /Use the depth the user requests\./);
});

test("OpenAI metadata supports implicit invocation", () => {
  const metadata = read("skills/how-to-read/agents/openai.yaml");
  assert.match(metadata, /display_name: "How to Read"/);
  assert.match(metadata, /default_prompt: "Use \$how-to-read/);
  assert.match(metadata, /allow_implicit_invocation: true/);
});

test("all plugin manifests parse and identify the same plugin", () => {
  const manifests = [
    "plugins/how-to-read/.claude-plugin/plugin.json",
    "plugins/how-to-read/.codex-plugin/plugin.json",
    "plugins/how-to-read/.cursor-plugin/plugin.json",
    "plugins/how-to-read/plugin.json",
  ].map(json);

  for (const manifest of manifests) {
    assert.equal(manifest.name, "how-to-read");
    assert.equal(manifest.version, "1.0.0");
    assert.equal(manifest.license, "MIT");
  }
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
