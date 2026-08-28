import type { Metadata } from "next";

import { ScenicPageShell } from "@/components/site/ScenicPageShell";
import {
  PackingChecklist,
  type PackingChecklistGroup,
} from "@/components/trip/PackingChecklist";
import { Footprints, HeartHandshake, Ship, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "行前準備",
  description:
    "北歐四國 13 日旅行的證件、分層衣物、雨具、藥品、電源與裝置本機行李清單。",
};

const packingGroups = [
  {
    id: "documents",
    title: "證件與重要文件",
    description: "正本放隨身包，備份放在不同位置；內容以旅行社最終行前通知為準。",
    items: [
      { id: "passport", label: "護照正本", note: "先核對有效期限、姓名拼音與旅行社要求。" },
      { id: "passport-copy", label: "護照影本與安全的離線備份", note: "影本與正本分開收納。" },
      { id: "insurance", label: "旅遊保險文件", note: "保單、協助方式與理賠所需資料一起準備。" },
      { id: "tickets", label: "機票、行程與最終行前資料", note: "下載離線版本，集合資訊以最新版為準。" },
      { id: "contacts", label: "緊急聯絡資料紙本", note: "不要只放在同一支手機裡。" },
      { id: "payments", label: "信用卡、提款卡與適量現金", note: "分開收納，出發前確認海外交易設定。" },
    ],
  },
  {
    id: "luggage",
    title: "托運與隨身行李",
    description: "依 2026 年 8 月 11 日確認版行程表準備一大一小行李；實際尺寸與特殊物品仍須遵守航空公司規定。",
    items: [
      { id: "checked-luggage", label: "一大一小行李配置", note: "土耳其航空國際段：托運每人 1 件 30 公斤、手提每人 1 件 7 公斤；出發前再次量重並核對航空公司尺寸限制。" },
      { id: "fjord-weight-limit", label: "峽灣區托運行李控制在 23 公斤", note: "挪威峽灣山區道路規範遊覽車總重、有時需過磅；峽灣區行程結束前托運行李每人限 1 件 23 公斤，以免車輛超重導致罰款及行程延誤。" },
      { id: "ferry-overnight-bag", label: "遊輪過夜包", note: "放一晚衣物、藥品、盥洗用品、充電器與重要證件；主要行李依領隊指示留在船艙。" },
      { id: "attraction-side-bag", label: "景點用小型側背包", note: "部分景點可能限制後背包；準備可貼身攜帶證件、手機與藥品的小包。" },
      { id: "luggage-tags", label: "藍色旅行社行李牌與個人識別", note: "確認版指定藍色行李牌；綁牢並在行李內外留下不過度公開的聯絡方式。" },
    ],
  },
  {
    id: "layers",
    title: "分層衣物",
    description: "9 月北歐城市、峽灣與山區體感可能不同，重點是能隨時穿上或脫下。",
    items: [
      { id: "base-layers", label: "排汗內層與長袖上衣", note: "準備足夠替換，避免只帶厚重單件衣物。" },
      { id: "mid-layer", label: "薄毛衣、刷毛或羊毛中層", note: "遊船甲板、清晨與高地可快速加穿。" },
      { id: "waterproof-shell", label: "防風防水外套", note: "最好有帽子，峽灣與瀑布水霧時更實用。" },
      { id: "warm-jacket", label: "輕量保暖外套", note: "怕冷者可準備輕羽絨或同等保暖層。" },
      { id: "walking-pants", label: "耐走、快乾長褲", note: "避免只帶吸水後不易乾的厚重褲裝。" },
      { id: "underwear-socks", label: "內著與保暖、排汗襪", note: "多走路時乾爽襪子能減少摩擦。" },
      { id: "sleepwear", label: "舒適睡衣與室內薄層", note: "旅館室內外溫差大時方便調整。" },
    ],
  },
  {
    id: "weather-walking",
    title: "雨天、保暖與步行",
    description: "鞋子先在家穿過；雨具與保暖配件放在每天都拿得到的位置。",
    items: [
      { id: "waterproof-shoes", label: "已穿習慣的防水耐走鞋", note: "鞋底需防滑，不要把全新鞋留到旅程第一天。" },
      { id: "backup-shoes", label: "備用耐走鞋或鞋墊", note: "主鞋進水時仍有可替換方案。" },
      { id: "warm-accessories", label: "薄帽、圍巾與手套", note: "輕巧好收，比臨時忍冷更安心。" },
      { id: "rain-gear", label: "輕便雨具與防水帽", note: "風大時不要只依賴雨傘。" },
      { id: "daypack", label: "輕量隨身背包與防雨套", note: "可放外套、水、藥與紙本資料。" },
      { id: "sun-care", label: "太陽眼鏡與防曬用品", note: "水面與高地仍可能有明顯反光。" },
      { id: "water-bottle", label: "可補水的水瓶", note: "少量多次喝水，搭車前依自身需求調整。" },
    ],
  },
  {
    id: "health",
    title: "藥品與身體照顧",
    description: "藥品需求因人而異；處方、攜帶方式與用藥問題請先詢問醫師或藥師。",
    items: [
      { id: "regular-medicine", label: "足量常備藥與處方藥", note: "保留原包裝並放隨身行李，不要全數托運。" },
      { id: "medicine-list", label: "藥名、劑量與過敏資訊清單", note: "紙本與手機各留一份。" },
      { id: "symptom-medicine", label: "依個人需要準備腸胃、止痛或過敏用藥", note: "先向醫師或藥師確認是否適合。" },
      { id: "motion-sickness", label: "暈船或暈車準備", note: "有需要者事前詢問專業人員，不要臨時混用藥物。" },
      { id: "first-aid", label: "小型護理包", note: "可放個人常用的 OK 繃、護膝或足部用品。" },
      { id: "hygiene", label: "口罩、乾洗手與個人清潔用品", note: "北歐部分旅館不提供牙刷、牙膏，請自行攜帶；轉乘用品放在容易拿取處。" },
    ],
  },
  {
    id: "power-tech",
    title: "電源與手機",
    description: "所有設備在家先試裝一次；規格與攜帶限制須以航空公司及產品標示為準。",
    items: [
      { id: "power-adapter", label: "220V 雙圓孔電源轉接頭", note: "四國均為 220V、雙圓孔插座；同時核對設備本身是否支援 220V。" },
      { id: "chargers", label: "手機、手錶與相機充電線", note: "收在同一個有標示的小袋中。" },
      { id: "power-bank", label: "行動電源與備用鋰電池", note: "鋰電池不得托運，依航空公司規定放隨身行李並確認容量標示、端點防短路。" },
      { id: "connectivity", label: "漫遊、eSIM 或其他上網方案", note: "出發前啟用並記下客服或設定方式。" },
      { id: "offline-files", label: "離線地圖與重要文件", note: "先下載，再切換飛航模式測試能否開啟。" },
    ],
  },
] satisfies readonly PackingChecklistGroup[];

