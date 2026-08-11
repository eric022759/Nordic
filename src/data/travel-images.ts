export interface TravelPhoto {
  src: string;
  alt: string;
  focalPosition: string;
}

export const dayImages: Record<number, TravelPhoto> = {
  1: {
    src: "/images/day-01-taoyuan-airport.webp",
    alt: "自空中俯瞰桃園國際機場航廈與跑道",
    focalPosition: "50% 50%",
  },
  2: {
    src: "/images/day-02-kronborg-castle.webp",
    alt: "藍天下的丹麥克倫堡城堡與草地",
    focalPosition: "50% 48%",
  },
  3: {
    src: "/images/day-03-nyhavn.webp",
    alt: "從空中俯瞰哥本哈根新港運河與彩色屋舍",
    focalPosition: "50% 54%",
  },
  4: {
    src: "/images/day-04-munch-museum.webp",
    alt: "奧斯陸 MUNCH Museum 現代建築外觀",
    focalPosition: "50% 56%",
  },
  5: {
    src: "/images/day-05-voringsfossen.webp",
    alt: "挪威沃林瀑布沿峽谷奔流而下",
    focalPosition: "50% 48%",
  },
  6: {
    src: "/images/day-06-flam-railway.webp",
    alt: "挪威峽灣與山谷相接的弗洛姆風景",
    focalPosition: "50% 50%",
  },
  7: {
    src: "/images/day-07-briksdal-glacier.webp",
    alt: "山谷溪流與布里克斯達冰河",
    focalPosition: "50% 40%",
  },
  8: {
    src: "/images/day-08-trollstigen.webp",
    alt: "精靈之路盤旋於挪威陡峭山谷",
    focalPosition: "50% 50%",
  },
  9: {
    src: "/images/day-09-oslo-opera-house.webp",
    alt: "奧斯陸歌劇院廣場與臨水城市建築",
    focalPosition: "50% 58%",
  },
  10: {
    src: "/images/day-10-stockholm-palace.webp",
    alt: "斯德哥爾摩王宮與舊城濱水天際線",
    focalPosition: "50% 50%",
  },
  11: {
    src: "/images/day-11-porvoo-old-town.webp",
    alt: "波爾沃河岸紅色木屋倒映水面",
    focalPosition: "50% 50%",
  },
  12: {
    src: "/images/day-12-helsinki-cathedral.webp",
    alt: "赫爾辛基大教堂與南港城市景觀",
    focalPosition: "50% 48%",
  },
  13: {
    src: "/images/day-13-taipei-night.webp",
    alt: "台北夕陽天際線與台北 101",
    focalPosition: "50% 50%",
  },
};

export type PageBackgroundKey =
  | "itinerary"
  | "destinations"
  | "prepare"
  | "info";

export const pageBackgroundImages: Record<PageBackgroundKey, TravelPhoto> = {
  itinerary: {
    src: "/images/background-itinerary-geirangerfjord.webp",
    alt: "北歐城市秋日街景",
    focalPosition: "50% 45%",
  },
  destinations: {
    src: "/images/background-destinations-oresund.webp",
    alt: "哥本哈根新港彩色屋舍與運河",
    focalPosition: "50% 52%",
  },
  prepare: {
    src: "/images/background-prepare-lofoten.webp",
    alt: "北歐雪地上空的繽紛極光",
    focalPosition: "50% 50%",
  },
  info: {
    src: "/images/background-info-helsinki-harbour.webp",
    alt: "斯德哥爾摩舊城街道與瑞典國旗",
    focalPosition: "50% 48%",
  },
};
