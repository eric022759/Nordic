# Google Maps 精準座標稽核

最後核對：2026-08-11

網站所有地圖連結統一採用 Google 官方 Maps URL 格式：

```text
https://www.google.com/maps/search/?api=1&query=LATITUDE%2CLONGITUDE
```

[Google Maps URLs 官方文件](https://developers.google.com/maps/documentation/urls/get-started)明確允許以逗號分隔的經緯度作為 `query`。資料仍保留人類可讀的 `mapsQuery` 作顯示與稽核，URL 則直接使用精準座標，避免同名地點或語言差異造成錯誤結果。座標 pin 的取捨以旅客實際使用點優先；沒有單一入口的城市、橋梁、峽灣與線性景觀則採權威代表點並在下表揭露限制。

## 台灣、丹麥與瑞典

| Target | 精準座標 | 用途 | 權威／官方來源 | 歧義與範圍限制 |
|---|---:|---|---|---|
| Taiwan Taoyuan International Airport | `25.077731, 121.232822` | 機場整體 | [BOCA 官方地址](https://www.boca.gov.tw/fp-191-3823-f8654-2.html)、[Wikidata Q44856](https://www.wikidata.org/wiki/Q44856) | 集合地點為第二航廈土耳其航空團體櫃台；此 pin 代表機場整體，不是櫃台位置。 |
| Copenhagen city centre | `55.675940, 12.565530` | 城市代表中心 | [Wikidata Q1748](https://www.wikidata.org/wiki/Q1748) | 城市沒有唯一入口；僅供目的地概覽。 |
| Christiansborg Palace | `55.6759389273, 12.5795173645` | 宮殿代表入口 | [Royal Danish Collection 訪客資訊](https://denkongeligesamling.dk/en/christiansborg-palace/plan-your-visit/)、[Wikidata Q940733](https://www.wikidata.org/wiki/Q940733) | 「哥本哈根市區巡禮」包含多站；此 pin 只代表 Christiansborg，不涵蓋 Amalienborg、小美人魚或 Gefion Fountain。 |
| Kronborg Castle | `56.039332, 12.621799` | 城堡本體 | [Kronborg 官方訪客資訊](https://kronborg.dk/en/plan-your-visit) | 不是 Nordhavnsvej 停車場。 |
| Frederiksborg Castle | `55.934510, 12.300410` | 城堡群中心 | [官方地址](https://frederiksborg.dk/en/contact-us/)、[官方交通資訊](https://frederiksborg.dk/en/getting-here/) | 建築橫跨三座小島；入口與停車場另有位置。 |
| Nyhavn | `55.679776, 12.5913041` | 新港地標 | [使用者核對的 Google place](https://www.google.com/maps/place/%E6%96%B0%E6%B8%AF/@55.6488624,12.5805207,10.74z/data=!4m6!3m5!1s0x46525322aa676daf:0x99c2a00928e5eaeb!8m2!3d55.679776!4d12.5913041!16zL20vMDc5Mnh3)、[VisitCopenhagen](https://www.visitcopenhagen.com/copenhagen/planning/nyhavn-harbour-gdk426287) | 線性港灣街區，並非單一門口；採使用者提供 Google POI 的實際 `!3d/!4d` pin，而不是 URL 的 `@` 畫面中心。 |
| Øresund Bridge centre | `55.576444, 12.821639` | 行車經過橋梁 | [Danish Road Directorate](https://www.vejdirektoratet.dk/viden-og-data/infrastruktur/broer-og-vejtunneler-i-danmark/oversigt-over-broer-og-tunneler/oresundsbroen-og-tunnelen)、[Wikidata Q297871](https://www.wikidata.org/wiki/Q297871) | 橋體代表點，不是可停車或步行的 viewpoint。 |
| Gothenburg city centre | `57.707500, 11.967500` | 城市代表中心 | [Wikidata Q25287](https://www.wikidata.org/wiki/Q25287) | 住宿為 Quality Hotel 11；此 pin 僅供城市概覽，不代表旅館或下車處。 |
| Örebro Castle | `59.2738889, 15.2152778` | 城堡本體 | [Örebro Castle 官方交通資訊](https://orebroslott.se/besok-slottet/hitta-hit/)、[Wikidata Q2757682](https://www.wikidata.org/wiki/Q2757682) | 行程為車覽，pin 不代表停車點。 |
| Stockholm city centre | `59.3294444, 18.0686111` | 城市代表中心 | [Wikidata Q1754](https://www.wikidata.org/wiki/Q1754) | 此 pin 僅供城市概覽，不代表個別景點或下車處。 |
| Vasa Museum | `59.3280233, 18.0913964` | 博物館入口建築 | [Vasa Museum 官方交通資訊](https://www.vasamuseet.se/en/visit/getting-here)、[Wikidata Q901371](https://www.wikidata.org/wiki/Q901371) | 與官方地址 Galärvarvsvägen 14 一致。 |
| Stockholm Royal Palace | `59.3266667, 18.0716667` | 王宮本體 | [Royal Palaces 官方交通資訊](https://www.royalpalaces.se/english/royal-palaces-and-sites/the-royal-palace/visit-us/getting-here.html)、[Wikidata Q750444](https://www.wikidata.org/wiki/Q750444) | 王宮有多個入口；採 Slottsbacken 1 代表點。 |
| Värtahamnen passenger terminal | `59.3514778, 18.1127972` | Silja/Tallink 客運碼頭 | [Tallink 官方 Värtahamnen 資訊](https://www.tallink.com/sv/hitta-resa/vartahamnen) | 採 Hamnpirsvägen 10 的 Värtaterminalen。 |

## 挪威

| Target | 精準座標 | 用途 | 權威／官方來源 | 歧義與範圍限制 |
|---|---:|---|---|---|
| MUNCH Bjørvika | `59.9061661, 10.7557103` | MUNCH Museum | [MUNCH 官方 Visit 頁](https://www.munch.no/en/visit-us/) | 使用 Bjørvika 館址的精準座標。 |
| Oslo city centre | `59.91273, 10.74609` | 城市代表中心 | [GeoNames Oslo](https://www.geonames.org/advanced-search.html?country=NO&q=oslo) | 城市沒有單一入口；僅供目的地概覽。 |
| Geilo Tourist Information | `60.53346, 8.20591` | 可到訪市中心落點 | [Visit Geilo 官方資訊](https://www.geilo.com/en/tourist-information) | 住宿為 Vestlia Resort；此 pin 是市中心代表點，不是旅館位置。 |
| Vøringsfossen viewpoint | `60.42669, 7.251631` | 官方觀景設施 | [Norwegian Scenic Routes](https://www.nasjonaleturistveger.no/en/routes/hardangervidda/voringsfossen/) | 不是瀑布水體中心。 |
| Hardanger Bridge | `60.47848, 6.83033` | 橋梁代表點 | [Kartverket SSR](https://stadnamn.kartverket.no/fakta/717901) | 行車經過，非停車點。 |
| Bergen city centre at Torget | `60.39430, 5.325919` | 城市實用中心 | [Hanseatic Cities 官方 Bergen 頁](https://www.hanse.org/en/hanse/bergen) | 採 Torget/Vågen 核心區，不是行政區 centroid。 |
| Bryggen | `60.397494, 5.324228` | UNESCO 建築群 | [UNESCO World Heritage map](https://whc.unesco.org/en/list/59/maps/) | 建築群為一段街區，pin 為 UNESCO reference point。 |
| Bergen Fish Market | `60.39496, 5.32609` | 市場 Torget | [VisitBergen 官方景點資料](https://en.visitbergen.com/things-to-do/fish-market-in-bergen-p822253) | 市場攤位範圍會隨季節變化。 |
| Voss Station | `60.629176, 6.410351` | 火車站 | [Bane NOR 官方車站頁](https://www.banenor.no/reise-og-trafikk/stasjoner/-v-/voss/)、[Wikidata Q1783061](https://www.wikidata.org/wiki/Q1783061) | 精準至車站，不代表巴士實際停靠月台。 |
| Flåm Railway / Flåm Station | `60.862819, 7.113689` | Flåmsbana 終點站 | [Bane NOR 官方車站頁](https://www.banenor.no/reise-og-trafikk/stasjoner/-f-/flam/)、[Wikidata Q3096451](https://www.wikidata.org/wiki/Q3096451) | 鐵路活動使用車站 pin。 |
| Flåm village | `60.86157, 7.11510` | 村落代表點 | [Kartverket SSR](https://stadnamn.kartverket.no/fakta/433011) | 僅供目的地概覽，與車站 pin 分開。 |
| Sognefjord cruise departure at Flåm berth | `60.86274, 7.11428` | Day 6 遊船實用登船點 | [Norway's Best 官方 cruise](https://www.norwaysbest.com/en/flam/things-to-do/fjord-cruise-aurlandsfjord) | 依目前行程順序選 Flåm berth；最終船班、碼頭與路線仍待確認。 |
| Sognefjorden geographic reference point | `61.12560, 6.21739` | 峽灣目的地概覽 | [Kartverket SSR](https://stadnamn.kartverket.no/fakta/434556) | 這是 200 多公里長自然地物的權威代表點，不適合作導航終點。 |
| Briksdal Troll Car departure | `61.66317, 6.82336` | Troll Car／步道出發點 | [Briksdal 官方 Fjellstove](https://en.briksdal.no/fjellstova)、[官方 Glacier 頁](https://www.briksdal.com/briksdal-glacier) | 不使用會隨冰河退縮變動的冰舌位置。 |
| Geirangerfjord cruise Pier 1/2 | `62.102276, 7.204456` | 觀光船碼頭 | [Geirangerfjord 官方 FAQ](https://www.geirangerfjord.no/faq-english) | 官方頁的 Long/Lat 標籤順序顛倒；依挪威位置交叉核對後採 `lat=62.102276`。船班仍待確認。 |
| Ørnesvingen viewpoint | `62.12626334, 7.16721732` | 官方觀景台 | [Norwegian Scenic Routes](https://www.nasjonaleturistveger.no/de/routen/geiranger--trollstigen/ornesvingen/) | 精準到觀景設施。 |
| Trollstigen Visitor Centre | `62.453301, 7.663136` | 遊客中心／viewpoint | [Norwegian Scenic Routes](https://www.nasjonaleturistveger.no/en/routes/geiranger--trollstigen/trollstigen/) | 不選任一髮夾彎；道路開放狀態仍須出發前確認。 |
| Lysgårdsbakkene | `61.125000, 10.487222` | 跳台場館 | [Visit Lillehammer](https://www.lillehammer.com/opplevelser/lysgardsbakkene-hoppanlegg-p631373)、[Wikidata Q632041](https://www.wikidata.org/wiki/Q632041) | 使用跳台場館本身的精準座標。 |
| Hamar city centre | `60.79450, 11.06798` | 城市代表中心 | [GeoNames Hamar](https://www.geonames.org/search.html?q=hamar&country=NO) | 住宿為 Thon Partner Hotel Victoria Hamar；此 pin 僅供城市概覽。 |
| Fram Museum | `59.9033623, 10.6995520` | 博物館 | [Fram Museum 官方資訊](https://frammuseum.no/the-museum/)、[OSM way 128980495](https://www.openstreetmap.org/way/128980495) | 與官方地址 Bygdøynesveien 39 一致。 |
| Vigeland Sculpture Park | `59.927029, 10.700865` | 雕塑公園 | [Vigeland 官方訪客資訊](https://vigeland.museum.no/besoksinformasjon) | 公園範圍廣，採官方連出的 Google place pin。 |
| Oslo Opera House | `59.9074889, 10.7531261` | 歌劇院 | [Norwegian Opera 官方聯絡頁](https://www.operaen.no/om-oss/kontakt-oss-den-norske-opera-og-ballett/) | 「市政廳與歌劇院」為兩站活動；現有單一 pin 只代表歌劇院，市政廳未另建連結。 |

## 芬蘭

| Target | 精準座標 | 用途 | 權威／官方來源 | 歧義與範圍限制 |
|---|---:|---|---|---|
| Helsinki city centre | `60.16952, 24.93545` | 城市代表中心 | [GeoNames Helsinki](https://www.geonames.org/658225/helsinki.html) | 城市沒有單一入口；僅供目的地概覽。 |
| Porvoo Old Town | `60.3955571, 25.6576835` | 老城區代表點 | [Visit Porvoo](https://www.visitporvoo.fi/en/sights/old-porvoo/)、[OSM node 10929256189](https://www.openstreetmap.org/node/10929256189) | 老城為街區，不是單一門口。 |
| Porvoo riverside red warehouses | `60.3943928, 25.6572026` | 河岸紅倉庫地標 | [Visit Porvoo 必看景點](https://www.visitporvoo.fi/en/sights/must-see-in-porvoo/) | 倉庫是一整排；最佳拍攝視角在河對岸，與地標 pin 不同。 |
| Porvoo Cathedral | `60.3971769, 25.6578489` | 教堂建築 | [Visit Porvoo 景點資訊](https://www.visitporvoo.fi/en/sights/)、[OSM way 47405172](https://www.openstreetmap.org/way/47405172) | 與官方地址 Kirkkotori 1 一致。 |
| Helsinki Cathedral | `60.170345, 24.952229` | 教堂建築 | [City of Helsinki Service Map unit 43181](https://www.hel.fi/palvelukarttaws/rest/v4/unit/43181) | 「大教堂與元老院廣場」包含兩個相鄰 POI；單一 pin 依活動名稱首項採大教堂。Senate Square 另為 `60.169540,24.952460`，約 90 公尺。 |
| Uspenski Cathedral | `60.168533, 24.959913` | 教堂建築 | [City of Helsinki unit 20470](https://www.hel.fi/palvelukarttaws/rest/v4/unit/20470) | 精準至教堂。 |
| Sibelius Monument | `60.182060, 24.913342` | 紀念碑 | [City of Helsinki unit 23211](https://www.hel.fi/palvelukarttaws/rest/v4/unit/23211) | 精準至紀念碑，不是整座公園中心。 |
| Oodi Central Library | `60.173970, 24.938158` | 圖書館 | [City of Helsinki unit 51342](https://www.hel.fi/palvelukarttaws/rest/v4/unit/51342) | 精準至 Oodi 建築。 |
| Temppeliaukio Church | `60.1729755, 24.9251637` | 岩石教堂 | [Temppeliaukio Church 官方網站](https://www.temppeliaukiochurch.fi/en/) | 採官方頁連出的 Google place pin。 |

## 維護規則

1. 新增可點擊地圖的 activity 時，必須同時提供 `mapsQuery` 與 `mapsCoordinates`；缺少座標會在資料載入時直接報錯。
2. `mapsQuery` 是可讀標籤，不可用作 URL 的實際 `query`。
3. 城市、橋梁、峽灣、街區與線性景觀必須說明代表點的用途，不能把代表點描述成入口或集合點。
4. 取得最終旅館、集合門口、港口、船班或停車資訊後，應以實際操作點取代目前的代表點。
5. `tests/maps-coordinate-audit.test.ts` 會逐一驗證全部 destination 與有地圖的 activity 均為數字座標 pin，並鎖定 Nyhavn 的使用者核對座標。
