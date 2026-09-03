import { afterEach, describe, expect, it } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve(
  ".codex/skills/openspec-local-updater/scripts/inspect-installed-openspec.mjs"
);
const tempDirectories: string[] = [];

describe("installed team OpenSpec inspector", () => {
  afterEach(() => {
    for (const directory of tempDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("reports a missing scoped package without failing", () => {
    const globalRoot = makeTempDirectory();

    const result = inspect(globalRoot);

    expect(result.status).toBe(0);
    expect(result.json.installed).toBe(false);
  });

  it("distinguishes a copied team distribution from an official package", () => {
    const teamRoot = makeTempDirectory();
    writePackage(teamRoot, {
      name: "@fission-ai/openspec",
      version: "1.10.0-team.2",
      openspecDistribution: "suresoft-dynamic-engine",
    });

    const team = inspect(teamRoot);

    expect(team.status).toBe(0);
    expect(team.json).toMatchObject({
      installed: true,
      packageVersion: "1.10.0-team.2",
      distribution: "suresoft-dynamic-engine",
      isTeamDistribution: true,
      installMode: "global-copy",
      sourceRepo: null,
    });

    const officialRoot = makeTempDirectory();
    writePackage(officialRoot, {
      name: "@fission-ai/openspec",
      version: "1.11.0",
    });

    const official = inspect(officialRoot);

    expect(official.status).toBe(0);
    expect(official.json.isTeamDistribution).toBe(false);
    expect(official.json.distribution).toBe("official-or-unknown");
  });

  it("reports the proven source repository for a linked installation", () => {
    const globalRoot = makeTempDirectory();
    const sourceRepo = makeTempDirectory();
    const packagePath = join(globalRoot, "@fission-ai", "openspec");
    writePackageAt(sourceRepo, {
      name: "@fission-ai/openspec",
      version: "1.11.0-team.1",
      openspecDistribution: "suresoft-dynamic-engine",
    });
    mkdirSync(dirname(packagePath), { recursive: true });
    symlinkSync(
      sourceRepo,
      packagePath,
      process.platform === "win32" ? "junction" : "dir"
    );

    const result = inspect(globalRoot);

    expect(result.status).toBe(0);
    expect(result.json.installMode).toBe("link");
    expect(result.json.sourceEvidence).toBe("global-package-link");
    expect(resolve(result.json.sourceRepo as string)).toBe(resolve(sourceRepo));
  });
});

function makeTempDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "openspec-install-inspector-"));
  tempDirectories.push(directory);
  return directory;
}

function writePackage(
  globalRoot: string,
  packageJson: Record<string, string>
): void {
  writePackageAt(join(globalRoot, "@fission-ai", "openspec"), packageJson);
}

function writePackageAt(
  packagePath: string,
  packageJson: Record<string, string>
): void {
  mkdirSync(packagePath, { recursive: true });
  writeFileSync(
    join(packagePath, "package.json"),
    JSON.stringify(packageJson),
    "utf8"
  );
}

function inspect(globalRoot: string): {
  status: number | null;
  json: Record<string, unknown>;
} {
  const result = spawnSync(
    process.execPath,
    [script, "--global-root", globalRoot, "--json"],
    { encoding: "utf8" }
  );
  return {
    status: result.status,
    json: JSON.parse(result.stdout) as Record<string, unknown>,
  };
}
