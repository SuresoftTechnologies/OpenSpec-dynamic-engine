---
name: openspec-local-updater
description: Update an existing Suresoft team OpenSpec installation from its source repository, refresh project config and generated skills, and safely migrate legacy team spec paths. Use for upgrades or reinstalls, not first-time team installation.
---

# OpenSpec Local Updater

Use this skill when a previous Suresoft team OpenSpec version is already installed or when an existing team project must move to the current repository version. Guide the user in Korean.

This skill updates from a reviewed local source checkout. It never replaces the team distribution with the official npm package and never invents a branch or release ref.

## Discover Before Asking

Run the read-only inspector first:

```powershell
node <source-repo>/.codex/skills/openspec-local-updater/scripts/inspect-installed-openspec.mjs --json
```

If the source repository is not yet known, locate the script from the current team repository or ask for that repository path. Use the inspector result to determine:

- installed version and whether it is `suresoft-dynamic-engine`;
- current executable paths;
- existing mode (`link` or `global-copy`);
- linked source repository when it can be proven.

If no team distribution is installed, stop this workflow and use `openspec-local-installer`. If an official OpenSpec package is installed, explain that switching to the team distribution is a first-time team installation.

Ask only for information that remains unresolved:

1. **Source repository path**, when it cannot be proven from the current checkout or installed link.
2. **Source branch or ref**, only when the user requests a particular release or the checkout has no usable tracking branch. Never assume `main`.
3. **Target repository**, when the request does not say whether to update the CLI only or also refresh a project.
4. **Install mode**, only when the existing mode is unknown. Preserve the detected mode by default; otherwise recommend `global-copy` for users and `link` for CLI developers.

## Prepare the Source Checkout

Inspect:

```powershell
git -C <source-repo> status --short --branch
git -C <source-repo> remote -v
```

When the user asks for the latest tracked revision, fetch the configured remote. Fast-forward only when the checkout is clean, the current branch has an upstream, and no divergence exists:

```powershell
git -C <source-repo> pull --ff-only
```

Do not stash, reset, discard changes, switch branches, or resolve divergence automatically. Report the exact state and ask the user what to preserve when any of those actions would be required.

## Preview Project Migration

If a target repository is included, inspect its Git status and preview legacy path migration before running the updater:

```powershell
git -C <target-repo> status --short --branch
node <source-repo>/.codex/skills/openspec-local-installer/scripts/migrate-team-spec-paths.mjs --target <target-repo>
```

- If the preview lists no moves, update without `--migrate-specs`.
- If moves are listed, summarize the mapping. Use `--migrate-specs` only when the user explicitly requested migration or confirms after seeing the preview.
- Require the target changes to be committed or otherwise safely preserved before moving specs.
- Archived changes remain untouched; application references outside `openspec/` are not rewritten automatically.

## Update

Run the shared installer with the detected or selected mode:

```powershell
node <source-repo>/.codex/skills/openspec-local-installer/scripts/install-custom-openspec.mjs --repo <source-repo> --mode <link-or-global-copy> --target <target-repo>
```

Append `--migrate-specs` only after the preview decision. Omit `--target` for a CLI-only update. Do not use the official OpenSpec self-update path.

The command rebuilds and reinstalls the current source, applies the latest team config, refreshes generated agent guidance, validates `engine-spec-driven`, and validates all active artifacts strictly. A differing target config is backed up automatically.

For multiple target repositories, update the CLI once, then process targets one at a time with the installer's config/migration scripts followed by `openspec update` and validation. This keeps each repository's migration decision and failure isolated.

## Report

Report:

- previous and current team CLI versions;
- source path, branch/ref, and commit used;
- preserved or selected install mode and resolved executable path;
- each target updated, any config backup, and every migrated path;
- schema and strict validation results;
- any remaining manual action, especially references outside `openspec/`.

If installation fails or the user mentions pnpm, Corepack, approve-builds, esbuild, PATH, or an unexpected old CLI, read [the shared troubleshooting guide](../openspec-local-installer/references/troubleshooting.md).
