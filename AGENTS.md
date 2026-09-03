# Repository Agent Instructions

## Preserve Team Customizations

Before analyzing, merging, rebasing, or otherwise integrating a new official OpenSpec version:

1. Read [docs/team-customizations.md](docs/team-customizations.md) completely.
2. Use the `openspec-upstream-upgrader` skill. Do not use `openspec-local-updater` for an upstream source integration; that skill only refreshes an installed team CLI and project files from an already approved source checkout.
3. Work from an exact user-selected upstream tag or ref in a clean dedicated branch or worktree.
4. Account for every customization ID in the registry as `preserved`, `adapted`, `removed`, or `not-applicable`. Never remove a team customization without explicit user approval.
5. Update the registry when a customization's contract, source-of-truth spec, implementation path, tests, conflict hotspots, or integrated upstream baseline changes.

Do not archive an upstream-upgrade change until its implementation PR is merged. Archive it afterward so delta specs become main specs.
