import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");
}

test("canonical skill contains the adaptive response contract", () => {
  const skill = read("skills/how-to-read/SKILL.md");
  const required = [
    "smallest complete answer",
    "For a novice",
    "For an experienced reader",
    "less bold",
    "no diagrams",
    "one step at a time",
    "because",
    "however",
    "therefore",
    "before",
    "after",
    "Do not add emphasis to meet a quota",
    "20% (about 1 in 5)",
    "Never make a visual the only carrier",
    "complete copyable code",
    "Activate learning support",
    "Do not quiz the user during an ordinary answer",
  ];

  for (const phrase of required) {
    assert.ok(skill.includes(phrase), `missing skill contract: ${phrase}`);
  }

  assert.doesNotMatch(
    skill,
    /3-5 lines|15 words|2-4 key words|10 lines|complete reasoning/i,
  );
  assert.ok(skill.trim().split(/\s+/).length <= 760, "skill should stay concise");
});

test("README makes calibrated claims and links to supporting research", () => {
  const readme = read("README.md");
  const requiredLinks = [
    "docs/RESEARCH.md",
    "https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/",
    "https://www.w3.org/WAI/WCAG22/Techniques/general/G153",
    "https://eric.ed.gov/?id=EJ1334669",
    "https://doi.org/10.1016/j.learninstruc.2025.102142",
    "https://doi.org/10.1016/j.edurev.2015.12.003",
    "https://doi.org/10.1007/s10648-018-9456-4",
    "https://pubmed.ncbi.nlm.nih.gov/21252317/",
    "https://doi.org/10.1016/j.actpsy.2024.104304",
    "https://doi.org/10.1007/s11881-017-0154-6",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233/",
  ];

  assert.match(readme, /designed to be easier to understand/i);
  assert.match(readme, /not medical treatment/i);
  assert.match(readme, /does not prove that every AI response/i);
  assert.doesNotMatch(readme, /Every AI response becomes easier to read/);

  for (const link of requiredLinks) {
    assert.ok(readme.includes(link), `README is missing research link: ${link}`);
  }
});

test("research notes map evidence to rules and link back", () => {
  const research = read("docs/RESEARCH.md");

  assert.match(research, /\[Back to the README\]\(\.\.\/README\.md\)/);
  assert.match(
    research,
    /\[View the canonical skill\]\(\.\.\/skills\/how-to-read\/SKILL\.md\)/,
  );
  assert.match(research, /Evidence-to-rule mapping/);
  assert.match(research, /informed design inference/);
  assert.match(research, /authoritative accessibility guidance/);
  assert.match(research, /Meta-analyses/);
  assert.match(research, /Individual studies/);
  assert.match(research, /User testing remains necessary/);
});

test("local Markdown links resolve", () => {
  const markdownFiles = [
    "README.md",
    "INSTALL.md",
    "SECURITY.md",
    "docs/RESEARCH.md",
    "skills/how-to-read/SKILL.md",
  ];
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const relative of markdownFiles) {
    const markdown = read(relative);
    for (const match of markdown.matchAll(linkPattern)) {
      const target = match[1].replace(/^<|>$/g, "").split("#", 1)[0];
      if (!target || /^(?:https?:|mailto:)/i.test(target)) {
        continue;
      }

      const resolved = path.resolve(root, path.dirname(relative), target);
      assert.ok(
        fs.existsSync(resolved),
        `${relative} contains a missing local link: ${target}`,
      );
    }
  }
});
