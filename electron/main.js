const { app, BrowserWindow, dialog, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");
const { spawn } = require("node:child_process");

const isDev = !app.isPackaged;
const defaultPort = 3344;
let serverProcess = null;
let startupLogPath = null;

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    let triedFallback = false;

    server.unref();
    server.on("error", (error) => {
      if (!triedFallback && error && error.code === "EADDRINUSE") {
        triedFallback = true;
        server.listen(0, "127.0.0.1");
        return;
      }
      reject(error);
    });
    server.listen(startPort, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : startPort;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve(port);
      });
    });
  });
}

function appendStartupLog(message) {
  try {
    if (!startupLogPath) {
      startupLogPath = path.join(app.getPath("userData"), "startup.log");
    }
    fs.appendFileSync(startupLogPath, `[${new Date().toISOString()}] ${message}\n`);
  } catch {
    // Logging should never block the app from starting.
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
      throw new Error(`Embedded server exited early with code ${serverProcess.exitCode}. See startup log at ${startupLogPath}.`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for local server at ${url}`);
}

async function startServerIfNeeded() {
  if (isDev) {
    return "http://localhost:3000";
  }

  if (!app.requestSingleInstanceLock()) {
    app.quit();
    return null;
  }

  const serverCandidates = [
    path.join(process.resourcesPath, "server"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron-build", "standalone"),
    path.join(process.resourcesPath, "app", "electron-build", "standalone"),
    path.join(app.getAppPath(), "electron-build", "standalone")
  ];
  const serverRoot = serverCandidates.find((candidate) => fs.existsSync(path.join(candidate, "server.js")));
  if (!serverRoot) {
    throw new Error("Packaged server bundle not found.");
  }
  const serverEntry = path.join(serverRoot, "server.js");
  const databasePath = path.join(serverRoot, "prisma", "app.db");
  const localPort = await findAvailablePort(defaultPort);
  const baseUrl = `http://127.0.0.1:${localPort}`;

  appendStartupLog(`Starting embedded server from ${serverEntry}`);

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: serverRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(localPort),
      HOSTNAME: "127.0.0.1",
      DATABASE_URL: `file:${databasePath.replace(/\\/g, "/")}`
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  serverProcess.stdout?.on("data", (data) => {
    appendStartupLog(`[next-server:stdout] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on("data", (data) => {
    appendStartupLog(`[next-server:stderr] ${data.toString().trim()}`);
    console.error(`[next-server] ${data.toString()}`);
  });

  serverProcess.on("exit", (code, signal) => {
    appendStartupLog(`Embedded server exited with code=${code ?? "null"} signal=${signal ?? "null"}`);
  });

  await waitForServer(`${baseUrl}/alerts`, 45000);
  appendStartupLog(`Embedded server responded successfully at ${baseUrl}/alerts`);
  return baseUrl;
}

function createWindow(url) {
  const window = new BrowserWindow({
    width: 1460,
    height: 940,
    minWidth: 1024,
    minHeight: 720,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.webContents.setWindowOpenHandler(({ url: nextUrl }) => {
    void shell.openExternal(nextUrl);
    return { action: "deny" };
  });

  void window.loadURL(url);
}

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

app.whenReady().then(async () => {
  try {
    const url = await startServerIfNeeded();
    if (!url) {
      return;
    }
    createWindow(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error.";
    appendStartupLog(`Startup failed: ${message}`);
    dialog.showErrorBox("OpenWatch failed to start", message);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
