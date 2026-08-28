import { ArrowRight, Compass, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RouteLine } from "@/components/site/RouteLine";
import { StatusBadge } from "@/components/site/StatusBadge";
import { TripModeBanner } from "@/components/trip/TripModeBanner";
import { destinations } from "@/data/destinations";
import { imageCredits } from "@/data/images";
import { itinerary } from "@/data/itinerary";
import { trip } from "@/data/trip";
import { formatTripDate } from "@/lib/dates";
import { assetPath } from "@/lib/paths";

const routePlan = [
  {
    destinationId: "copenhagen",
    day: 2,
    days: "Day 2–3",
    place: "哥本哈根",
    note: "王室地標與北西蘭",
  },
  {
    destinationId: "gothenburg",
    day: 3,
    days: "Day 3–4",
    place: "哥特堡",
    note: "跨越厄勒海峽",
  },
  {
    destinationId: "oslo",
    day: 4,
    days: "Day 4–9",
    place: "奧斯陸與峽灣",
    note: "山區、鐵路與三大峽灣",
  },
  {
    destinationId: "stockholm",
    day: 10,
    days: "Day 9–10",
    place: "斯德哥爾摩",
    note: "王城與波羅的海夜航",
  },
  {
    destinationId: "helsinki",
    day: 11,
    days: "Day 11–12",
    place: "赫爾辛基",
    note: "波爾沃與建築巡禮",
  },
] as const;

const routeStops = routePlan.flatMap((stop) => {
  const destination = destinations.find(
    (candidate) => candidate.id === stop.destinationId,
  );

  return destination ? [{ ...stop, destination }] : [];
});

const highlightPlan = [
  { day: 3, name: "哥本哈根新港 Nyhavn", kicker: "Harbour light" },
  { day: 6, name: "弗洛姆鐵路 Flåmsbana", kicker: "Mountain railway" },
  { day: 7, name: "蓋朗格峽灣觀光遊船", kicker: "Fjord passage" },
  { day: 10, name: "瓦薩號戰艦博物館", kicker: "Maritime history" },
] as const;

const confirmedHighlights = highlightPlan.flatMap((highlight) => {
  const day = itinerary.find((candidate) => candidate.day === highlight.day);
  const activity = day?.activities.find(
    (candidate) => candidate.name === highlight.name,
  );

  return activity?.status === "confirmed" && day
    ? [{ ...highlight, dayItinerary: day, activity }]
    : [];
});

const heroImage = imageCredits.find((image) => image.id === "geiranger-hero");
const copenhagenImage = imageCredits.find(
  (image) => image.id === "copenhagen-nyhavn",
);
const bergenImage = imageCredits.find((image) => image.id === "bergen-bryggen");
const copenhagen = destinations.find(
  (destination) => destination.id === "copenhagen",
);
const bergen = destinations.find((destination) => destination.id === "bergen");

