# Troubleshooting

## pnpm is not found

Try Corepack first:

```powershell
corepack enable
corepack prepare pnpm@9.15.9 --activate
corepack pnpm --version
```

Use the version in this repository's `package.json#packageManager`; `9.15.9` is the version pinned by the v1.11 baseline. Do not silently substitute `pnpm@latest`.

## ERR_PNPM_IGNORED_BUILDS for esbuild

`esbuild` needs an install script for its native binary. Approve it:

```powershell
pnpm approve-builds
```

Select `esbuild` with Space and confirm with Enter.

The v1.11 repository already declares allowed build dependencies. First rerun the reproducible install:

```powershell
corepack pnpm install --force
corepack pnpm run build
```

Do not make ad-hoc `package.json` changes from the installer. If the pinned v1.11 configuration still blocks a build, stop and diagnose the lockfile and dependency policy as a source change.

## Build succeeds but install fails

Run the build separately and then install:

```powershell
corepack pnpm run build
npm link
```

Use this alternative if the user wants a copied global install:

```powershell
npm install -g .
```

## Old openspec still runs

Check what executable is on PATH:

```powershell
where.exe openspec
npm ls -g --depth=0 @fission-ai/openspec openspec
```

Then remove old global installs:

```powershell
npm uninstall -g @fission-ai/openspec
npm uninstall -g openspec
```

Reinstall from the customized repository:

```powershell
npm link
openspec --version
```

## Team config does not appear to apply

Verify the target repository has this structure:

```text
openspec/
  config.yaml
  schemas/
    engine-spec-driven/
      schema.yaml
      templates/
```

Then run:

```powershell
openspec schemas
openspec schema validate engine-spec-driven
openspec templates
openspec update
openspec validate --all --strict --no-interactive
```

## Official update would replace the team build

This distribution intentionally suppresses the official npm self-update offer. Upgrade by pulling the approved team repository branch and rerunning `install-custom-openspec.mjs`. If `openspec` still offers an official update, check `where.exe openspec`; an older or official executable is probably earlier on PATH.

## Spec migration refuses to run

Run a dry run and resolve every reported invalid ID or collision before using `--write`:

```powershell
node .codex/skills/openspec-local-installer/scripts/migrate-team-spec-paths.mjs --target D:\path\to\target-repo
```

Archived changes are intentionally not migrated. The script updates only files below `openspec/`; inspect application code or external documentation separately if it refers to legacy IDs.
