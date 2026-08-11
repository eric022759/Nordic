import type { CultureGuide } from "@/types/trip";

const LAST_REVIEWED_AT = "2026-07-20";
const OPTIONAL_NOTE =
  "以下均為旅途中若順路可選的文化與飲食靈感，不是固定行程、預約、供應或天氣保證；請於出發前再次確認。";

export const cultureGuides: CultureGuide[] = [
  {
    id: "denmark",
    country: "丹麥",
    localName: "Danmark",
    summary:
      "哥本哈根的城市節奏適合步行、港邊散步與短暫咖啡休息，但自行車道是正式交通空間。以尊重動線、準時集合和不將生活概念刻板化為原則。",
    foodAndDrink: [
      "自選：Smørrebrød 開放式黑麥麵包",
      "自選：Frikadeller 丹麥肉丸或 Stegt flæsk 烤豬肉",
      "自選：Kanelsnegl 肉桂捲與咖啡",
      "成人自選：當地啤酒或 Akvavit；勿與團體移動或駕駛安排衝突",
    ],
    etiquette: [
      "步行時避免停在自行車道；穿越前先看雙向來車。",
      "餐飲服務費通常已包含，小費完全自願。",
      "Hygge 可作咖啡館體驗靈感，不代表每位丹麥人的固定生活方式。",
    ],
    clothingAdvice: [
      "8 月底至 9 月初沿海風感較強，備薄長袖或針織衫。",
      "攜帶輕量防風防水外套、折傘與耐走包鞋。",
      "精確溫度與雨勢須於出發前 7–10 天查看預報。",
    ],
    optionalExperiences: ["在新港附近選一間咖啡館短暫休息", "於自理餐時嘗試一份 Smørrebrød"],
    sourceReference:
      `${OPTIONAL_NOTE} 參考 VisitDenmark：` +
      "https://www.visitdenmark.com/denmark/things-do/eat-drink/traditional-danish-food 、" +
      "https://www.visitdenmark.com/faq/climate 、" +
      "https://www.visitdenmark.com/faq/cycling-rules 、" +
      "https://www.visitdenmark.com/faq/tipping",
    status: "optional",
    lastReviewedAt: LAST_REVIEWED_AT,
  },
  {
    id: "sweden",
    country: "瑞典",
    localName: "Sverige",
    summary:
      "瑞典段以哥特堡、厄勒布魯與斯德哥爾摩為主，固定行程之外的空檔有限。Fika 可理解為放慢速度、用咖啡和點心交流的方式，而不是必須遵守的時刻表。",
    foodAndDrink: [
      "自選：Fika 咖啡搭配 Kanelbulle 肉桂捲",
      "自選：Köttbullar 肉丸與越橘",
      "自選：Gravad lax 醃鮭魚或醃鯡魚",
      "自選：Raggmunk 馬鈴薯煎餅",
    ],
    etiquette: [
      "Fika 沒有固定形式或每日次數，重點是休息與交流。",
      "小費受歡迎但不強制。",
      "自然通行權仍須尊重住宅、耕地、保護區規則並帶走垃圾。",
    ],
    clothingAdvice: [
      "南部城市使用薄毛衣加防風外套的可增減層次。",
      "石板路、博物館與港口移動建議耐走、防滑鞋。",
      "精確溫度與雨勢須於出發前 7–10 天查看預報。",
    ],
    optionalExperiences: ["在哥特堡或斯德哥爾摩安排一次 Fika", "自理時段選擇瑞典肉丸或醃鮭魚"],
    sourceReference:
      `${OPTIONAL_NOTE} 參考 Visit Sweden：` +
      "https://visitsweden.com/what-to-do/food-drink/swedish-kitchen/all-about-swedish-fika/ 、" +
      "https://visitsweden.com/what-to-do/food-drink/recipes/ 、" +
      "https://traveltrade.visitsweden.com/why-sweden/practical-information/seasons-climate-and-weather/ 、" +
      "https://visitsweden.com/what-to-do/nature-outdoors/nature/sustainable-and-rural-tourism/the-right-of-public-access/",
    status: "optional",
    lastReviewedAt: LAST_REVIEWED_AT,
  },
  {
    id: "norway",
    country: "挪威",
    localName: "Norge",
    summary:
      "挪威段跨越城市、高原、瀑布、冰河與峽灣，天候和道路變化比飲食打卡更值得優先管理。自然通行權同時包含保護環境、遠離住宅與遵守封路的責任。",
    foodAndDrink: [
      "自選：Brunost 焦糖風味棕色乳清起司",
      "自選：心形挪威鬆餅或 Lefse 薄餅",
      "自選：煙燻鮭魚或當季海鮮；魚種與供應不保證",
      "自選：Fårikål 羊肉高麗菜燉菜，偏秋季且須看餐廳菜單",
    ],
    etiquette: [
      "走既有步道、帶走垃圾，並與野生動物及住宅保持距離。",
      "道路或步道封閉即改道，不跨越護欄或安全封鎖。",
      "小費通常非必要，餐廳或酒吧服務良好時可自願給予。",
    ],
    clothingAdvice: [
      "薄保暖內層、暖中層、防風防水外殼是山區基本組合。",
      "峽灣、瀑布與冰河行程建議防水耐走鞋，可加防水長褲與薄帽。",
      "精確溫度、降雨、風勢與道路狀況須於出發前及當日再查。",
    ],
    optionalExperiences: ["於旅館早餐嘗試少量 Brunost", "在卑爾根魚市場依當日供應自費品嘗海鮮"],
    sourceReference:
      `${OPTIONAL_NOTE} 參考 Visit Norway：` +
      "https://www.visitnorway.com/things-to-do/food-and-drink/cuisine/ 、" +
      "https://www.visitnorway.com/plan-your-trip/travel-tips-a-z/ 、" +
      "https://www.visitnorway.com/plan-your-trip/visitor-guidelines/ 、" +
      "https://www.visitnorway.com/plan-your-trip/travel-tips-a-z/currency-and-prices/",
    status: "optional",
    lastReviewedAt: LAST_REVIEWED_AT,
  },
  {
    id: "finland",
    country: "芬蘭",
    localName: "Suomi",
    summary:
      "芬蘭段集中在赫爾辛基與波爾沃，適合從建築、木造老城、咖啡與公共空間理解當地生活。若額外體驗 Sauna，應先閱讀場館規則，不假設裸身或男女混浴。",
    foodAndDrink: [
      "自選：Lohikeitto 奶油鮭魚湯",
      "自選：Ruisleipä 酸香黑麥麵包",
      "自選：Karjalanpiirakka 卡累利阿派",
      "自選：Muikku 小湖魚或咖啡搭芬蘭肉桂捲；供應依店家",
    ],
    etiquette: [
      "公共 Sauna 的泳衣、毛巾、男女分流與加水規則依場所指示。",
      "使用 Sauna 時顧及他人並補充水分。",
      "小費不被期待，但可依服務自願留下。",
    ],
    clothingAdvice: [
      "南部城市採洋蔥式穿法並準備防水外層。",
      "港區風勢與波爾沃石板路需要防滑、耐走鞋。",
      "精確溫度與雨勢須於出發前 7–10 天查看預報。",
    ],
    optionalExperiences: ["在波爾沃自理午餐嘗試鮭魚湯或卡累利阿派", "僅在時間與預約允許時體驗公共 Sauna"],
    sourceReference:
      `${OPTIONAL_NOTE} 參考 Visit Finland：` +
      "https://www.visitfinland.com/en/articles/finlands-traditional-and-iconic-foods/ 、" +
      "https://www.visitfinland.com/en/practical-tips/climate-and-weather-in-finland/ 、" +
      "https://www.visitfinland.com/en/things-to-do/sauna/",
    status: "optional",
    lastReviewedAt: LAST_REVIEWED_AT,
  },
];

export function getCultureGuideByCountry(country: string): CultureGuide | undefined {
  return cultureGuides.find((guide) => guide.country === country);
}

export default cultureGuides;
