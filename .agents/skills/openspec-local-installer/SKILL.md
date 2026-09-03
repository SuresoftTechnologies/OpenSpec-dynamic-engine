---
name: openspec-local-installer
description: Install this repository's customized @fission-ai/openspec CLI, apply bundled team configuration, and migrate legacy team spec IDs to three-depth nested paths in a target project, guiding the user in Korean.
---

# OpenSpec Local Installer

Use this skill to install the customized OpenSpec CLI from this repository and prepare another repository to use the bundled `engine-spec-driven` team workflow.

Guide the user in Korean by default. Keep command snippets exact, but explain what each step does, warnings, and next actions in Korean.

## Quick Workflow

1. Find the customized OpenSpec repository root. It must contain `package.json` with `name: "@fission-ai/openspec"`.
2. Run the installer script from that repository. If the user has a target repository, pass `--target` so installation, team-config application, `openspec update`, schema validation, and strict project validation happen in one flow. Add `--migrate-specs` only after reviewing the dry run described below:

   ```powershell
   node .codex/skills/openspec-local-installer/scripts/install-custom-openspec.mjs --repo D:\src\OpenSpec-dynamic-engine --mode link --target D:\path\to\target-repo --migrate-specs
   ```

3. If the user installed first and wants team config applied later, run:

   ```powershell
   node .codex/skills/openspec-local-installer/scripts/apply-team-config.mjs --source D:\src\OpenSpec-dynamic-engine --target D:\path\to\target-repo
   ```

4. Preview legacy team spec migration before applying it independently:

   ```powershell
   node .codex/skills/openspec-local-installer/scripts/migrate-team-spec-paths.mjs --target D:\path\to\target-repo
   node .codex/skills/openspec-local-installer/scripts/migrate-team-spec-paths.mjs --target D:\path\to\target-repo --write
   ```

5. If team config or migration was applied with a standalone script, refresh generated agent guidance and validate:

   ```powershell
   cd D:\path\to\target-repo
   openspec update
   openspec schema validate engine-spec-driven
   openspec validate --all --strict --no-interactive
   ```

## Installer Behavior

Prefer `--mode link` during development because changes in this repository are reflected after rebuilding.

Use `--mode global-copy` only when the user wants a copied global install.

The installer:
- checks Node version and verifies this is the Suresoft team distribution;
- activates the exact `pnpm` version pinned in `package.json` through Corepack;
- runs `corepack pnpm install --force` and `corepack pnpm run build`;
- removes the previous global `@fission-ai/openspec` install unless `--skip-uninstall` is passed;
- runs either `npm link` or `npm install -g .`;
- verifies `openspec --version` and prints the resolved executable path.
- applies bundled team config when `--target <repo>` is passed;
- migrates legacy `대분류_소분류_주제` IDs when `--migrate-specs` is passed;
- runs `openspec update` unless `--skip-target-update` is passed;
- validates the team schema and all artifacts strictly unless `--skip-target-validation` is passed.

The team distribution does not offer the official npm self-update path. Upgrade by pulling this repository's reviewed release branch and rerunning the installer so team patches are never replaced by the official package.

If the user does not provide a target repository path, ask whether they want to apply the bundled `docs/team-config` to a working repository. Do not assume the OpenSpec source repository is the target repository.

## Team Config Behavior

The team config script copies:

```text
docs/team-config/engine.config.yaml
  -> <target>/openspec/config.yaml

docs/team-config/engine-spec-driven/
  -> <target>/openspec/schemas/engine-spec-driven/
```

If `<target>/openspec/config.yaml` already exists, the script backs it up before overwriting unless `--no-backup` is passed.
If the file already matches the bundled config, it is left untouched and no redundant backup is created.

After applying config, explain this model to the user:
- `openspec/config.yaml` is project-local, not machine-global.
- `schema: engine-spec-driven` selects the project-local schema.
- `engine-spec-driven/schema.yaml` replaces the default `spec-driven` instructions; default instructions are not inherited.
- `config.yaml` contributes `context` and artifact-specific `rules` to `openspec instructions`.
- Team capability IDs use exactly three nested kebab-case segments: `대분류/소분류/주제`.

## Spec Migration Behavior

The migration script scans main specs and active change delta specs, but never archived changes. It:

- accepts legacy IDs only when they contain exactly three valid underscore-separated segments;
- maps them to the equivalent three-depth path;
- updates active OpenSpec text references;
- checks invalid IDs and destination collisions before changing anything;
- runs as a dry run unless `--write` is supplied and rolls back partial work on failure.

Commit or otherwise preserve the target repository state before using `--write`. Review the printed mapping because application source imports or links outside `openspec/` are intentionally not rewritten.

## Troubleshooting

Read `references/troubleshooting.md` when installation fails or the user mentions `pnpm`, `corepack`, `approve-builds`, `esbuild`, PATH, or an old `openspec` still being used.
