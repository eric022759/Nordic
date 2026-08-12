import { createGoogleMapsUrl } from "@/lib/maps";
import { DESTINATION_GOOGLE_MAPS_URLS } from "@/data/google-maps";
import type { Destination } from "@/types/trip";

const LAST_REVIEWED_AT = "2026-08-11";
const PDF = "旅行社《2026/8/28～9/9 北歐四國行程表（已確認）》（2026-08-11 收訖確認版）";

const culturalSuggestionNote =
  "飲食、禮儀與穿著為目的地文化建議，並非固定行程、餐廳預約或供應保證。";

const countryAdvice = {
  丹麥: {
    foodAndDrink: [
      "自選：Smørrebrød 開放式黑麥麵包",
      "自選：Frikadeller 丹麥肉丸",
      "自選：Kanelsnegl 肉桂捲與咖啡",
    ],
    cultureAndEtiquette: [
      "自行車道車流快，步行時勿停留或橫站在車道上。",
      "餐飲小費通常非強制，服務滿意可自願留下。",
    ],
    clothingAdvice: ["夏末沿海風感明顯，建議薄長袖加輕量防風防水外套。", "穿著耐走包鞋並攜帶折傘。"],
  },
  瑞典: {
    foodAndDrink: [
      "自選：Fika 咖啡休息搭配 Kanelbulle 肉桂捲",
      "自選：Köttbullar 肉丸與越橘",
      "自選：Gravad lax 醃鮭魚",
    ],
    cultureAndEtiquette: [
      "Fika 是可選的休息與交流方式，沒有固定次數或形式。",
      "小費受歡迎但非強制；戶外活動仍須避開住宅與耕地。",
    ],
    clothingAdvice: ["南部城市以薄毛衣加防風外套的可增減層次為主。", "城市步行與雨天建議耐走、防滑鞋。"],
  },
  挪威: {
    foodAndDrink: [
      "自選：Brunost 棕色乳清起司",
      "自選：挪威鬆餅、煙燻鮭魚或當季海鮮",
      "自選：Lefse 薄餅",
    ],
    cultureAndEtiquette: [
      "自然通行權伴隨責任：走既有步道、帶走垃圾並遠離住宅與野生動物。",
      "小費通常非必要，餐廳或酒吧服務良好時可自願給予。",
    ],
    clothingAdvice: [
      "峽灣與山區天候變化快，採薄保暖層、暖中層、防風防水外殼。",
      "建議防水耐走鞋；冰河與瀑布行程可加防水長褲、帽子。",
    ],
  },
  芬蘭: {
    foodAndDrink: [
      "自選：Lohikeitto 奶油鮭魚湯",
      "自選：Ruisleipä 黑麥麵包",
      "自選：Karjalanpiirakka 卡累利阿派與咖啡",
    ],
    cultureAndEtiquette: [
      "公共 Sauna 規則依場所而異；泳衣、毛巾與男女分流均須看現場指示。",
      "小費不被期待，但可依服務自願留下。",
    ],
    clothingAdvice: ["南部城市在夏末初秋採洋蔥式穿法，備妥防水外層。", "石板路與港區步行建議防滑、耐走鞋。"],
  },
} as const;

type CountryName = keyof typeof countryAdvice;
type DestinationSeed = Omit<
  Destination,
  | "mapsUrl"
  | "foodAndDrink"
  | "cultureAndEtiquette"
  | "clothingAdvice"
  | "lastReviewedAt"
> & { country: CountryName };

function defineDestination(seed: DestinationSeed): Destination {
  const advice = countryAdvice[seed.country];
  const approvedMapsUrl = (
    DESTINATION_GOOGLE_MAPS_URLS as Readonly<Record<string, string>>
  )[seed.id];

  return {
    ...seed,
    mapsUrl: approvedMapsUrl ?? createGoogleMapsUrl(seed.mapsQuery, {
      latitude: seed.latitude,
      longitude: seed.longitude,
    }),
    foodAndDrink: [...advice.foodAndDrink],
    cultureAndEtiquette: [...advice.cultureAndEtiquette],
    clothingAdvice: [...advice.clothingAdvice],
    lastReviewedAt: LAST_REVIEWED_AT,
  };
}

