import type { Metadata } from "next";

import { ScenicPageShell } from "@/components/site/ScenicPageShell";
import { WeatherPanel } from "@/components/weather/WeatherPanel";
import { StatusBadge } from "@/components/site/StatusBadge";
import { destinations } from "@/data/destinations";
import { getCultureGuideByCountry } from "@/data/culture-guides";
import type { Destination } from "@/types/trip";
import {
  BookOpenText,
  CalendarDays,
  CloudSun,
  ExternalLink,
  Landmark,
  MapPin,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  UsersRound,
} from "lucide-react";

const countryOrder = ["丹麥", "挪威", "瑞典", "芬蘭"] as const;

const countryAnchors: Record<(typeof countryOrder)[number], string> = {
  丹麥: "denmark",
  挪威: "norway",
  瑞典: "sweden",
  芬蘭: "finland",
};

export const metadata: Metadata = {
  title: "地點文化指南",
  description:
    "北歐四國 13 日行程的城市、景點、文化禮儀、穿著建議、Google Maps 與近期天氣。",
};

function DetailList({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: readonly string[];
  icon: typeof Landmark;
}) {
  return (
    <section>
      <h4 className="flex items-center gap-2 text-base font-semibold text-[var(--pine-950)]">
        <Icon aria-hidden="true" className="h-5 w-5 text-[var(--brass-500)]" />
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--stone-700)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brass-500)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <article className="surface-card flex min-w-0 flex-col overflow-hidden" id={destination.id}>
      <div className="border-b border-[var(--stone-200)] bg-[var(--stone-50)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{destination.cityOrRegion}</p>
            <h3 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[var(--pine-950)] sm:text-4xl">
              {destination.name}
            </h3>
          </div>
          <StatusBadge status={destination.status} />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-[var(--stone-700)]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-[var(--pine-700)]" />
            關聯 Day {destination.relatedDays.join("、")}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-4 w-4 text-[var(--pine-700)]" />
            {destination.timezone}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <section>
          <h4 className="flex items-center gap-2 text-base font-semibold text-[var(--pine-950)]">
            <BookOpenText aria-hidden="true" className="h-5 w-5 text-[var(--brass-500)]" />
            地理、歷史與行程定位
          </h4>
          <p className="mt-3 text-base leading-8 text-[var(--stone-700)]">{destination.introduction}</p>
        </section>

        <div className="mt-7 grid gap-7 border-y border-[var(--stone-200)] py-7 sm:grid-cols-2">
          <DetailList title="代表景點" items={destination.highlights} icon={Landmark} />
          <DetailList title="食物與飲品" items={destination.foodAndDrink} icon={UtensilsCrossed} />
          <DetailList title="文化與禮儀" items={destination.cultureAndEtiquette} icon={UsersRound} />
          <DetailList title="9 月穿著提醒" items={destination.clothingAdvice} icon={Shirt} />
        </div>

        <p className="mt-5 text-sm leading-6 text-[var(--stone-500)]">
          穿著內容為一般行前建議，不是行程當日的精準天氣預報。
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={destination.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary min-h-11 self-start"
          >
            <MapPin aria-hidden="true" className="h-4 w-4" />
            在 Google Maps 開啟
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
          <p className="text-sm text-[var(--stone-500)]">資料檢視：{destination.lastReviewedAt}</p>
        </div>

        <details className="mt-6 rounded-2xl border border-[var(--stone-200)] bg-[var(--mist-100)] p-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 font-semibold text-[var(--pine-950)] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brass-500)]">
            <CloudSun aria-hidden="true" className="h-5 w-5 text-[var(--pine-700)]" />
            展開近期天氣
            <span className="ml-auto text-sm font-normal text-[var(--stone-500)]">開啟後才載入</span>
          </summary>
          <div className="p-3 sm:p-4">
            <WeatherPanel destination={destination} />
          </div>
        </details>

      </div>
    </article>
  );
}

export default function DestinationsPage() {
  const groupedDestinations = countryOrder
    .map((country) => ({
      country,
      destinations: destinations.filter((destination) => destination.country === country),
      guide: getCultureGuideByCountry(country),
    }))
    .filter((group) => group.destinations.length > 0);

  return (
    <ScenicPageShell background="destinations">
      <header className="page-hero">
        <div className="site-container py-16 sm:py-20 lg:py-24">
          <p className="eyebrow">Destination journal</p>
          <h1 className="display-title mt-4">地點文化指南</h1>
          <p className="lede mt-6 max-w-3xl">
            依照實際 13 日行程整理四國停留地，從地方故事、飲食禮儀到穿著與地圖，一次留在手邊。
          </p>
          <nav aria-label="國家快速導覽" className="mt-8 flex flex-wrap gap-3">
            {groupedDestinations.map(({ country }) => (
              <a key={country} href={`#${countryAnchors[country]}`} className="button-secondary min-h-11">
                {country}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="site-container space-y-20 py-14 sm:py-20">
        {groupedDestinations.map(({ country, destinations: countryDestinations, guide }) => (
          <section key={country} id={countryAnchors[country]} aria-labelledby={`${countryAnchors[country]}-title`}>
            <div className="grid gap-8 border-b border-[var(--stone-200)] pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="eyebrow">{guide?.localName ?? country}</p>
                <h2 id={`${countryAnchors[country]}-title`} className="section-title mt-3">
                  {country}
                </h2>
                <p className="mt-3 text-sm font-semibold text-[var(--pine-700)]">
                  行程涵蓋 {countryDestinations.length} 個實際地點
                </p>
              </div>
              {guide ? <p className="text-lg leading-8 text-[var(--stone-700)]">{guide.summary}</p> : null}
            </div>

            {guide?.optionalExperiences.length ? (
              <aside className="mt-7 rounded-[var(--radius-card)] border border-[var(--brass-400)]/50 bg-[var(--mist-100)] p-5 sm:p-6">
                <h3 className="flex items-center gap-2 font-serif text-2xl font-semibold text-[var(--pine-950)]">
                  <Sparkles aria-hidden="true" className="h-5 w-5 text-[var(--brass-500)]" />
                  若有自由時間
                </h3>
                <ul className="mt-3 grid gap-2 text-base leading-7 text-[var(--stone-700)] sm:grid-cols-2">
                  {guide.optionalExperiences.map((experience) => (
                    <li key={experience} className="flex gap-2">
                      <span aria-hidden="true">—</span>
                      <span>{experience}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-6 text-[var(--stone-500)]">
                  以上為可選靈感，不是正式行程；是否有空檔，請以領隊與當日集合安排為準。
                </p>
              </aside>
            ) : null}

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
              {countryDestinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </ScenicPageShell>
  );
}
