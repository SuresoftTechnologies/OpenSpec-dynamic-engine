import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = join(import.meta.dirname, "..", "..");
const registryPath = join(repositoryRoot, "docs", "team-customizations.md");
const expectedCustomizationIds = [
  "TEAM-CAPABILITY-001",
  "TEAM-DISTRIBUTION-001",
  "TEAM-JIRA-ARCHIVE-001",
  "TEAM-LOCAL-DISTRIBUTION-001",
  "TEAM-POLICY-001",
  "TEAM-SPEC-MIGRATION-001",
  "TEAM-UPSTREAM-UPGRADE-001",
];

describe("team customization registry", () => {
  it("keeps a unique detail section for every registered customization", () => {
    const registry = readFileSync(registryPath, "utf8");
    const detailIds = Array.from(
      registry.matchAll(/^### (TEAM-[A-Z-]+-\d{3}) — /gm),
      (match) => match[1]
    );

    expect([...detailIds].sort()).toEqual(expectedCustomizationIds);
    expect(new Set(detailIds).size).toBe(detailIds.length);
  });

  it("resolves every local evidence link from the registry", () => {
    const registry = readFileSync(registryPath, "utf8");
    const targets = Array.from(
      registry.matchAll(/\[[^\]]+\]\(([^)]+)\)/g),
      (match) => match[1]
    ).filter((target) => !/^[a-z]+:/i.test(target) && !target.startsWith("#"));

    expect(targets.length).toBeGreaterThan(20);
    for (const target of targets) {
      const pathWithoutAnchor = decodeURIComponent(target.split("#", 1)[0]);
      const resolvedPath = resolve(dirname(registryPath), pathWithoutAnchor);
      expect(existsSync(resolvedPath), `${target} should resolve`).toBe(true);
    }
  });

  it("makes the registry discoverable from the root agent instructions", () => {
    const instructions = readFileSync(
      join(repositoryRoot, "AGENTS.md"),
      "utf8"
    );

    expect(instructions).toContain(
      "[docs/team-customizations.md](docs/team-customizations.md)"
    );
    expect(instructions).toContain("openspec-upstream-upgrader");
  });
});
