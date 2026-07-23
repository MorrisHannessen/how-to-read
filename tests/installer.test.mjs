import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installer = path.join(root, "bin", "install.js");
const marker = "<!-- how-to-read:start -->";

function run(args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [installer, ...args], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    expectedStatus,
    `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function count(value, needle) {
  return value.split(needle).length - 1;
}

test("personal install is complete, idempotent, and reversible", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "how-to-read-home-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));

  const claudeFile = path.join(home, ".claude", "CLAUDE.md");
  fs.mkdirSync(path.dirname(claudeFile), { recursive: true });
  fs.writeFileSync(claudeFile, "Keep this instruction.\n", "utf8");

  run(["--home", home]);
  run(["--home", home]);

  assert.ok(fs.existsSync(path.join(home, ".claude/skills/how-to-read/SKILL.md")));
  assert.ok(fs.existsSync(path.join(home, ".agents/skills/how-to-read/SKILL.md")));
  assert.ok(
    fs.existsSync(
      path.join(home, ".cursor/plugins/local/how-to-read/rules/how-to-read.mdc"),
    ),
  );
  assert.ok(fs.existsSync(path.join(home, ".copilot/skills/how-to-read/SKILL.md")));
  assert.equal(count(fs.readFileSync(claudeFile, "utf8"), marker), 1);

  run(["--home", home, "--uninstall"]);

  assert.equal(fs.existsSync(path.join(home, ".claude/skills/how-to-read")), false);
  assert.equal(fs.existsSync(path.join(home, ".agents/skills/how-to-read")), false);
  assert.equal(
    fs.existsSync(path.join(home, ".cursor/plugins/local/how-to-read")),
    false,
  );
  assert.equal(fs.existsSync(path.join(home, ".copilot/skills/how-to-read")), false);
  assert.equal(fs.readFileSync(claudeFile, "utf8"), "Keep this instruction.\n");
});

test("repository install creates every native adapter", (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "how-to-read-repo-"));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));

  const copilotFile = path.join(repo, ".github", "copilot-instructions.md");
  fs.mkdirSync(path.dirname(copilotFile), { recursive: true });
  fs.writeFileSync(copilotFile, "Keep repository context.\n", "utf8");

  run(["--repo", repo]);

  assert.ok(fs.existsSync(path.join(repo, ".claude/skills/how-to-read/SKILL.md")));
  assert.ok(fs.existsSync(path.join(repo, ".agents/skills/how-to-read/SKILL.md")));
  assert.ok(fs.existsSync(path.join(repo, ".github/skills/how-to-read/SKILL.md")));
  assert.ok(fs.existsSync(path.join(repo, ".cursor/rules/how-to-read.mdc")));
  assert.match(fs.readFileSync(path.join(repo, "CLAUDE.md"), "utf8"), /How to Read/);
  assert.match(fs.readFileSync(path.join(repo, "AGENTS.md"), "utf8"), /How to Read/);
  assert.equal(count(fs.readFileSync(copilotFile, "utf8"), marker), 1);

  run(["--repo", repo, "--uninstall"]);

  assert.equal(fs.existsSync(path.join(repo, ".claude/skills/how-to-read")), false);
  assert.equal(fs.existsSync(path.join(repo, ".agents/skills/how-to-read")), false);
  assert.equal(fs.existsSync(path.join(repo, ".github/skills/how-to-read")), false);
  assert.equal(fs.existsSync(path.join(repo, ".cursor/rules/how-to-read.mdc")), false);
  assert.equal(
    fs.readFileSync(copilotFile, "utf8"),
    "Keep repository context.\n",
  );
});

test("selective repository uninstall preserves other targets", (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "how-to-read-selective-"));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));

  run(["--repo", repo]);
  run(["--repo", repo, "--only", "cursor", "--uninstall"]);

  assert.ok(fs.existsSync(path.join(repo, ".agents/skills/how-to-read/SKILL.md")));
  assert.ok(fs.existsSync(path.join(repo, ".github/skills/how-to-read/SKILL.md")));
  assert.equal(fs.existsSync(path.join(repo, ".cursor/rules/how-to-read.mdc")), false);
});

test("dry run writes nothing", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "how-to-read-dry-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));

  const result = run(["--home", home, "--dry-run"]);
  assert.match(result.stdout, /\[dry-run\]/);
  assert.deepEqual(fs.readdirSync(home), []);
});

test("npm argument separator is accepted", (t) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "how-to-read-separator-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));

  const result = run(["--", "--home", home, "--dry-run"]);
  assert.match(result.stdout, /\[dry-run\]/);
  assert.deepEqual(fs.readdirSync(home), []);
});

test("unknown targets fail clearly", () => {
  const result = run(["--only", "unknown"], 1);
  assert.match(result.stderr, /Unknown target: unknown/);
});
