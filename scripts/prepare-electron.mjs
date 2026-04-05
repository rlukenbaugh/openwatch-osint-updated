import { spawn } from "node:child_process";
import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standaloneSrc = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const publicSrc = path.join(root, "public");
const sourceDatabasePath = path.join(root, "prisma", "dev.db");
const outputRoot = path.join(root, "electron-build", "standalone");
const packagedDatabasePath = path.join(outputRoot, "prisma", "app.db");
const packagedDbPruneScript = path.join(root, "scripts", "prune-packaged-db.cjs");

async function ensureExists(targetPath, label) {
  try {
    await stat(targetPath);
  } catch {
    throw new Error(`${label} missing at: ${targetPath}`);
  }
}

async function copyIfExists(source, destination) {
  try {
    await stat(source);
    await cp(source, destination, { recursive: true, force: true });
  } catch {
    // optional file/folder
  }
}

function runNodeCommand(args, env, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      env,
      stdio: "inherit",
      windowsHide: true
    });

    child.on("error", (error) => {
      reject(new Error(`${label} failed to start: ${error.message}`));
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} exited with code ${code ?? "null"}`));
    });
  });
}

async function main() {
  await ensureExists(standaloneSrc, "Next standalone output");
  await ensureExists(staticSrc, "Next static output");
  await ensureExists(sourceDatabasePath, "SQLite database");

  await rm(path.join(root, "electron-build"), { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  await cp(standaloneSrc, outputRoot, { recursive: true, force: true });
  await rm(path.join(outputRoot, ".env"), { force: true });
  await mkdir(path.join(outputRoot, ".next"), { recursive: true });
  await cp(staticSrc, path.join(outputRoot, ".next", "static"), { recursive: true, force: true });
  await copyIfExists(publicSrc, path.join(outputRoot, "public"));

  await mkdir(path.join(outputRoot, "prisma"), { recursive: true });
  await cp(sourceDatabasePath, packagedDatabasePath, { force: true });
  await runNodeCommand(
    [packagedDbPruneScript],
    {
      ...process.env,
      DATABASE_URL: `file:${packagedDatabasePath.replace(/\\/g, "/")}`
    },
    "Packaged DB prune"
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
