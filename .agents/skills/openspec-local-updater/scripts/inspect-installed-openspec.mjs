#!/usr/bin/env node
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const globalRoot = args["global-root"]
  ? resolve(args["global-root"])
  : capture("npm", ["root", "-g"]).stdout.trim();
const packagePath = join(globalRoot, "@fission-ai", "openspec");
const executablePaths = resolveExecutablePaths();
const cliVersion =
  capture("openspec", ["--version"], { allowFailure: true }).stdout.trim() ||
  null;

if (!existsSync(join(packagePath, "package.json"))) {
  print({
    installed: false,
    packagePath,
    cliVersion,
    executablePaths,
  });
  process.exit(0);
}

const packageJson = JSON.parse(
  readFileSync(join(packagePath, "package.json"), "utf8")
);
const realPackagePath = realpathSync.native(packagePath);
const linked =
  lstatSync(packagePath).isSymbolicLink() ||
  !samePath(packagePath, realPackagePath);
let sourceRepo = linked ? realPackagePath : null;
let sourceEvidence = linked ? "global-package-link" : null;

if (!sourceRepo && !args["global-root"]) {
  const resolvedSource = readResolvedSourceFromNpm();
  if (resolvedSource && existsSync(join(resolvedSource, "package.json"))) {
    sourceRepo = resolvedSource;
    sourceEvidence = "npm-resolved-file";
  }
}

print({
  installed: true,
  packageName: packageJson.name ?? null,
  packageVersion: packageJson.version ?? null,
  distribution: packageJson.openspecDistribution ?? "official-or-unknown",
  isTeamDistribution:
    packageJson.openspecDistribution === "suresoft-dynamic-engine",
  installMode: linked ? "link" : "global-copy",
  packagePath,
  realPackagePath,
  sourceRepo,
  sourceEvidence,
  cliVersion,
  executablePaths,
});

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function readResolvedSourceFromNpm() {
  const result = capture(
    "npm",
    ["ls", "-g", "@fission-ai/openspec", "--depth=0", "--json", "--long"],
    { allowFailure: true }
  );
  if (!result.stdout.trim()) return null;

  try {
    const parsed = JSON.parse(result.stdout);
    const resolvedValue =
      parsed.dependencies?.["@fission-ai/openspec"]?.resolved;
    if (typeof resolvedValue !== "string" || !resolvedValue.startsWith("file:"))
      return null;
    return resolve(decodeURIComponent(resolvedValue.slice("file:".length)));
  } catch {
    return null;
  }
}

function resolveExecutablePaths() {
  const command = process.platform === "win32" ? "where.exe" : "which";
  const result = capture(command, ["openspec"], { allowFailure: true });
  return result.stdout
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function samePath(left, right) {
  const normalizedLeft = normalize(resolve(left));
  const normalizedRight = normalize(resolve(right));
  return process.platform === "win32"
    ? normalizedLeft.toLowerCase() === normalizedRight.toLowerCase()
    : normalizedLeft === normalizedRight;
}

function capture(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const status = result.status ?? 1;
  if (status !== 0 && !options.allowFailure) {
    const detail = (result.stderr ?? "").trim();
    fail(
      `${command} ${commandArgs.join(" ")} failed${detail ? `: ${detail}` : ""}`
    );
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "", status };
}

function print(result) {
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Installed: ${result.installed ? "yes" : "no"}`);
  if (result.packageVersion)
    console.log(`Package version: ${result.packageVersion}`);
  if (result.distribution) console.log(`Distribution: ${result.distribution}`);
  if (result.installMode) console.log(`Install mode: ${result.installMode}`);
  if (result.sourceRepo) console.log(`Source repository: ${result.sourceRepo}`);
  if (result.cliVersion) console.log(`CLI version: ${result.cliVersion}`);
  for (const executablePath of result.executablePaths ?? []) {
    console.log(`Executable: ${executablePath}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
