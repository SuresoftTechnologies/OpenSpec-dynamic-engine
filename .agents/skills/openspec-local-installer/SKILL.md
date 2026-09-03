---
name: openspec-local-installer
description: Install this repository's customized @fission-ai/openspec CLI for the first time and apply the bundled team workflow to a target repository. Use openspec-local-updater instead when a team installation already exists or legacy team specs need upgrading.
---

# OpenSpec Local Installer

Use this skill for a new installation of the Suresoft team OpenSpec distribution. Guide the user in Korean. Keep command snippets exact and explain only decisions, warnings, and next actions that affect the result.

Do not use this skill to refresh an existing team installation. If the installed `@fission-ai/openspec` package has `openspecDistribution: suresoft-dynamic-engine`, switch to `openspec-local-updater`.

## Required Inputs

Resolve inputs from the request and local context before asking questions:

- **Source repository**: use the current repository when its `package.json` identifies `@fission-ai/openspec` and `suresoft-dynamic-engine`; otherwise ask for its path.
- **Target repository**: use an explicitly named repository. If none is named, ask whether this is CLI-only or which project should receive team config.
- **Install mode**: recommend `global-copy` for ordinary users and `link` for developers who want source edits reflected after rebuild. Ask only when the intent does not imply one.

Check `npm ls -g @fission-ai/openspec --depth=0 --json --long` before installation. An official or missing package is a valid first-time team install. An existing team distribution belongs to the updater skill.

## Install

For an ordinary user with a target project, run:

```powershell
node <source-repo>/.codex/skills/openspec-local-installer/scripts/install-custom-openspec.mjs --repo <source-repo> --mode global-copy --target <target-repo>
```

Use `--mode link` only for source development. Do not add `--migrate-specs` in this fresh-install workflow. If the target contains legacy `대분류_소분류_주제` IDs, route to `openspec-local-updater` so the migration is previewed and approved before files move.

The installer:

- verifies Node and the Suresoft distribution;
- activates the exact pnpm version pinned in `package.json`;
- installs dependencies, builds, and installs or links the CLI globally;
- prints the installed version and executable path;
- applies `docs/team-config` when a target is supplied;
- runs `openspec update`, schema validation, and strict artifact validation.

Do not use `--skip-target-update` or `--skip-target-validation` unless the user explicitly requests a diagnostic-only run. A failed validation means the installation is incomplete; report the failing artifact and leave its files available for correction.

## Team Config Model

The script copies:

```text
docs/team-config/engine.config.yaml
  -> <target>/openspec/config.yaml

docs/team-config/engine-spec-driven/
  -> <target>/openspec/schemas/engine-spec-driven/
```

It backs up a differing existing config and avoids redundant backups when the bytes already match. Explain that config and schema are project-local and that team capability IDs use exactly three kebab-case segments: `대분류/소분류/주제`.

If installation fails or the user mentions pnpm, Corepack, approve-builds, esbuild, PATH, or an unexpected old CLI, read [references/troubleshooting.md](references/troubleshooting.md).
