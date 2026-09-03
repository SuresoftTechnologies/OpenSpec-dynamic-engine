import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = join(import.meta.dirname, "..", "..");
const skillRoots = [".codex", ".claude", ".agents"];
const skillNames = [
  "openspec-local-installer",
  "openspec-local-updater",
  "openspec-upstream-upgrader",
];

function listFiles(root: string, directory = root): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? listFiles(root, path)
        : [relative(root, path)];
    })
    .sort();
}

describe("local OpenSpec skill distribution", () => {
  for (const skillName of skillNames) {
    it(`keeps every ${skillName} copy identical`, () => {
      const canonicalRoot = join(repositoryRoot, ".codex", "skills", skillName);
      const expectedFiles = listFiles(canonicalRoot);

      for (const skillRoot of skillRoots.slice(1)) {
        const mirrorRoot = join(repositoryRoot, skillRoot, "skills", skillName);
        expect(listFiles(mirrorRoot)).toEqual(expectedFiles);

        for (const file of expectedFiles) {
          expect(readFileSync(join(mirrorRoot, file))).toEqual(
            readFileSync(join(canonicalRoot, file))
          );
        }
      }
    });
  }
});
