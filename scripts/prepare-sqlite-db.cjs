const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const prismaCliPath = require.resolve("prisma/build/index.js", { paths: [rootDir] });

function runPrisma(args) {
  const result = spawnSync(process.execPath, [prismaCliPath, ...args], {
    cwd: rootDir,
    env: {
      ...process.env,
      DATABASE_URL: "file:./dev.db"
    },
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

fs.mkdirSync(path.join(rootDir, "prisma"), { recursive: true });
runPrisma(["db", "push", "--skip-generate"]);
runPrisma(["db", "seed"]);
