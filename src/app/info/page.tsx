import type { Metadata } from "next";

import { ScenicPageShell } from "@/components/site/ScenicPageShell";
import { EmergencyContactCard } from "@/components/trip/EmergencyContactCard";
import { StatusBadge } from "@/components/site/StatusBadge";
import { destinations } from "@/data/destinations";
import { imageCredits } from "@/data/images";
import { trip } from "@/data/trip";
import { getTripTimeZoneOffset } from "@/lib/timezones";
import {
  BookOpenCheck,
  CloudSun,
  ExternalLink,
  Globe2,
  ImageIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "實用資訊",
  description:
    "北歐四國 13 日確認版行程的重點資訊、彈性安排、時區、台灣時差、幣別與天氣來源。",
};

const countryCurrency = [
  { country: "丹麥", currency: "DKK｜丹麥克朗" },
  { country: "挪威", currency: "NOK｜挪威克朗" },
  { country: "瑞典", currency: "SEK｜瑞典克朗" },
  { country: "芬蘭", currency: "EUR｜歐元" },
] as const;

const confirmedTripFacts = [
  { label: "團體編號", value: "NEU13TK260828A" },
  { label: "集合", value: "8 月 28 日 18:45｜桃園機場第二航廈・土耳其航空團體櫃台" },
  { label: "行李", value: "藍色行李牌｜土耳其航空國際段：托運每人 1 件 30 公斤、手提每人 1 件 7 公斤" },
  { label: "峽灣區行李", value: "挪威峽灣山區道路規範遊覽車總重、有時需過磅；峽灣區行程結束前托運行李每人限 1 件 23 公斤，以免車輛超重罰款與延誤" },
  { label: "小費", value: "每日 €12｜13 天共 €156，確認版載明 Day 3 收取" },
  { label: "電源", value: "丹麥、挪威、瑞典、芬蘭皆為 220V 雙圓孔" },
] as const;

const statusDefinitions = [
  {
    status: "confirmed" as const,
    title: "已確認",
    description: "已依最新確認資料核對的行程資訊；實際執行仍以領隊現場公告為準。",
  },
  {
    status: "optional" as const,
    title: "彈性安排",
    description: "行程已列入，但可能因道路、天候、場館或現場條件改道或調整，不代表固定時間與供應保證。",
  },
] as const;

function formatReviewedDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year} 年 ${month} 月 ${day} 日`;
}

function getTimezones(country: string) {
  return [...new Set(destinations.filter((destination) => destination.country === country).map((destination) => destination.timezone))];
}

export default function InfoPage() {
  return (
    <ScenicPageShell background="info">
      <header className="page-hero">
        <div className="site-container py-16 sm:py-20 lg:py-24">
          <p className="eyebrow">Practical information</p>
          <h1 className="display-title mt-4">實用資訊</h1>
          <p className="lede mt-6 max-w-3xl">
            集中查看確認版行程重點、仍受現場條件影響的彈性安排，以及時區、幣別與天氣資訊。
          </p>
          <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-full border border-[var(--stone-200)] bg-[var(--snow)] px-5 py-3 text-sm text-[var(--stone-700)]">
            <span className="font-semibold text-[var(--pine-900)]">最後更新日期</span>
            <time dateTime={trip.lastReviewedAt}>{formatReviewedDate(trip.lastReviewedAt)}</time>
            <StatusBadge status={trip.status} />
          </div>
        </div>
      </header>

      <div className="site-container space-y-16 py-14 sm:space-y-20 sm:py-20">
        <section aria-labelledby="sources-title" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Sources & review</p>
            <h2 id="sources-title" className="section-title mt-3">
              資料來源與狀態
            </h2>
            <p className="text-muted mt-5 max-w-xl leading-8">
              行程以旅行社 2026 年 8 月 11 日確認版行程表為主，再用旅行社產品頁補充背景。確認檔未列明或會受現場條件影響的資訊不自行猜測。
            </p>
          </div>

          <div className="space-y-4">
            <article className="surface-card p-6">
              <div className="flex items-start gap-4">
                <BookOpenCheck aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-[var(--pine-700)]" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--pine-950)]">{trip.travelAgencyName}產品頁</h3>
                  <p className="text-muted mt-2 leading-7">用於補充產品背景；若與確認版行程表或現場通知不一致，以後兩者為準。</p>
                  <a
                    href={trip.sourceUrls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--pine-700)] underline decoration-[var(--brass-400)] underline-offset-4"
                  >
                    開啟旅行社頁面
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section aria-labelledby="status-title">
          <h2 id="status-title" className="section-title">
            狀態怎麼看
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {statusDefinitions.map(({ status, title, description }) => (
              <article key={status} className="surface-card p-6">
                <StatusBadge status={status} />
                <h3 className="mt-4 font-serif text-2xl font-semibold text-[var(--pine-950)]">{title}</h3>
                <p className="text-muted mt-3 leading-7">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="confirmed-facts-title">
          <p className="eyebrow">Confirmed essentials</p>
          <h2 id="confirmed-facts-title" className="section-title mt-3">
            確認版行前重點
          </h2>
          <dl className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {confirmedTripFacts.map(({ label, value }) => (
              <div key={label} className="surface-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brass-500)]">
                  {label}
                </dt>
                <dd className="mt-3 text-sm font-semibold leading-6 text-[var(--pine-950)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <EmergencyContactCard />

        <section aria-labelledby="timezone-title">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--mist-100)] text-[var(--pine-700)]">
              <Globe2 aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <p className="eyebrow">Local basics</p>
              <h2 id="timezone-title" className="section-title mt-2">
                時區與幣別概覽
              </h2>
            </div>
          </div>

          <div className="mt-7 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--stone-200)] bg-[var(--snow)] shadow-[var(--shadow-soft)]">
            <table className="w-full min-w-[58rem] border-collapse text-left">
              <caption className="sr-only">北歐四國的 IANA 時區、UTC、與台灣時差及使用幣別</caption>
              <thead className="bg-[var(--pine-900)] text-[var(--snow)]">
                <tr>
                  <th scope="col" className="px-4 py-4 font-semibold sm:px-6">國家</th>
                  <th scope="col" className="px-4 py-4 font-semibold sm:px-6">IANA 時區</th>
                  <th scope="col" className="px-4 py-4 font-semibold sm:px-6">UTC</th>
                  <th scope="col" className="px-4 py-4 font-semibold sm:px-6">與台灣時差</th>
                  <th scope="col" className="px-4 py-4 font-semibold sm:px-6">幣別</th>
                </tr>
              </thead>
              <tbody>
                {countryCurrency.map(({ country, currency }) => {
                  const timeZones = getTimezones(country);
                  const offsets = timeZones.map((timeZone) =>
                    getTripTimeZoneOffset(timeZone, trip.startDate, trip.endDate),
                  );

                  return (
                    <tr key={country} className="border-t border-[var(--stone-200)] first:border-t-0">
                      <th scope="row" className="px-4 py-5 font-semibold text-[var(--pine-950)] sm:px-6">{country}</th>
                      <td className="px-4 py-5 text-[var(--stone-700)] sm:px-6">{timeZones.join("、") || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-5 font-semibold text-[var(--pine-900)] sm:px-6">
                        {offsets.map(({ utcOffset }) => utcOffset).join("、") || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-5 font-semibold text-[var(--pine-900)] sm:px-6">
                        {offsets.map(({ taiwanDifference }) => taiwanDifference).join("、") || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-5 text-[var(--stone-700)] sm:px-6">{currency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-4 text-sm leading-6">
            UTC 與台灣時差以本行程 <time dateTime={trip.startDate}>{formatReviewedDate(trip.startDate)}</time>至
            <time dateTime={trip.endDate}>{formatReviewedDate(trip.endDate)}</time>為基準，依 IANA 時區規則逐日計算；期間北歐四國均採夏令時間。台灣為 UTC+8，「-6 小時」表示當地比台灣慢 6 小時。匯率與付款方式請於出發前向發卡銀行或可靠來源確認。
          </p>
        </section>

        <section aria-labelledby="weather-source-title" className="surface-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <CloudSun aria-hidden="true" className="mt-1 h-7 w-7 shrink-0 text-[var(--pine-700)]" />
            <div>
              <h2 id="weather-source-title" className="section-title">天氣資料</h2>
              <p className="mt-3 text-lg font-semibold text-[var(--pine-900)]">天氣資料：Open-Meteo（僅供參考）</p>
              <p className="text-muted mt-2 leading-7">僅在瀏覽器展開天氣面板後查詢近期資訊；不在預報範圍內的旅程日期不會冒充精準預報。</p>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--pine-700)] underline decoration-[var(--brass-400)] underline-offset-4"
              >
                Open-Meteo
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="attribution-title">
          <div className="flex items-center gap-4">
            <ImageIcon aria-hidden="true" className="h-7 w-7 text-[var(--pine-700)]" />
            <h2 id="attribution-title" className="section-title">圖片來源與授權</h2>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {imageCredits.map((credit) => {
              const sourceHref = credit.sourceUrl.startsWith("/") ? `..${credit.sourceUrl}` : credit.sourceUrl;
              return (
                <article key={credit.id} className="surface-card min-w-0 p-6">
                  <p className="font-mono text-xs text-[var(--stone-500)]">{credit.src}</p>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--pine-950)]">{credit.alt}</h3>
                  <dl className="mt-4 grid gap-2 text-sm leading-6 text-[var(--stone-700)]">
                    <div className="flex gap-2"><dt className="font-semibold">作者：</dt><dd>{credit.author}</dd></div>
                    <div><dt className="font-semibold">授權／使用說明：</dt><dd className="mt-1">{credit.licenseOrUsageNote}</dd></div>
                  </dl>
                  <a
                    href={sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 break-all font-semibold text-[var(--pine-700)] underline decoration-[var(--brass-400)] underline-offset-4"
                  >
                    查看圖片來源
                    <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="border-t border-[var(--stone-200)] bg-[var(--pine-950)] text-[var(--snow)]">
        <div className="site-container py-8 text-base leading-7">
          本網站為私人旅行輔助工具；最終行程、交通、集合資訊以旅行社／領隊公告為準。
        </div>
      </footer>
    </ScenicPageShell>
  );
}
