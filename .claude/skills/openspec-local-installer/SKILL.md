---
name: openspec-local-installer
description: Install this repository's customized @fission-ai/openspec CLI and apply bundled team configuration to a target OpenSpec project, guiding the user in Korean. Use when the user asks to remove/reinstall OpenSpec from this repo, fix pnpm/corepack/esbuild approve-builds install issues, link the local customized CLI globally, or copy docs/team-config into another repository's openspec/config.yaml and openspec/schemas/engine-spec-driven.
---

# OpenSpec Local Installer

Use this skill to install the customized OpenSpec CLI from this repository and prepare another repository to use the bundled `engine-spec-driven` team workflow.

Guide the user in Korean by default. Keep command snippets exact, but explain what each step does, warnings, and next actions in Korean.

## Quick Workflow

1. Find the customized OpenSpec repository root. It must contain `package.json` with `name: "@fission-ai/openspec"`.
2. Run the installer script from that repository. If the user has a target repository, pass `--target` so installation, team-config application, and `openspec update` happen in one flow:

   ```powershell
   node .codex/skills/openspec-local-installer/scripts/install-custom-openspec.mjs --repo D:\src\OpenSpec-dynamic-engine --mode link --target D:\path\to\target-repo
   ```

3. If the user installed first and wants team config applied later, run:

   ```powershell
   node .codex/skills/openspec-local-installer/scripts/apply-team-config.mjs --source D:\src\OpenSpec-dynamic-engine --target D:\path\to\target-repo
   ```

4. If team config was applied with the standalone script, refresh generated agent guidance:

   ```powershell
   cd D:\path\to\target-repo
   openspec update
   ```

## Installer Behavior

Prefer `--mode link` during development because changes in this repository are reflected after rebuilding.

Use `--mode global-copy` only when the user wants a copied global install.

The installer:
- checks Node version;
- enables `pnpm` through Corepack when needed;
- falls back to `npm install -g pnpm` when Corepack cannot activate pnpm;
- runs `pnpm install`;
- handles pnpm's `ERR_PNPM_IGNORED_BUILDS` pitfall for `esbuild`;
- runs `pnpm run build`;
- removes the previous global `@fission-ai/openspec` install unless `--skip-uninstall` is passed;
- runs either `npm link` or `npm install -g .`;
- verifies `openspec --version` and prints the resolved executable path.
- applies bundled team config when `--target <repo>` is passed;
- runs `openspec update` in the target repository unless `--skip-target-update` is passed.

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

After applying config, explain this model to the user:
- `openspec/config.yaml` is project-local, not machine-global.
- `schema: engine-spec-driven` selects the project-local schema.
- `engine-spec-driven/schema.yaml` replaces the default `spec-driven` instructions; default instructions are not inherited.
- `config.yaml` contributes `context` and artifact-specific `rules` to `openspec instructions`.

## Troubleshooting

Read `references/troubleshooting.md` when installation fails or the user mentions `pnpm`, `corepack`, `approve-builds`, `esbuild`, PATH, or an old `openspec` still being used.
