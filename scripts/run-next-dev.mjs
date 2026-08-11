import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDirectory, "..");
const nativeRoot = realpathSync.native(workspaceRoot);
const runsFromWindowsShare =
  process.platform === "win32" && nativeRoot.startsWith("\\\\");
const forwardedArgs = process.argv.slice(2);

const mirroredDirectories = ["src", "public"];
const mirroredFiles = [
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.mjs",
  "next-env.d.ts",
];
const startupFiles = ["package.json", "package-lock.json"];

function assertTemporaryPath(candidate, prefix) {
  const relative = path.relative(tmpdir(), candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify non-temporary path: ${candidate}`);
  }

  if (!path.basename(candidate).startsWith(prefix)) {
    throw new Error(`Unexpected temporary path: ${candidate}`);
  }
}

function assertStageChild(stageRoot, candidate) {
  const relative = path.relative(stageRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to modify path outside the dev mirror: ${candidate}`);
  }
}

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

function ensureStageDependencies(stageRoot, dependencyHash) {
  const readyMarker = path.join(stageRoot, ".nordic-dependency-hash");
  const stageModules = path.join(stageRoot, "node_modules");
  const nextCli = path.join(stageModules, "next/dist/bin/next");

  if (
    existsSync(readyMarker) &&
    existsSync(stageModules) &&
    existsSync(nextCli) &&
    readFileSync(readyMarker, "utf8").trim() === dependencyHash
  ) {
    return;
  }

  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    throw new Error("npm_execpath is unavailable; run this command through npm.");
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
    stageRoot,
  );
  writeFileSync(readyMarker, `${dependencyHash}\n`, "utf8");
}

function copyInitialWorkspace(stageRoot) {
  for (const directoryName of mirroredDirectories) {
    const destination = path.join(stageRoot, directoryName);
    assertStageChild(stageRoot, destination);
    rmSync(destination, { recursive: true, force: true });
    cpSync(path.join(workspaceRoot, directoryName), destination, {
      recursive: true,
    });
  }

  for (const fileName of [...startupFiles, ...mirroredFiles]) {
    cpSync(path.join(workspaceRoot, fileName), path.join(stageRoot, fileName));
  }
}

function getFileSignature(absolutePath, relativePath) {
  const stat = statSync(absolutePath);
  const isLargePublicAsset =
    relativePath.startsWith(`public${path.sep}`) && stat.size > 512 * 1024;
  const contentHash = isLargePublicAsset
    ? ""
    : createHash("sha1").update(readFileSync(absolutePath)).digest("hex");

  return `${stat.size}:${stat.mtimeMs}:${contentHash}`;
}

function collectDirectoryFiles(directoryRoot, files) {
  for (const entry of readdirSync(directoryRoot, { withFileTypes: true })) {
    const absolutePath = path.join(directoryRoot, entry.name);
    if (entry.isDirectory()) {
      collectDirectoryFiles(absolutePath, files);
    } else if (entry.isFile()) {
      const relativePath = path.relative(workspaceRoot, absolutePath);
      files.set(relativePath, {
        source: absolutePath,
        signature: getFileSignature(absolutePath, relativePath),
      });
    }
  }
}

function snapshotWorkspace() {
  const files = new Map();

  for (const directoryName of mirroredDirectories) {
    collectDirectoryFiles(path.join(workspaceRoot, directoryName), files);
  }

  for (const fileName of mirroredFiles) {
    const absolutePath = path.join(workspaceRoot, fileName);
    if (!existsSync(absolutePath)) continue;
    files.set(fileName, {
      source: absolutePath,
      signature: getFileSignature(absolutePath, fileName),
    });
  }

  return files;
}

function startWorkspaceMirror(stageRoot) {
  let previous = snapshotWorkspace();
  let syncInProgress = false;

  const timer = setInterval(() => {
    if (syncInProgress) return;
    syncInProgress = true;

    try {
      const current = snapshotWorkspace();
      let changedFiles = 0;

      for (const [relativePath, metadata] of current) {
        if (previous.get(relativePath)?.signature === metadata.signature) {
          continue;
        }

        const destination = path.join(stageRoot, relativePath);
        assertStageChild(stageRoot, destination);
        mkdirSync(path.dirname(destination), { recursive: true });
        cpSync(metadata.source, destination);
        changedFiles += 1;
      }

      for (const relativePath of previous.keys()) {
        if (current.has(relativePath)) continue;
        const destination = path.join(stageRoot, relativePath);
        assertStageChild(stageRoot, destination);
        rmSync(destination, { force: true });
        changedFiles += 1;
      }

      previous = current;
      if (changedFiles > 0) {
        console.log(`[dev] Mirrored ${changedFiles} changed file(s) to NTFS.`);
      }
    } catch (error) {
      console.error("[dev] Workspace mirror failed; fix the error and restart dev.", error);
    } finally {
      syncInProgress = false;
    }
  }, 500);

  return () => clearInterval(timer);
}

function startNextDev(cwd, nextCli, cleanup = () => {}, extraArgs = []) {
  const childEnvironment = { ...process.env };
  delete childEnvironment.GITHUB_ACTIONS;
  delete childEnvironment.GITHUB_REPOSITORY;

  const child = spawn(
    process.execPath,
    [nextCli, "dev", ...extraArgs, ...forwardedArgs],
    {
      cwd,
      env: childEnvironment,
      stdio: "inherit",
    },
  );

  let cleanedUp = false;
  const finishCleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    cleanup();
  };

  const forwardSignal = (signal) => {
    finishCleanup();
    if (!child.killed) child.kill(signal);
  };

  process.once("SIGINT", () => forwardSignal("SIGINT"));
  process.once("SIGTERM", () => forwardSignal("SIGTERM"));
  process.once("exit", finishCleanup);

  child.once("error", (error) => {
    finishCleanup();
    throw error;
  });
  child.once("exit", (code, signal) => {
    finishCleanup();
    if (signal) {
      process.exitCode = 1;
    } else {
      process.exitCode = code ?? 1;
    }
  });
}

function runDirectDev() {
  const nextCli = path.join(workspaceRoot, "node_modules/next/dist/bin/next");
  startNextDev(workspaceRoot, nextCli);
}

function runStagedWindowsDev() {
  const dependencyHash = createHash("sha256")
    .update(readFileSync(path.join(workspaceRoot, "package.json")))
    .update(readFileSync(path.join(workspaceRoot, "package-lock.json")))
    .digest("hex");
  const workspaceHash = createHash("sha256")
    .update(nativeRoot.toLowerCase())
    .digest("hex")
    .slice(0, 12);
  const stageRoot = path.join(tmpdir(), `nordic-next-dev-${workspaceHash}`);
  const stageModules = path.join(stageRoot, "node_modules");

  assertTemporaryPath(stageRoot, "nordic-next-dev-");
  mkdirSync(stageRoot, { recursive: true });
  copyInitialWorkspace(stageRoot);
  ensureStageDependencies(stageRoot, dependencyHash);

  console.log(
    `[dev] Windows shared filesystem detected (${nativeRoot}). Running Next from ${stageRoot}.`,
  );
  console.log("[dev] Source, public assets, and config are mirrored every 500 ms.");

  const stopMirror = startWorkspaceMirror(stageRoot);
  const nextCli = path.join(stageModules, "next/dist/bin/next");
  startNextDev(stageRoot, nextCli, stopMirror, ["--webpack"]);
}

if (runsFromWindowsShare) {
  runStagedWindowsDev();
} else {
  runDirectDev();
}
