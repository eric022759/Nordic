# 北歐四國・挪威三大峽灣全覽 13 日

給家人使用的繁體中文私人旅行網站，將 13 日行程、實際停留地文化指南、行前準備、實用資訊與 Open-Meteo 近期天氣整合成長輩友善的靜態網站。網站採 Scandinavian quiet luxury 的編輯式設計，並支援 GitHub Pages repository subpath。

> 網站內容以旅行社 2026 年 8 月 11 日提供的確認版行程表為準；場館開放、道路與集合細節仍以領隊現場公告為準。

## 頁面

| 路徑 | 用途 |
| --- | --- |
| `/` | 旅程總覽、路線與旅程模式 |
| `/itinerary/` | 13 日每日行程、交通、住宿、地圖與近期天氣 |
| `/destinations/` | 實際停留地的文化、飲食、禮儀與穿著指南 |
| `/prepare/` | 行前提醒與只儲存在本機裝置的 packing checklist |
| `/info/` | 確認行程重點、彈性狀態、時區、幣別、天氣與圖片 attribution |

## 架構與技術棧

- Next.js 16 App Router、React、TypeScript strict mode。
- Tailwind CSS、Noto Sans SC、具鍵盤操作能力的 UI primitives、Lucide icons、Framer Motion。
- Next.js Static Export；production 產物位於 `out/`。
- Vitest 與 smoke tests；測試不依賴真實 Open-Meteo 回應。
- browser-side Open-Meteo Forecast API，搭配 30 分鐘 localStorage cache。
- 網站不建立離線內容快取；build 後保留不攔截請求的 `sw.js`，只用於解除既有 worker 並清除 `nordic-trip-*` CacheStorage。
- GitHub Actions 使用 GitHub 官方 Pages Actions 部署。

主要目錄：

```text
src/
  app/                 # 五個靜態 route 與 metadata
  components/          # 導覽、行程、天氣、動效與快取清理
  data/                # 可追溯的行程、地點與文化靜態資料
  lib/                 # 日期、地圖、天氣與 cache helper
  types/               # 共用 TypeScript 型別
public/
  images/              # 已下載並附 attribution 的必要圖片
  icons/               # favicon 與網站 icons
scripts/
  run-next-dev.mjs     # 在 Windows shared-folder 上以 NTFS mirror 保留 Hot Reload
  run-next-build.mjs   # 避開 Windows shared-folder 的 Next.js 路徑限制
  generate-sw.mjs      # build 後產生只負責停用離線快取的 out/sw.js
```

## 靜態邊界與隱私

本專案**沒有 backend、資料庫、DB、CMS、帳號、登入、Auth、API Routes、Server Actions 或環境變數**，也不需要 `.env` / `.env.example`。行程與文化資料在 build 時寫入 HTML、CSS 與 JavaScript。

唯一允許的 runtime network request 是瀏覽器直接讀取 Open-Meteo Forecast API；Google Maps 只使用一般外部連結。專案不含 analytics、tracking pixel、廣告、cookie tracking、push notification 或 background sync，也不應提交個資、token、private key 或其他 secret。Repository 不保存旅行社 PDF；含個資的旅行文件只在安全的本機位置核對。

## 本機開發

需求：Node.js 24 與 npm。

```bash
npm install && npm run dev
```

依 terminal 顯示的 localhost URL 開啟網站。開發模式不啟用 service worker，避免 CacheStorage 干擾 Hot Reload。

若 repository 位於 Parallels／Windows 的 UNC shared folder，`npm run dev` 會自動在目前使用者的 `%TEMP%` 建立固定的本機 NTFS mirror，並每 500 ms 同步 `src/`、`public/` 與必要設定檔。Next.js 只在 NTFS mirror 內執行，因此不會混用 `\\Mac\...` 與 `\\?\UNC\Mac\...` 路徑；原 repository 仍是唯一應編輯的來源。套件或 lockfile 變更後，請停止並重新執行 `npm run dev`。

## Lint、測試與靜態驗證

```bash
npm run lint
npm run test
npm run build
npx serve out
```

也可用題目指定的一行方式完成 build 與靜態預覽：

```bash
npm run build && npx serve out
```