const startDate = formatTripDate(trip.startDate, {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const endDate = formatTripDate(trip.endDate, {
  month: "long",
  day: "numeric",
});

export default function HomePage() {
  return (
    <main>
      <section className="home-hero" aria-labelledby="home-title">
        {heroImage ? (
          <Image
            className="home-hero__image"
            src={assetPath(heroImage.src)}
            alt={heroImage.alt}
            fill
            priority
            sizes="100vw"
          />
        ) : null}
        <div className="home-hero__veil" aria-hidden />

        <div className="site-container home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-hero__eyebrow">Private family journey · 2026</p>
            <h1 id="home-title" className="home-hero__title">
              {trip.title}
            </h1>
            <p className="home-hero__lede">
              從哥本哈根的港灣，穿越挪威峽灣與瑞典王城，最後抵達赫爾辛基；一冊為家人整理的北歐私人旅行手記。
            </p>

            <dl className="home-hero__facts" aria-label="旅行基本資料">
              <div>
                <dt>日期</dt>
                <dd>
                  <time dateTime={trip.startDate}>{startDate}</time>
                  <span aria-hidden> — </span>
                  <time dateTime={trip.endDate}>{endDate}</time>
                </dd>
              </div>
              <div>
                <dt>旅程</dt>
                <dd>{itinerary.length} 天 · 四國</dd>
              </div>
              <div>
                <dt>同行</dt>
                <dd>家族旅遊</dd>
              </div>
            </dl>

            <p className="home-hero__countries">{trip.countries.join(" · ")}</p>

            <div className="home-hero__actions">
              <Link className="home-button-light" href="/itinerary">
                查看每日行程
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link className="home-button-outline" href="/destinations">
                文化指南
                <Compass className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="home-hero__mode">
            <TripModeBanner
              trip={trip}
              itinerary={itinerary}
              destinations={destinations}
            />
          </div>
        </div>

        <a className="home-hero__scroll" href="#route">
          沿著旅程向下
          <span aria-hidden>↓</span>
        </a>
      </section>

      <section id="route" className="home-section" aria-labelledby="route-title">
        <div className="site-container">
          <header className="home-section__header">
            <div>
              <p className="eyebrow">Confirmed route · 2026-08-11</p>
              <h2 id="route-title" className="section-title">
                五段移動，串起北歐四國
              </h2>
            </div>
            <p className="home-section__intro">
              行程順序依旅行社 2026 年 8 月 11 日確認版行程表整理；點選節點可直接前往對應 Day。
            </p>
          </header>

          <div className="surface-card home-route-card">
            <RouteLine stops={routeStops.length} />
            <ol className="home-route-list">
              {routeStops.map((stop, index) => (
                <li key={`${stop.destinationId}-${stop.day}`}>
                  <Link
                    className="home-route-stop"
                    href={`/itinerary#day-${stop.day}`}
                    aria-label={`${stop.days} ${stop.destination.country} ${stop.place}：${stop.note}`}
                  >
                    <span className="home-route-stop__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="home-route-stop__country">
                      {stop.destination.country} · {stop.days}
                    </span>
                    <strong>{stop.place}</strong>
                    <span className="home-route-stop__note">{stop.note}</span>
                    <span className="home-route-stop__link">
                      前往行程
                      <ArrowRight className="size-3.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="home-section home-section--mist" aria-labelledby="highlights-title">
        <div className="site-container">
          <header className="home-section__header">
            <div>
              <p className="eyebrow">Confirmed highlights</p>
              <h2 id="highlights-title" className="section-title">
                已確認寫入行程的北歐片段
              </h2>
            </div>
            <p className="home-section__intro">
              本區收錄確認版行程表列明的重點；場館開放、道路狀況與實際集合時間仍以現場通知為準。
            </p>
          </header>

          <ol className="home-highlight-grid">
            {confirmedHighlights.map((highlight) => (
              <li className="surface-card home-highlight" key={highlight.name}>
                <div className="home-highlight__topline">
                  <span>{highlight.kicker}</span>
                  <StatusBadge status={highlight.activity.status} />
                </div>
                <p className="home-highlight__day">Day {highlight.day}</p>
                <h3>{highlight.activity.name}</h3>
                <p>{highlight.activity.description}</p>
                <Link href={`/itinerary#day-${highlight.day}`}>
                  閱讀 Day {highlight.day}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-journal" aria-labelledby="journal-title">
        <div className="site-container">
          <header className="home-journal__heading">
            <p className="eyebrow">An editorial journey</p>
            <h2 id="journal-title" className="section-title">
              從彩色港屋，走進峽灣深處
            </h2>
            <p className="lede">
              城市不是清單，峽灣也不只是風景。每一站都以行程日、地圖與文化背景相互連結，讓家人出發前就能建立共同的旅途輪廓。
            </p>
          </header>

          {copenhagenImage && copenhagen ? (
            <article className="home-story">
              <figure className="home-story__figure">
                <Image
                  className="home-story__image"
                  src={assetPath(copenhagenImage.src)}
                  alt={copenhagenImage.alt}
                  width={copenhagenImage.width}
                  height={copenhagenImage.height}
                  sizes="(min-width: 64rem) 55vw, 100vw"
                />
                <figcaption>丹麥 · 哥本哈根新港</figcaption>
              </figure>
              <div className="home-story__copy">
                <p className="home-story__number">01 · Denmark</p>
                <h3>港灣晨光，作為北歐的第一印象</h3>
                <p>{copenhagen.introduction}</p>
                <div className="home-story__links">
                  <Link href="/itinerary#day-3">
                    查看 Day 3
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <a
                    href={copenhagen.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="size-4" aria-hidden />
                    Google Maps
                  </a>
                </div>
              </div>
            </article>
          ) : null}

          {bergenImage && bergen ? (
            <article className="home-story home-story--reverse">
              <figure className="home-story__figure">
                <Image
                  className="home-story__image"
                  src={assetPath(bergenImage.src)}
                  alt={bergenImage.alt}
                  width={bergenImage.width}
                  height={bergenImage.height}
                  sizes="(min-width: 64rem) 55vw, 100vw"
                />
                <figcaption>挪威 · 卑爾根布里根</figcaption>
              </figure>
              <div className="home-story__copy">
                <p className="home-story__number">02 · Norway</p>
                <h3>從漢薩港都，轉入山谷、鐵路與峽灣</h3>
                <p>{bergen.introduction}</p>
                <div className="home-story__links">
                  <Link href="/itinerary#day-5">
                    查看 Day 5
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <a
                    href={bergen.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="size-4" aria-hidden />
                    Google Maps
                  </a>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="home-closing" aria-labelledby="closing-title">
        <div className="site-container home-closing__inner">
          <p className="home-closing__eyebrow">13 days · 4 countries · one family</p>
          <h2 id="closing-title">每天的路，都已放回它正確的位置。</h2>
          <p>
            從 Day 1 出發到 Day 13 返抵台北，逐日查看已確認交通、住宿、文化提醒、地圖與目的地天氣。
          </p>
          <Link className="home-button-light" href="/itinerary">
            開始閱讀完整行程
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <style>{`
        .home-hero {
          position: relative;
          isolation: isolate;
          display: grid;
          min-height: calc(100svh - var(--header-height));
          align-items: end;
          overflow: hidden;
          background: var(--pine-950);
          color: var(--snow);
        }

        .home-hero__image {
          z-index: -3;
          object-fit: cover;
          object-position: center 48%;
          animation: home-hero-settle 9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .home-hero__veil {
          position: absolute;
          z-index: -2;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(5, 20, 17, 0.9) 0%, rgba(5, 20, 17, 0.58) 49%, rgba(5, 20, 17, 0.24) 100%),
            linear-gradient(0deg, rgba(5, 20, 17, 0.76) 0%, transparent 52%);
        }

        .home-hero__inner {
          display: grid;
          gap: 2rem;
          align-items: end;
          padding-block: clamp(4rem, 9vw, 7.5rem) clamp(6.5rem, 9vw, 8rem);
        }

        .home-hero__copy {
          max-width: 52rem;
        }

        .home-hero__copy > * {
          animation: home-fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .home-hero__copy > :nth-child(2) { animation-delay: 100ms; }
        .home-hero__copy > :nth-child(3) { animation-delay: 180ms; }
        .home-hero__copy > :nth-child(4) { animation-delay: 260ms; }
        .home-hero__copy > :nth-child(5) { animation-delay: 320ms; }
        .home-hero__copy > :nth-child(6) { animation-delay: 380ms; }

        .home-hero__eyebrow,
        .home-closing__eyebrow {
          color: var(--brass-300);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .home-hero__title {
          max-width: 11ch;
          margin-top: 1rem;
          font-family: var(--font-display);
          font-size: clamp(3rem, 8.5vw, 7.2rem);
          font-weight: 500;
          letter-spacing: -0.05em;
          line-height: 0.93;
          text-shadow: 0 0.2rem 2rem rgba(0, 0, 0, 0.2);
        }

        .home-hero__lede {
          max-width: 43rem;
          margin-top: 1.35rem;
          color: rgba(248, 247, 242, 0.9);
          font-size: clamp(1rem, 1.7vw, 1.2rem);
          line-height: 1.8;
        }

        .home-hero__facts {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem 2.5rem;
          margin-top: 1.75rem;
        }

        .home-hero__facts div {
          display: grid;
          gap: 0.15rem;
        }

        .home-hero__facts dt {
          color: var(--brass-300);
          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .home-hero__facts dd {
          font-size: 0.92rem;
          font-weight: 650;
        }

        .home-hero__countries {
          margin-top: 1rem;
          color: rgba(248, 247, 242, 0.75);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .home-hero__actions,
        .home-story__links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.75rem;
        }

        .home-button-light,
        .home-button-outline {
          display: inline-flex;
          min-height: 3rem;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--snow);
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 800;
          text-decoration: none;
          transition: transform var(--transition-standard), background-color var(--transition-standard), color var(--transition-standard);
        }

        .home-button-light {
          background: var(--snow);
          color: var(--pine-950);
        }

        .home-button-outline {
          background: rgba(11, 37, 32, 0.18);
          color: var(--snow);
        }

        .home-button-light:hover,
        .home-button-outline:hover {
          transform: translateY(-2px);
        }

        .home-button-outline:hover {
          background: rgba(248, 247, 242, 0.12);
        }

        .home-hero__mode {
          width: min(100%, 28rem);
        }

        .home-hero__scroll {
          position: absolute;
          right: 1.25rem;
          bottom: 1.25rem;
          display: none;
          align-items: center;
          gap: 0.7rem;
          color: rgba(248, 247, 242, 0.75);
          font-size: 0.7rem;
          font-weight: 750;
          letter-spacing: 0.12em;
          text-decoration: none;
          text-transform: uppercase;
          writing-mode: vertical-rl;
        }

        .home-section {
          padding-block: clamp(4.5rem, 10vw, 8rem);
        }

        .home-section--mist {
          background: var(--mist-100);
        }

        .home-section__header {
          display: grid;
          gap: 1.5rem;
          align-items: end;
          margin-bottom: clamp(2.25rem, 5vw, 4rem);
        }

        .home-section__header .section-title {
          max-width: 15ch;
          margin-top: 0.8rem;
        }

        .home-section__intro {
          max-width: 34rem;
          color: var(--stone-700);
          line-height: 1.8;
        }

        .home-route-card {
          padding: clamp(1.25rem, 3vw, 2.5rem);
          overflow: hidden;
        }

        .home-route-list {
          display: grid;
          gap: 0.75rem;
          margin: 1rem 0 0;
          padding: 0;
          list-style: none;
        }

        .home-route-stop {
          display: grid;
          min-height: 12rem;
          align-content: start;
          padding: 1.1rem;
          border: 1px solid var(--stone-200);
          border-radius: 1rem;
          background: var(--stone-50);
          text-decoration: none;
          transition: transform var(--transition-standard), border-color var(--transition-standard), background-color var(--transition-standard);
        }

        .home-route-stop:hover {
          transform: translateY(-3px);
          border-color: var(--brass-400);
          background: white;
        }

        .home-route-stop__index {
          color: var(--brass-500);
          font-family: var(--font-display);
          font-size: 1.4rem;
        }

        .home-route-stop__country,
        .home-highlight__day,
        .home-story__number {
          margin-top: 0.5rem;
          color: var(--brass-500);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .home-route-stop strong {
          margin-top: 0.35rem;
          font-family: var(--font-display);
          font-size: 1.35rem;
          line-height: 1.15;
        }

        .home-route-stop__note {
          margin-top: 0.5rem;
          color: var(--stone-500);
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .home-route-stop__link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: auto;
          padding-top: 1rem;
          color: var(--pine-700);
          font-size: 0.76rem;
          font-weight: 800;
        }

        .home-highlight-grid {
          display: grid;
          gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .home-highlight {
          display: flex;
          min-height: 19rem;
          flex-direction: column;
          padding: clamp(1.25rem, 3vw, 2rem);
        }

        .home-highlight__topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: var(--stone-500);
          font-size: 0.67rem;
          font-weight: 750;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .home-highlight h3 {
          margin-top: 0.7rem;
          font-family: var(--font-display);
          font-size: clamp(1.65rem, 3vw, 2.15rem);
          font-weight: 600;
          line-height: 1.12;
        }

        .home-highlight > p:last-of-type {
          margin-top: 1rem;
          color: var(--stone-700);
          font-size: 0.9rem;
          line-height: 1.75;
        }

        .home-highlight > a {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          width: fit-content;
          margin-top: auto;
          padding-top: 1.25rem;
          color: var(--pine-700);
          font-size: 0.82rem;
          font-weight: 800;
          text-decoration-color: var(--brass-400);
        }

        .home-journal {
          padding-block: clamp(5rem, 11vw, 9rem);
        }

        .home-journal__heading {
          max-width: 52rem;
          margin-bottom: clamp(3rem, 8vw, 6rem);
        }

        .home-journal__heading .section-title {
          margin-top: 0.8rem;
        }

        .home-story {
          display: grid;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
        }

        .home-story + .home-story {
          margin-top: clamp(5rem, 12vw, 10rem);
        }

        .home-story__figure {
          overflow: hidden;
          border-radius: var(--radius-card);
          background: var(--stone-100);
          box-shadow: var(--shadow-soft);
        }

        .home-story__image {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .home-story__figure:hover .home-story__image {
          transform: scale(1.025);
        }

        .home-story__figure figcaption {
          padding: 0.8rem 1rem;
          color: var(--stone-500);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .home-story__copy h3 {
          margin-top: 0.75rem;
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.4rem);
          font-weight: 550;
          letter-spacing: -0.035em;
          line-height: 1.08;
        }

        .home-story__copy > p:last-of-type {
          margin-top: 1.25rem;
          color: var(--stone-700);
          line-height: 1.9;
        }

        .home-story__links a {
          display: inline-flex;
          min-height: 2.75rem;
          align-items: center;
          gap: 0.45rem;
          color: var(--pine-700);
          font-size: 0.85rem;
          font-weight: 800;
          text-decoration-color: var(--brass-400);
        }

        .home-closing {
          position: relative;
          overflow: hidden;
          padding-block: clamp(5rem, 10vw, 8rem);
          background: var(--pine-900);
          color: var(--snow);
        }

        .home-closing::after {
          position: absolute;
          right: -8rem;
          bottom: -13rem;
          width: 28rem;
          aspect-ratio: 1;
          border: 1px solid rgba(209, 180, 123, 0.18);
          border-radius: 50%;
          content: "";
        }

        .home-closing__inner {
          position: relative;
          z-index: 1;
        }

        .home-closing h2 {
          max-width: 15ch;
          margin-top: 0.8rem;
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 6vw, 5.25rem);
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 1.02;
        }

        .home-closing p:not(.home-closing__eyebrow) {
          max-width: 42rem;
          margin-top: 1.25rem;
          color: var(--mist-100);
        }

        .home-closing .home-button-light {
          margin-top: 2rem;
        }

        @keyframes home-hero-settle {
          from { transform: scale(1.065) translate3d(0, -0.4%, 0); }
          to { transform: scale(1.01) translate3d(0, 0, 0); }
        }

        @keyframes home-fade-up {
          from { opacity: 0; transform: translate3d(0, 1rem, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @media (min-width: 42rem) {
          .home-route-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .home-highlight-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 64rem) {
          .home-hero__inner {
            grid-template-columns: minmax(0, 1.4fr) minmax(20rem, 0.6fr);
          }

          .home-hero__mode {
            justify-self: end;
          }

          .home-hero__scroll {
            display: flex;
          }

          .home-section__header {
            grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.55fr);
          }

          .home-route-list {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .home-highlight-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .home-story {
            grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
          }

          .home-story--reverse {
            grid-template-columns: minmax(18rem, 0.75fr) minmax(0, 1.25fr);
          }

          .home-story--reverse .home-story__figure {
            grid-column: 2;
          }

          .home-story--reverse .home-story__copy {
            grid-row: 1;
            grid-column: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-hero__image,
          .home-hero__copy > * {
            animation: none;
          }

          .home-story__image,
          .home-story__figure:hover .home-story__image,
          .home-button-light:hover,
          .home-button-outline:hover,
          .home-route-stop:hover {
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