const scenarioAdvice = [
  {
    title: "峽灣與瀑布",
    icon: Waves,
    points: ["外層要防風防水，薄保暖層放隨身包。", "步道、觀景台與水霧區可能濕滑，穿防滑鞋並扶好欄杆。", "相機與手機準備簡單防雨收納。"],
  },
  {
    title: "遊輪與峽灣船",
    icon: Ship,
    points: ["甲板風感常比室內明顯，出艙前先加一層。", "斯德哥爾摩至赫爾辛基夜航須另備遊輪過夜包，把藥品、證件、一晚衣物與盥洗用品放在易取的小包。", "有暈船顧慮者，出發前先向醫師或藥師詢問。"],
  },
  {
    title: "城市步行",
    icon: Footprints,
    points: ["穿已磨合的耐走鞋，每天保留坐下休息的時間。", "哥本哈根要特別留意自行車道；過街前先看兩側。", "部分景點可能限制後背包；小型側背包放證件、手機與藥，雨具和薄外套依現場規定寄放或隨身。"],
  },
] as const;

export default function PreparePage() {
  return (
    <ScenicPageShell background="prepare">
      <header className="page-hero">
        <div className="site-container py-16 sm:py-20 lg:py-24">
          <p className="eyebrow">Travel preparation</p>
          <h1 className="display-title mt-4">行前準備</h1>
          <p className="lede mt-6 max-w-3xl">
            把證件、分層衣物、雨具、藥品與電源一次整理好。每一項都能在這台裝置上勾選，慢慢準備就好。
          </p>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--stone-500)]">
            本頁為 9 月北歐的一般行前建議，不是行程當日的精準天氣預報；出發前請再查看近期天氣與旅行社最終通知。
          </p>
        </div>
      </header>

      <div className="site-container space-y-16 py-14 sm:space-y-20 sm:py-20">
        <PackingChecklist groups={packingGroups} />

        <section aria-labelledby="scenario-title">
          <p className="eyebrow">依場景放進隨身包</p>
          <h2 id="scenario-title" className="section-title mt-3">
            三種旅程情境
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {scenarioAdvice.map(({ title, icon: Icon, points }) => (
              <article key={title} className="surface-card p-6 sm:p-7">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--mist-100)] text-[var(--pine-700)]">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[var(--pine-950)]">{title}</h3>
                <ul className="mt-4 space-y-3 text-base leading-7 text-[var(--stone-700)]">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brass-500)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <aside
          aria-labelledby="mother-reminder-title"
          className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--brass-400)]/60 bg-[var(--pine-900)] p-7 text-[var(--snow)] shadow-[var(--shadow-soft)] sm:p-10 lg:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
            <div>
              <HeartHandshake aria-hidden="true" className="h-10 w-10 text-[var(--brass-300)]" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brass-300)]">Gentle reminder</p>
              <h2 id="mother-reminder-title" className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
                給媽媽的小提醒
              </h2>
            </div>
            <ul className="grid gap-4 text-xl leading-8 sm:text-2xl sm:leading-9">
              <li>鞋子先穿過。不要帶全新的鞋出門。</li>
              <li>藥、護照、手機放隨身包。不要托運。</li>
              <li>覺得冷，先加一層。不要忍。</li>
              <li>覺得累，就坐下休息。旅程不用趕。</li>
              <li>每天出門前，摸一摸：護照、手機、房卡。</li>
              <li>集合時間不確定，就直接問領隊。</li>
            </ul>
          </div>
        </aside>
      </div>
    </ScenicPageShell>
  );
}