完成 build 後至少確認：

```text
out/index.html
out/itinerary/index.html
out/destinations/index.html
out/prepare/index.html
out/info/index.html
out/sw.js
```

`scripts/generate-sw.mjs` 由 npm 的 `build` script 在 Next static export 後執行。產生的 `out/sw.js` 沒有 fetch handler，不會快取頁面、圖片或 PDF；它只解除 `/Nordic/` scope 的 worker 並刪除 `nordic-trip-*` CacheStorage。

若 repository 位於 Parallels／Windows 的 UNC shared folder，Next.js 可能把同一路徑解析成兩種 UNC 格式而中止。`scripts/run-next-dev.mjs` 與 `scripts/run-next-build.mjs` 會自動辨識此情況：dev 使用可重用的 NTFS mirror 與本機 `node_modules`，build 則在隔離的 NTFS 目錄完成後只把 `out/` 複製回 repository。一般本機磁碟與 GitHub Actions 仍直接執行標準 Next 指令；不需設定環境變數。

## 行程更新 SOP

1. 先在安全的本機位置核對旅行社最新版確認文件；再以旅行社原始頁補足背景。旅行社 PDF 不得提交至 repository；不可自行猜測缺漏的航班、飯店、時間、交通或預約資訊。
2. 更新 `src/data/*.ts`。每日行程與目的地資料要保留 `sourceReference`、`status` 與 `lastReviewedAt`。
3. 若新增地點，同步補齊座標、IANA timezone、Google Maps query、文化摘要、相關 Day 與合法圖片 attribution。
4. 執行 `npm run lint`、`npm run test`、`npm run build`。
5. 執行 `npx serve out`，逐頁檢查五個 route、內部連結、Google Maps 外連、mobile navigation、13 日內容、天氣狀態與 repository subpath assets。
6. 只提交預期檔案並 push 至 `main`。
7. 等待 GitHub Pages workflow 完成，再於正式網址重新檢查頁面與 repository subpath assets。

## GitHub Pages 設定與部署

首次部署前，到 GitHub repository：

1. `Settings → Pages`。
2. 在 `Build and deployment` 將 `Source` 設為 **GitHub Actions**。
3. push 至 `main`，或在 Actions 手動執行 `Deploy Nordic trip site to GitHub Pages`。
4. workflow 依序執行 checkout、Node setup、`npm ci`、lint、test、build、`out/` 完整性檢查、artifact upload 與 Pages deployment。

### Repository subpath / basePath

本網站部署於 project site，例如 `https://eric022759.github.io/Nordic/`，不是 domain root。`next.config.ts` 會在 GitHub Actions 中由 `GITHUB_REPOSITORY` 推導 `basePath` 與 `assetPrefix`；本機開發則使用空字串。

- 不要把站內連結或靜態資產硬寫為 domain-root `/...`。
- `ServiceWorkerCleanup` 必須收到與 Next.js 相同的 `basePath`，才能只處理 `/Nordic/` scope，不影響同網域的其他網站。
- 請勿為了模擬 production 在本機永久設定 `GITHUB_ACTIONS=true`；一般本機 build 應維持 root path。

## 快取行為

- 網站不提供安裝提示，也不註冊新的離線 worker；頁面、圖片與字體都直接依網路與一般 HTTP cache 更新。
- `ServiceWorkerCleanup` 只精準解除 `/Nordic/` scope 的 registration、刪除 `nordic-trip-*` CacheStorage，並在原頁受 worker 控制時重新載入一次。
- `out/sw.js` 是同一路徑的清理腳本，讓曾經註冊 worker 的瀏覽器連線造訪後能自動解除註冊；它不含 fetch handler、precache 或離線 fallback。
- Packing checklist 與近期天氣仍使用各自的 localStorage，不會被快取清理刪除。

## 資料來源

- [上順旅行社原始行程頁](https://www.unotour.com.tw/03_category_info.asp?sn=47906)。
- [Open-Meteo Forecast API](https://open-meteo.com/)（僅供近期天氣參考）。

旅行社來源會整理成繁體中文原創摘要，不應大段複製。圖片來源、作者與授權／使用說明請在資料檔及 `/info/` 保留。
