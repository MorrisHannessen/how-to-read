# Install How to Read

The default installer configures all supported platforms.
It needs Node.js 18 or newer.

## Preview first

```bash
npx -y github:MorrisHannessen/how-to-read -- --dry-run
```

## Install all platforms

```bash
npx -y github:MorrisHannessen/how-to-read
```

## Install one platform

```bash
npx -y github:MorrisHannessen/how-to-read -- --only claude
npx -y github:MorrisHannessen/how-to-read -- --only codex
npx -y github:MorrisHannessen/how-to-read -- --only cursor
npx -y github:MorrisHannessen/how-to-read -- --only copilot
```

Repeat `--only` to select several platforms.

## Add it to one repository

Run this inside the target repository:

```bash
npx -y github:MorrisHannessen/how-to-read -- --repo .
```

This creates native repository files:

- `.claude/skills/how-to-read`
- `.agents/skills/how-to-read`
- `.github/skills/how-to-read`
- `.cursor/rules/how-to-read.mdc`
- `.github/copilot-instructions.md`
- `CLAUDE.md` and `AGENTS.md` managed blocks

Existing Markdown stays in place.
Only the fenced How to Read block changes.

## Native plugin installs

**Claude Code**

```bash
claude plugin marketplace add MorrisHannessen/how-to-read
claude plugin install how-to-read@how-to-read
```

**GitHub Copilot CLI**

```bash
copilot plugin marketplace add MorrisHannessen/how-to-read
copilot plugin install how-to-read@how-to-read
```

**Codex**

```bash
codex plugin marketplace add MorrisHannessen/how-to-read
codex plugin add how-to-read@how-to-read
```

The unified installer remains the simplest always-on setup.

## Uninstall

```bash
npx -y github:MorrisHannessen/how-to-read -- --uninstall
```

For one repository:

```bash
npx -y github:MorrisHannessen/how-to-read -- --repo . --uninstall
```

The uninstaller removes owned skill folders.
It removes only the fenced block from shared instruction files.

## All options

```text
--only <target>   Install one target. Repeat for several.
--repo <path>     Install repository-level skills and rules.
--dry-run         Show changes without writing.
--uninstall, -u   Remove owned files and managed blocks.
--list            List supported targets.
--home <path>     Override the home directory.
--help, -h        Show help.
```