export const destinations: Destination[] = [
  defineDestination({
    id: "copenhagen",
    name: "哥本哈根 Copenhagen",
    country: "丹麥",
    cityOrRegion: "首都大區",
    latitude: 55.67594,
    longitude: 12.56553,
    timezone: "Europe/Copenhagen",
    mapsQuery: "Copenhagen city centre Denmark",
    relatedDays: [2, 3],
    introduction:
      "哥本哈根是旅程抵達北歐後的第一座城市。第 2 天以王室與港灣地標為主，走訪克里斯欽堡、阿美琳堡、小美人魚與吉菲昂噴泉；當晚住宿 Crowne Plaza Copenhagen Towers by IHG。第 3 天再到新港散步後跨海赴瑞典，需留意自行車道與港邊風勢。",
    highlights: ["克里斯欽堡", "阿美琳堡", "小美人魚", "吉菲昂噴泉", "新港 Nyhavn"],
    sourceReference: `${PDF}第 1、4–5 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "helsingor-kronborg",
    name: "赫爾辛格與克倫堡 Helsingør & Kronborg",
    country: "丹麥",
    cityOrRegion: "北西蘭",
    latitude: 56.039332,
    longitude: 12.621799,
    timezone: "Europe/Copenhagen",
    mapsQuery: "Kronborg Castle Helsingør Denmark",
    relatedDays: [2],
    introduction:
      "克倫堡坐落於赫爾辛格海岬，面向狹窄的厄勒海峽，曾掌控丹麥與瑞典之間的重要水路。城堡因莎士比亞《哈姆雷特》的舞台原型而聞名，並於 2000 年列入世界文化遺產。",
    highlights: ["Kronborg Castle", "厄勒海峽視野", "《哈姆雷特》文化連結", "世界文化遺產"],
    sourceReference: `${PDF}第 4 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "hillerod-frederiksborg",
    name: "希勒勒與腓特烈堡 Hillerød & Frederiksborg",
    country: "丹麥",
    cityOrRegion: "北西蘭",
    latitude: 55.93451,
    longitude: 12.30041,
    timezone: "Europe/Copenhagen",
    mapsQuery: "Frederiksborg Castle Hillerød Denmark",
    relatedDays: [2],
    introduction:
      "腓特烈堡位於希勒勒的湖中島嶼，以紅磚、銅綠尖塔與荷蘭文藝復興構圖形成鮮明天際線。城堡曾是丹麥王室重要宮殿與加冕場域，火災後在嘉士伯創辦人 J. C. Jacobsen 支持下修復，現為丹麥國立歷史博物館。",
    highlights: ["Frederiksborg Castle", "國立歷史博物館", "湖畔城堡景觀", "荷蘭文藝復興建築"],
    sourceReference: `${PDF}第 4 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "oresund-bridge",
    name: "厄勒海峽大橋 Øresund Bridge",
    country: "丹麥",
    cityOrRegion: "哥本哈根—馬爾默跨境海峽",
    latitude: 55.576444,
    longitude: 12.821639,
    timezone: "Europe/Copenhagen",
    mapsQuery: "Øresund Bridge centre Denmark Sweden",
    relatedDays: [3],
    introduction:
      "厄勒海峽通道由跨海大橋、佩伯霍爾姆人工島與海底隧道共同連接丹麥哥本哈根和瑞典馬爾默。第 3 天行程是在遊覽車上跨境通行，不是安排停車參觀；沿途可觀察橋面逐漸銜接島嶼與隧道的工程配置，拍攝仍須服從車內安全規定。",
    highlights: ["丹麥—瑞典跨境通道", "跨海公路與鐵路", "佩伯霍爾姆人工島", "橋隧轉換景觀"],
    sourceReference: `${PDF}第 5 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "gothenburg",
    name: "哥特堡 Gothenburg",
    country: "瑞典",
    cityOrRegion: "西約塔蘭省",
    latitude: 57.7075,
    longitude: 11.9675,
    timezone: "Europe/Stockholm",
    mapsQuery: "Gothenburg city centre Sweden",
    relatedDays: [3, 4],
    introduction:
      "哥特堡位於瑞典西岸，是本行程跨越厄勒海峽後的第一個瑞典住宿點，也是北歐重要港口與 Volvo 發源城市。第 3 天住宿已確認為 Quality Hotel 11，當日未列固定入內景點；翌日即前往奧斯陸，因此額外運河散步、咖啡館或購物只能視抵達時間自選。",
    highlights: ["瑞典西岸港都", "哥特堡市中心", "Volvo 城市脈絡", "前往奧斯陸的中繼點"],
    sourceReference: `${PDF}第 1、5 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "orebro",
    name: "厄勒布魯 Örebro",
    country: "瑞典",
    cityOrRegion: "厄勒布魯省",
    latitude: 59.2738889,
    longitude: 15.2152778,
    timezone: "Europe/Stockholm",
    mapsQuery: "Örebro Castle Sweden",
    relatedDays: [9, 10],
    introduction:
      "厄勒布魯位在瑞典中部，是奧斯陸前往斯德哥爾摩長途移動間的住宿中繼。第 9 天住宿已確認為 Clarion Hotel Örebro；抵達時只規劃行經厄勒布魯城堡，沒有列入內參觀。第 10 天早餐後續往首都，若時間允許才在城堡外圍短暫散步。",
    highlights: ["厄勒布魯城堡外觀", "Svartån 河畔", "瑞典中部中繼城市", "前往斯德哥爾摩路線"],
    sourceReference: `${PDF}第 2、8 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "stockholm",
    name: "斯德哥爾摩 Stockholm",
    country: "瑞典",
    cityOrRegion: "斯德哥爾摩省",
    latitude: 59.3294444,
    longitude: 18.0686111,
    timezone: "Europe/Stockholm",
    mapsQuery: "Stockholm city centre Sweden",
    relatedDays: [10],
    introduction:
      "斯德哥爾摩展開在梅拉倫湖與波羅的海交會的島嶼間。行程聚焦保存 17 世紀戰艦的瓦薩博物館，以及老城中的斯德哥爾摩王宮；午後前往港口搭乘已確認的 Tallink Silja Line 夜航遊輪前往赫爾辛基。衛兵交接、王宮開放區域與實際登船作業仍依當日公告。",
    highlights: ["瓦薩號博物館", "斯德哥爾摩王宮", "老城 Gamla stan", "Tallink Silja Line 波羅的海夜航"],
    sourceReference: `${PDF}第 3、8–9 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "oslo",
    name: "奧斯陸 Oslo",
    country: "挪威",
    cityOrRegion: "奧斯陸郡",
    latitude: 59.91273,
    longitude: 10.74609,
    timezone: "Europe/Oslo",
    mapsQuery: "Oslo city centre Norway",
    relatedDays: [4, 9],
    introduction:
      "奧斯陸在本行程出現兩次：第 4 天由哥特堡北上，入內參觀 MUNCH 孟克美術館後續往蓋羅；第 9 天再由哈瑪爾返回，走訪前進號博物館、維格蘭雕塑公園、市政廳與歌劇院。兩次停留分工不同，不應合併成同一日的緊湊清單。",
    highlights: ["MUNCH 孟克美術館", "Fram 前進號博物館", "維格蘭雕塑公園", "市政廳", "歌劇院"],
    sourceReference: `${PDF}第 5、8 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "geilo",
    name: "蓋羅 Geilo",
    country: "挪威",
    cityOrRegion: "哈靈達爾 Hallingdal",
    latitude: 60.53346,
    longitude: 8.20591,
    timezone: "Europe/Oslo",
    mapsQuery: "Geilo Tourist Information Norway",
    relatedDays: [4, 5],
    introduction:
      "蓋羅位於奧斯陸與卑爾根之間的山區，是滑雪與戶外活動度假地，也是本行程進入峽灣前的過夜站。第 4 天住宿已確認為 Vestlia Resort；翌日早餐後前往沃林斯瀑布，沒有固定市區活動。海拔較高、早晚溫差明顯，應把保暖層放在隨身行李。",
    highlights: ["哈靈達爾高地", "Vestlia Resort", "奧斯陸—卑爾根中繼", "前往哈丹格峽灣門戶"],
    sourceReference: `${PDF}第 2、5 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "voringsfossen",
    name: "沃林斯瀑布 Vøringsfossen",
    country: "挪威",
    cityOrRegion: "艾菲尤爾 Eidfjord",
    latitude: 60.42669,
    longitude: 7.251631,
    timezone: "Europe/Oslo",
    mapsQuery: "Vøringsfossen visitor viewpoint Norway",
    relatedDays: [5],
    introduction:
      "Vøringsfossen 沃林斯瀑布從哈當厄高原邊緣落入 Måbødalen 山谷，是第 5 天由蓋羅前往卑爾根途中停靠的瀑布觀景點。觀景平台可能濕滑且風勢強，應遵守欄杆與步道範圍。",
    highlights: ["Vøringsfossen 瀑布", "Måbødalen 山谷", "瀑布觀景平台", "哈當厄高原邊緣"],
    sourceReference: `${PDF}第 5–6 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "hardangerfjord-bridge",
    name: "哈丹格峽灣與大橋 Hardangerfjord",
    country: "挪威",
    cityOrRegion: "哈丹格地區",
    latitude: 60.47848,
    longitude: 6.83033,
    timezone: "Europe/Oslo",
    mapsQuery: "Hardanger Bridge Norway",
    relatedDays: [5],
    introduction:
      "哈丹格峽灣大橋跨越 Eidfjorden 水域，取代 Bruravik 與 Brimnes 之間的渡輪，讓第 5 天能由沃林斯瀑布方向續往卑爾根。此段主要是遊覽車行經橋梁與峽灣公路，確認行程未安排橋上步行；沿途拍照應隔著車窗並服從司機安全要求。",
    highlights: ["Hardanger Bridge", "哈丹格峽灣公路", "Eidfjorden 水域", "前往卑爾根的跨峽灣通道"],
    sourceReference: `${PDF}第 5–6 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "bergen",
    name: "卑爾根 Bergen",
    country: "挪威",
    cityOrRegion: "韋斯特蘭郡",
    latitude: 60.3943,
    longitude: 5.325919,
    timezone: "Europe/Oslo",
    mapsQuery: "Bergen city centre at Torget Norway",
    relatedDays: [5, 6],
    introduction:
      "卑爾根是挪威西岸歷史港都，也是深入峽灣的交通門戶。第 5 天抵達後參觀列入世界遺產的布里根木屋群與港邊魚市場，當晚住宿已確認為 Scandic Flesland Airport；第 6 天由此出發前往沃斯與弗洛姆鐵路。城市降雨頻繁，輕量雨具比大型雨傘更實用。",
    highlights: ["布里根 Bryggen", "卑爾根魚市場", "漢薩同盟港口脈絡", "峽灣鐵路旅程起點"],
    sourceReference: `${PDF}第 2、6 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "voss-myrdal",
    name: "沃斯與米達爾 Voss & Myrdal",
    country: "挪威",
    cityOrRegion: "韋斯特蘭高地",
    latitude: 60.629176,
    longitude: 6.410351,
    timezone: "Europe/Oslo",
    mapsQuery: "Voss Station Norway",
    relatedDays: [6],
    introduction:
      "沃斯是第 6 天鐵路旅程的轉換節點：遊覽車由卑爾根抵達後，旅客搭挪威國鐵越過山區至米達爾，再轉上弗洛姆鐵路。米達爾位於高地且轉乘時間受班表限制，兩站不視為自由觀光停留；行李與月台移動須依領隊指示，並預留轉乘時間。",
    highlights: ["Voss Station", "Bergen Line 高山鐵路", "Myrdal 轉乘", "弗洛姆鐵路銜接"],
    sourceReference: `${PDF}第 6 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "flam",
    name: "弗洛姆 Flåm",
    country: "挪威",
    cityOrRegion: "艾于蘭 Aurland",
    latitude: 60.86157,
    longitude: 7.1151,
    timezone: "Europe/Oslo",
    mapsQuery: "Flåm village Norway",
    relatedDays: [6],
    introduction:
      "弗洛姆位於艾于蘭峽灣內端，是米達爾景觀鐵路下山後與峽灣遊船相接的交通村落。Flåmsbana 以急坡、隧道、山谷與瀑布景觀著名，官方標示最大坡度為 55‰。停留時間取決於火車與船班銜接。",
    highlights: ["Flåm Railway", "峽灣遊船轉乘", "艾于蘭峽灣", "55‰ 最大坡度"],
    sourceReference: `${PDF}第 6 頁；Flåmsbana 官方路線資料；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "sognefjord",
    name: "索格納峽灣 Sognefjord",
    country: "挪威",
    cityOrRegion: "索格納峽灣區",
    latitude: 61.1256,
    longitude: 6.21739,
    timezone: "Europe/Oslo",
    mapsQuery: "Sognefjorden geographic reference point Norway",
    relatedDays: [6, 7],
    introduction:
      "索格納峽灣從挪威西岸深入內陸，是挪威最長且最深的峽灣系統。第 6 天已確認安排約 1.5 至 2 小時峽灣遊船，之後接駁至 Sogndal，住宿 Quality Hotel Sogndal；天氣以 Sogndal 為區域代表點。",
    highlights: ["Sognefjord 峽灣系統", "約 1.5–2 小時遊船", "Quality Hotel Sogndal", "挪威最長、最深峽灣系統"],
    sourceReference: `${PDF}第 2、6–7 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "briksdal-glacier",
    name: "布里克斯達冰河 Briksdalsbreen",
    country: "挪威",
    cityOrRegion: "約斯達冰河國家公園",
    latitude: 61.66317,
    longitude: 6.82336,
    timezone: "Europe/Oslo",
    mapsQuery: "Briksdal Troll Car departure at Mountain Lodge Norway",
    relatedDays: [7],
    introduction:
      "布里克斯達冰河是約斯達冰帽向山谷延伸的支冰河。第 7 天先搭 Troll Car 精靈登山車沿林間道路上行，再步行接近觀景區；冰舌位置與可進入範圍會隨季節與安全管制變化。瀑布水霧容易使路面濕滑，必須穿防滑鞋並遠離封鎖區。",
    highlights: ["Briksdalsbreen 支冰河", "Troll Car 精靈登山車", "約斯達冰河國家公園", "森林與瀑布步道"],
    sourceReference: `${PDF}第 2、7 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "geirangerfjord",
    name: "蓋朗格峽灣 Geirangerfjord",
    country: "挪威",
    cityOrRegion: "默勒-魯姆斯達爾郡",
    latitude: 62.102276,
    longitude: 7.204456,
    timezone: "Europe/Oslo",
    mapsQuery: "Geirangerfjord cruise Pier 1 and 2 Norway",
    relatedDays: [7, 8],
    introduction:
      "蓋朗格峽灣是 Storfjorden 的內陸支灣，以陡峭山壁、農莊遺跡與多道瀑布形成經典峽灣景觀，並與納柔依峽灣共同列入世界自然遺產。第 7 天已確認安排約一小時峽灣遊船並住宿 Havila Hotel Geiranger，第 8 天再由老鷹之路方向離開。",
    highlights: ["Geirangerfjord 約一小時遊船", "世界自然遺產", "七姊妹瀑布景觀", "Havila Hotel Geiranger"],
    sourceReference: `${PDF}第 2、7–8 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "geiranger-trollstigen",
    name: "老鷹之路與精靈之路 Ørnesvingen & Trollstigen",
    country: "挪威",
    cityOrRegion: "蓋朗格—勞馬景觀公路",
    latitude: 62.453301,
    longitude: 7.663136,
    timezone: "Europe/Oslo",
    mapsQuery: "Trollstigen Visitor Centre Norway",
    relatedDays: [8],
    introduction:
      "若道路開放，第 8 天由 Ørnesvingen 老鷹之路眺望蓋朗格峽灣，再行經有 11 道髮夾彎的 Trollstigen 精靈之路與 Stigfossen 思蒂瀑布。此山區道路可能因積雪、落石或工程封閉，實際路線依當日交通安排。",
    highlights: ["Ørnesvingen 老鷹之路", "Trollstigen 11 道髮夾彎", "Stigfossen 思蒂瀑布", "山區道路觀景"],
    sourceReference: `${PDF}第 7–8 頁；道路開放須查 Statens vegvesen；${culturalSuggestionNote}`,
    status: "optional",
  }),
  defineDestination({
    id: "lillehammer",
    name: "里耳哈默 Lillehammer",
    country: "挪威",
    cityOrRegion: "內陸郡",
    latitude: 61.125,
    longitude: 10.487222,
    timezone: "Europe/Oslo",
    mapsQuery: "Lysgårdsbakkene Lillehammer Norway",
    relatedDays: [8],
    introduction:
      "里耳哈默位於米約薩湖北端，以 1994 年冬季奧運主辦城市聞名。第 8 天安排到 Lysgårdsbakkene 滑雪跳台下車參觀，從高處俯瞰城市與湖區，再續行約 61 公里至哈瑪爾住宿。場館活動、纜椅或塔頂開放不在確認行程保證內容內。",
    highlights: ["Lysgårdsbakkene 滑雪跳台", "1994 冬季奧運脈絡", "米約薩湖景", "里耳哈默市區眺望"],
    sourceReference: `${PDF}第 7–8 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "hamar",
    name: "哈瑪爾 Hamar",
    country: "挪威",
    cityOrRegion: "米約薩湖畔",
    latitude: 60.7945,
    longitude: 11.06798,
    timezone: "Europe/Oslo",
    mapsQuery: "Hamar city centre Norway",
    relatedDays: [8, 9],
    introduction:
      "哈瑪爾坐落於挪威最大湖米約薩湖東岸，是第 8 天離開峽灣山區後的湖畔住宿點，住宿已確認為 Thon Partner Hotel Victoria Hamar。確認版行程未安排固定市區景點；第 9 天早餐後行車約 126 公里返回奧斯陸，湖畔短走僅能視抵達時間自選。",
    highlights: ["米約薩湖畔", "Thon Partner Hotel Victoria Hamar", "返回奧斯陸的中繼", "安靜晚間散步選項"],
    sourceReference: `${PDF}第 2、7–8 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "helsinki",
    name: "赫爾辛基 Helsinki",
    country: "芬蘭",
    cityOrRegion: "新地區",
    latitude: 60.16952,
    longitude: 24.93545,
    timezone: "Europe/Helsinki",
    mapsQuery: "Helsinki city centre Finland",
    relatedDays: [11, 12],
    introduction:
      "赫爾辛基是 Tallink Silja Line 夜航遊輪的抵達城市與返台航班起點。第 11 天由港口直接往返波爾沃，住宿已確認為 Scandic Park Helsinki；第 12 天集中參觀大教堂、元老院廣場、烏斯佩斯基主教座堂、西貝流士公園、Oodi 與岩石教堂。Oodi 實際於 2018 年開館。",
    highlights: ["赫爾辛基大教堂", "元老院廣場", "烏斯佩斯基主教座堂", "Oodi", "岩石教堂", "西貝流士紀念碑"],
    sourceReference: `${PDF}第 3、9–10 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
  defineDestination({
    id: "porvoo",
    name: "波爾沃 Porvoo",
    country: "芬蘭",
    cityOrRegion: "新地區",
    latitude: 60.3955571,
    longitude: 25.6576835,
    timezone: "Europe/Helsinki",
    mapsQuery: "Porvoo Old Town Finland",
    relatedDays: [11],
    introduction:
      "波爾沃是芬蘭歷史悠久的城鎮之一，老城以蜿蜒街巷、保存良好的木屋和河岸紅色倉庫形成辨識度高的景觀。第 11 天由赫爾辛基往返各約 53 公里，另到波爾沃大教堂參觀；能否入內須配合禮拜與開放時間，午餐由旅客自理。",
    highlights: ["波爾沃老城", "河岸紅色倉庫", "波爾沃大教堂", "木造街區"],
    sourceReference: `${PDF}第 9 頁；${culturalSuggestionNote}`,
    status: "confirmed",
  }),
];

export const destinationCountries = ["丹麥", "瑞典", "挪威", "芬蘭"] as const;

export const destinationsByCountry: Record<(typeof destinationCountries)[number], Destination[]> = {
  丹麥: destinations.filter((destination) => destination.country === "丹麥"),
  瑞典: destinations.filter((destination) => destination.country === "瑞典"),
  挪威: destinations.filter((destination) => destination.country === "挪威"),
  芬蘭: destinations.filter((destination) => destination.country === "芬蘭"),
};

export const destinationGroups = destinationCountries.map((country) => ({
  country,
  destinations: destinationsByCountry[country],
}));

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((destination) => destination.id === id);
}

export default destinations;
