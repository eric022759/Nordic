import type { Metadata } from "next";

import { ScenicPageShell } from "@/components/site/ScenicPageShell";
import { ItineraryTimeline } from "@/components/trip/ItineraryTimeline";
import { destinations } from "@/data/destinations";
import { itinerary } from "@/data/itinerary";
import { trip } from "@/data/trip";

const tripDateFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatTripDate(date: string) {
  return tripDateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export const metadata: Metadata = {
  title: "逐日行程",
  description: "2026 年北歐四國私人旅行的 13 日確認版逐日行程、交通、餐食、住宿與目的地天氣。",
};

export default function ItineraryPage() {
  return (
    <ScenicPageShell background="itinerary">
      <header className="page-hero site-container">
        <p className="eyebrow">Itinerary · 13 days</p>
        <h1 className="display-title">逐日行程</h1>
        <p className="lede max-w-3xl">
          <time dateTime={trip.startDate}>{formatTripDate(trip.startDate)}</time>
          <span aria-hidden="true"> — </span>
          <time dateTime={trip.endDate}>{formatTripDate(trip.endDate)}</time>
          ，依日期展開每日停留、已確認交通、餐食、住宿與即時天氣。
        </p>
      </header>

      <section
        className="site-container pt-12 pb-24 sm:pt-16"
        aria-labelledby="itinerary-heading"
      >
        <h2 id="itinerary-heading" className="sr-only">
          十三日行程明細
        </h2>
        <ItineraryTimeline days={itinerary} destinations={destinations} />
      </section>
    </ScenicPageShell>
  );
}
