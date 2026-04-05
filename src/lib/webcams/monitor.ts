import type { PublicWebcam, WebcamStatus } from "@/types/webcam";

function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".local")) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(lower)) {
    const [a, b] = lower.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

async function checkUrl(url: string): Promise<{ available: boolean; statusCode?: number; detail?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { available: false, detail: "Invalid URL" };
  }

  if (parsed.protocol !== "https:") {
    return { available: false, detail: "Only HTTPS public webcam URLs are allowed" };
  }
  if (isPrivateHostname(parsed.hostname)) {
    return { available: false, detail: "Private/local hosts are blocked" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "OpenWatch Webcam Monitor" }
    });
    clearTimeout(timeout);
    if (head.status === 405 || head.status === 403) {
      return { available: true, statusCode: head.status, detail: "Reachable (restricted HEAD)" };
    }
    return { available: head.ok, statusCode: head.status };
  } catch {
    clearTimeout(timeout);
    return { available: false, detail: "Network timeout or unreachable" };
  }
}

type MonitorOptions = {
  concurrency?: number;
};

async function mapConcurrent<TInput, TOutput>(
  items: TInput[],
  worker: (item: TInput) => Promise<TOutput>,
  concurrency = 8
): Promise<TOutput[]> {
  if (!items.length) return [];

  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker());
  await Promise.all(workers);
  return results;
}

export async function monitorPublicWebcams(
  webcams: PublicWebcam[],
  options?: MonitorOptions
): Promise<WebcamStatus[]> {
  return mapConcurrent(
    webcams,
    async (camera) => {
      const checkTarget = camera.streamUrl || camera.thumbnailUrl || camera.pageUrl;
      const status = await checkUrl(checkTarget);
      return {
        ...camera,
        available: status.available,
        statusCode: status.statusCode,
        statusDetail: status.detail,
        lastCheckedAt: new Date().toISOString()
      };
    },
    options?.concurrency ?? 8
  );
}
