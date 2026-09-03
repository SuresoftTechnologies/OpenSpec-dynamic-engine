---
name: openspec-upstream-upgrader
description: Integrate a selected official OpenSpec release into the Suresoft team source repository while auditing and preserving every registered team customization. Use for maintainer-level upstream source upgrades, not for refreshing an installed CLI or a product repository.
---

# OpenSpec Upstream Upgrader

Use this skill for a new official OpenSpec tag or ref that must be integrated into the team source repository. Guide the user in Korean.

This is a maintainer workflow. For updating an already installed team CLI from an approved team checkout, use `openspec-local-updater` instead.

## Load the Preservation Contract

Read [the team customization registry](../../../docs/team-customizations.md) completely before comparing refs or editing files. Treat every stable customization ID as an audit item. Follow its linked main specs as the behavioral source of truth and use its implementation paths, tests, and upstream hotspots to scope investigation.

Also inspect the active or archived OpenSpec change for the last upstream integration. Do not infer the customization set from Git diff alone.

## Resolve Inputs Before Mutation

Discover the team source from the current checkout when `package.json` identifies both `@fission-ai/openspec` and `suresoft-dynamic-engine`. Otherwise ask for the source repository path.

Require these inputs and ask only for values that cannot be proven:

1. **Exact target upstream tag or ref.** If the user says "latest", fetch official refs and release metadata, present the resolved tag and commit, and obtain confirmation before integration. Never substitute `upstream/main` for a release request.
2. **Working branch or worktree.** Use the user's named branch/worktree. If none is named, propose a dedicated upgrade branch based on the team default branch and ask before creating it.
3. **OpenSpec change.** Continue an explicitly named upgrade change or create a version-specific change that records the integration and customization audit.

Inspect before any merge:

```powershell
git status --short --branch
git remote -v
git rev-parse --verify <current-baseline>^{commit}
git rev-parse --verify <target-upstream-ref>^{commit}
```

The expected official remote is recorded in the registry. Fetching configured remotes and tags is allowed when the user asks to resolve or integrate a current upstream release. Adding or rewriting a remote requires confirmation.

Do not stash, reset, discard changes, switch branches, rebase team history, or resolve divergence automatically. If the checkout is dirty or the branch is unsuitable, stop before mutation and ask whether to create a dedicated worktree or how the user wants existing work preserved.

## Build the Upgrade Audit

Before merging, compare the registry baseline, target ref, and current team branch. At minimum inspect:

```powershell
git log --oneline <current-baseline>..<target-upstream-ref>
git diff --name-status <current-baseline>..<target-upstream-ref>
git diff --name-status <current-baseline>...HEAD
```

Record an audit table in the upgrade change's `design.md` or an adjacent change artifact with one row for every registry ID:

| Customization ID | Status | Upstream impact | Planned adaptation | Evidence |
| ---------------- | ------ | --------------- | ------------------ | -------- |

Allowed statuses are `preserved`, `adapted`, `removed`, and `not-applicable`.

- `preserved`: behavior and its test remain valid without a team code change.
- `adapted`: implementation changes while the linked contract remains satisfied.
- `removed`: contract or user-visible behavior will be removed. Explain impact and alternatives, then require explicit user approval and a corresponding spec change before proceeding.
- `not-applicable`: the upstream release does not touch the customization; cite the comparison evidence.

Do not mark the audit complete while any registry ID is absent or lacks evidence.

## Integrate and Adapt

Show the resolved target commit, branch/worktree, anticipated conflicts, and audit plan immediately before the merge. Obtain confirmation if the user has not already authorized integrating that exact ref into that exact workspace.

Use a merge commit from the exact official tag/ref by default, preserving the repository's established integration strategy. Do not globally choose `ours` or `theirs` for conflicts. Resolve each conflict against both the upstream behavior and the linked team contract:

1. retain the new upstream architecture and safety boundaries;
2. reattach team policy through public extension points where possible;
3. keep enforced team behavior in focused validators or commands only where configuration cannot enforce it;
4. add or update focused regression tests for every `adapted` item;
5. update registry paths and hotspots when the implementation moves.

If the upstream change makes a team requirement invalid or contradictory, pause and update the OpenSpec design/spec with the user before continuing.

## Validate and Close

Run focused tests for every affected customization, then run the repository's full build, tests, lint, and strict validation for the upgrade change. Record commands, results, known unrelated failures, product-repository migration needs, and the final disposition of every customization ID.

Update the registry's official baseline only after the integration and required validations succeed. Do not claim completion based only on a clean merge.

Push or open a PR only when requested or already part of the authorized upgrade workflow. Keep the upgrade change active while its implementation PR is open. After the PR is confirmed merged, archive the change so delta specs become main specs, then verify the promoted specs and registry links.

Do not reinstall user environments or modify product repositories as an implicit side effect. After the team source upgrade is approved, use `openspec-local-updater` for each requested user or product checkout.

## Report

Report in Korean:

- previous and new official refs with resolved commits;
- team branch/worktree and merge commit;
- the complete customization disposition table;
- conflict resolutions and spec or registry updates;
- focused and full validation results;
- product migrations, PR, and archive state;
- remaining decisions or manual steps.
