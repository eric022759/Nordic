export interface ImageCredit {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  sourceUrl: string;
  author: string;
  licenseOrUsageNote: string;
}

export const imageCredits: ImageCredit[] = [
  {
    id: "social-card",
    src: "/og.png",
    alt: "北歐四國十三日旅程的峽灣主題分享預覽圖",
    width: 1200,
    height: 630,
    sourceUrl: "/og.png",
    author: "OpenAI image generation",
    licenseOrUsageNote:
      "為本專案原創生成並縮放成 1200×630 的分享卡；屬風格化視覺，不作為景點紀實照片。",
  },
  {
    id: "geiranger-hero",
    src: "/images/geiranger-hero.jpg",
    alt: "群山與森林環抱的挪威蓋朗格峽灣全景",
    width: 3840,
    height: 1678,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Geirangerfjord_Panorama_-_panoramio.jpg",
    author: "H.-N. Meiforth",
    licenseOrUsageNote:
      "CC BY 3.0；網站使用 Wikimedia 下載之本機尺寸版本，未做語意性修改。",
  },
  {
    id: "copenhagen-nyhavn",
    src: "/images/copenhagen-nyhavn.jpg",
    alt: "哥本哈根新港沿岸的彩色房屋與運河",
    width: 1920,
    height: 1440,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Copenhagen,_Nyhavn.jpg",
    author: "Gerda Arendt",
    licenseOrUsageNote:
      "CC0 1.0；網站使用 Wikimedia 下載之本機尺寸版本。",
  },
  {
    id: "bergen-bryggen",
    src: "/images/bergen-bryggen.jpg",
    alt: "卑爾根布里根區一列色彩沉穩的木造建築",
    width: 1280,
    height: 853,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Bergen_-_Bryggen.jpg",
    author: "Percita",
    licenseOrUsageNote:
      "CC BY-SA 2.0；網站使用 Wikimedia 原始檔之本機副本，未做語意性修改。",
  },
];
