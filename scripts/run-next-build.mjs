import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const workspaceRoot = process.cwd();
const nativeRoot = realpathSync.native(workspaceRoot);
const runsFromWindowsShare =
  process.platform === "win32" && nativeRoot.startsWith("\\\\");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${path.basename(command)} ${args.join(" ")} exited with status ${result.status ?? "unknown"}`,
    );
  }
}

function runDirectBuild() {
  const nextCli = path.join(
    workspaceRoot,
    "node_modules/next/dist/bin/next",
  );
  run(process.execPath, [nextCli, "build"], workspaceRoot);
}

function assertTemporaryPath(candidate, prefix) {
  const relative = path.relative(tmpdir(), candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify non-temporary path: ${candidate}`);
  }

  if (!path.basename(candidate).startsWith(prefix)) {
    throw new Error(`Unexpected temporary path: ${candidate}`);
  }
}

function ensureDependencyCache(lockHash) {
  const dependencyRoot = path.join(
    tmpdir(),
    `nordic-next-deps-${lockHash.slice(0, 16)}`,
  );
  const readyMarker = path.join(dependencyRoot, ".ready");

  if (existsSync(readyMarker)) return dependencyRoot;

  assertTemporaryPath(dependencyRoot, "nordic-next-deps-");
  rmSync(dependencyRoot, { recursive: true, force: true });
  mkdirSync(dependencyRoot, { recursive: true });

  for (const fileName of ["package.json", "package-lock.json"]) {
    cpSync(
      path.join(workspaceRoot, fileName),
      path.join(dependencyRoot, fileName),
    );
  }

  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    throw new Error("npm_execpath is unavailable; run this build through npm.");
  }

  run(
    process.execPath,
    [
      npmCli,
      "ci",
      "--cache",
      path.join(tmpdir(), "nordic-next-npm-cache"),
      "--prefer-offline",
      "--no-audit",
      "--no-fund",
    ],
    dependencyRoot,
  );
  writeFileSync(readyMarker, `${lockHash}\n`, "utf8");

  return dependencyRoot;
}

function runStagedWindowsBuild() {
  const lockFile = path.join(workspaceRoot, "package-lock.json");
  const lockHash = createHash("sha256")
    .update(readFileSync(lockFile))
    .digest("hex");
  const dependencyRoot = ensureDependencyCache(lockHash);
  const stageRoot = mkdtempSync(path.join(tmpdir(), "nordic-next-build-"));
  const stageModules = path.join(stageRoot, "node_modules");

  console.log(
    `[build] Windows shared filesystem detected (${nativeRoot}). Building from ${stageRoot}.`,
  );

  try {
    for (const directoryName of ["src", "public"]) {
      cpSync(
        path.join(workspaceRoot, directoryName),
        path.join(stageRoot, directoryName),
        { recursive: true },
      );
    }

    for (const fileName of [
      "package.json",
      "package-lock.json",
      "next.config.ts",
      "tsconfig.json",
      "postcss.config.mjs",
      "next-env.d.ts",
    ]) {
      cpSync(path.join(workspaceRoot, fileName), path.join(stageRoot, fileName));
    }

    symlinkSync(
      path.join(dependencyRoot, "node_modules"),
      stageModules,
      "junction",
    );

    const nextCli = path.join(stageModules, "next/dist/bin/next");
    run(process.execPath, [nextCli, "build", "--webpack"], stageRoot);

    const stagedOut = path.join(stageRoot, "out");
    if (!existsSync(path.join(stagedOut, "index.html"))) {
      throw new Error("Staged Next build did not produce out/index.html");
    }

    const workspaceOut = path.join(workspaceRoot, "out");
    rmSync(workspaceOut, { recursive: true, force: true });
    cpSync(stagedOut, workspaceOut, { recursive: true });
  } finally {
    if (existsSync(stageModules)) unlinkSync(stageModules);
    assertTemporaryPath(stageRoot, "nordic-next-build-");
    rmSync(stageRoot, { recursive: true, force: true });
  }
}

if (runsFromWindowsShare) {
  runStagedWindowsBuild();
} else {
  runDirectBuild();
}
