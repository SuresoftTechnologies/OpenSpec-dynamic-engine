# Troubleshooting

## pnpm is not found

Try Corepack first:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

If Corepack does not work:

```powershell
npm install -g pnpm
pnpm --version
```

## ERR_PNPM_IGNORED_BUILDS for esbuild

`esbuild` needs an install script for its native binary. Approve it:

```powershell
pnpm approve-builds
```

Select `esbuild` with Space and confirm with Enter.

For non-interactive installs, add this to the OpenSpec repository's `package.json`:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
}
```

Then rerun:

```powershell
pnpm install
pnpm run build
```

## Build succeeds but install fails

Run the build separately and then install:

```powershell
pnpm run build
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
```
