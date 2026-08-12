import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

const outputRoot = resolve("out");
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = process.env.GITHUB_ACTIONS === "true" ? `/${repoName}` : "";

const requiredPages = [
  "index.html",
  "itinerary/index.html",
  "destinations/index.html",
  "prepare/index.html",
  "info/index.html",
];

const failures = [];

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(absolute) : [absolute];
  });
}

for (const page of requiredPages) {
  const absolute = join(outputRoot, page);
  if (!existsSync(absolute) || statSync(absolute).size === 0) {
    failures.push(`缺少靜態頁面：out/${page}`);
  }
}

function exportedPathFromUrl(rawUrl, sourcePage) {
  const withoutHash = rawUrl.split("#")[0].split("?")[0];
  if (!withoutHash || /^(?:https?:|mailto:|tel:|data:|blob:)/.test(withoutHash)) {
    return null;
  }

  let pathname = withoutHash;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const sourceDirectory = dirname(join(outputRoot, sourcePage));
  const candidate = pathname.startsWith("/")
    ? join(outputRoot, pathname.replace(/^\/+/, ""))
    : resolve(sourceDirectory, pathname || ".");

  return pathname.endsWith("/") || !pathname
    ? join(candidate, "index.html")
    : candidate;
}

for (const page of requiredPages) {
  const absolute = join(outputRoot, page);
  if (!existsSync(absolute)) continue;
  const html = readFileSync(absolute, "utf8");

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const exported = exportedPathFromUrl(match[1], page);
    if (!exported) continue;
    const candidate = normalize(exported);
    if (!candidate.startsWith(outputRoot) || !existsSync(candidate)) {
      failures.push(`out/${page} 連結到不存在的資產：${match[1]}`);
    }
  }
}

const itineraryHtml = existsSync(join(outputRoot, "itinerary/index.html"))
  ? readFileSync(join(outputRoot, "itinerary/index.html"), "utf8")
  : "";

for (let day = 1; day <= 13; day += 1) {
  if (!itineraryHtml.includes(`id="day-${day}"`)) {
    failures.push(`行程初始 HTML 缺少 Day ${day}`);
  }
}

const exactGoogleMapsPlaceLinks =
  itineraryHtml.match(/https:\/\/www\.google\.com\/maps\/place\//g) ?? [];

if (exactGoogleMapsPlaceLinks.length < 10) {
  failures.push(
    `行程初始 HTML 的 Google Maps 精準地點連結不足（${exactGoogleMapsPlaceLinks.length}/10）`,
  );
}

if (!itineraryHtml.includes("https://www.google.com/maps/search/?api=1")) {
  failures.push("行程初始 HTML 缺少未能由共用清單確認之地點的座標 fallback");
}

const allHtml = requiredPages
  .filter((page) => existsSync(join(outputRoot, page)))
  .map((page) => readFileSync(join(outputRoot, page), "utf8"))
  .join("\n");

if (/lorem ipsum/i.test(allHtml)) failures.push("靜態頁面仍含 lorem ipsum");
if (/\bTODO\b/.test(allHtml)) failures.push("靜態頁面仍含 TODO");

const outputFiles = existsSync(outputRoot) ? collectFiles(outputRoot) : [];
const exportedPdfs = outputFiles.filter((file) => extname(file).toLowerCase() === ".pdf");
for (const pdf of exportedPdfs) {
  failures.push(`靜態輸出不得包含 PDF：out/${relative(outputRoot, pdf)}`);
}

if (existsSync(join(outputRoot, "manifest.webmanifest"))) {
  failures.push("靜態輸出不應再包含 PWA manifest");
}
if (/rel=["']manifest["']|manifest\.webmanifest/.test(allHtml)) {
  failures.push("靜態頁面不應再引用 PWA manifest");
}

const serviceWorkerPath = join(outputRoot, "sw.js");
if (!existsSync(serviceWorkerPath)) {
  failures.push("缺少用來清除既有離線快取的 out/sw.js");
} else {
  const serviceWorker = readFileSync(serviceWorkerPath, "utf8");
  if (!serviceWorker.includes("self.skipWaiting()")) failures.push("out/sw.js 未立即啟用快取清理");
  if (!serviceWorker.includes("nordic-trip-")) failures.push("out/sw.js 未限定 Nordic cache prefix");
  if (!serviceWorker.includes("caches.delete")) failures.push("out/sw.js 未刪除既有 CacheStorage");
  if (!serviceWorker.includes("registration.unregister")) failures.push("out/sw.js 未解除 service worker 註冊");
  if (/addEventListener\(["']fetch["']/.test(serviceWorker)) failures.push("out/sw.js 不得攔截網路請求");
  if (/addAll|PRECACHE|CACHE_NAME/.test(serviceWorker)) failures.push("out/sw.js 不得建立新的離線預快取");
}

const searchableOutput = outputFiles
  .filter((file) => [".html", ".js", ".css"].includes(extname(file).toLowerCase()))
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

for (const removedContent of [
  "trip-itinerary.pdf",
  "PDF",
  "開啟已去除個資的 PDF",
  "有新版本可更新",
  "把行程放在主畫面",
  "安裝後可更快開啟",
  "beforeinstallprompt",
  "serviceWorker.register",
  "manifest.webmanifest",
]) {
  if (searchableOutput.includes(removedContent)) {
    failures.push(`靜態輸出仍包含已移除內容：${removedContent}`);
  }
}

if (failures.length > 0) {
  console.error("靜態輸出驗證失敗：");
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `靜態輸出驗證完成：${requiredPages.length} 個頁面、13 日行程與內部資產均存在${
    basePath ? `（basePath: ${basePath}）` : ""
  }。`,
);
