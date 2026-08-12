# Google Maps 清單與 fallback 稽核

最後核對：2026-08-13

## 現行來源與規則

網站以旅客提供的 [「2026北歐四國」Google Maps 共用清單](https://maps.app.goo.gl/dL64FfoHPCJFbfCN8)為主要依據。清單 payload 已完整讀取並核對為 81 筆；每筆以 Google Place Feature ID 建立精準的 `/maps/place/.../data=...!1s<CID>` URL，集中維護於 `src/data/google-maps.ts`。

連結使用順序如下：

1. 清單中有唯一且語意相符的地點：使用該筆精準 Place URL。
2. 一個行程卡包含多個景點：分別顯示多個精準 Place URL，不以其中一點冒充整段行程。
3. 清單沒有該地點，或只包含城市／公園／峽灣而非行程所稱的車站、碼頭、遊客中心或紀念碑：保留原本已稽核的座標 URL，避免錯誤套用近似地點。
4. Day 2–9 與 Day 11 的九間陸上飯店皆使用清單中的精準 Place URL。Day 10 的清單項目是 Värtahamnen 的 Tallink Silja Line 登船區，不是夜宿船舶或艙房，因此只放在登船活動卡；Day 1、Day 12 為夜宿機上，Day 13 無住宿，均不顯示住宿地圖。

## 已拆分的多地點行程

| 行程卡 | 顯示的精準地點 |
|---|---|
| 哥本哈根市區巡禮 | Christiansborg Palace、Amalienborg Palace、The Little Mermaid、Gefion Fountain |
| 奧斯陸市政廳與歌劇院 | Oslo City Hall、Oslo Opera House |
| 赫爾辛基大教堂與參議院廣場 | Helsinki Cathedral、Senate Square |

## 共用清單沒有唯一對應的項目

下列項目不是清單讀取失敗，而是 81 筆中沒有與網站語意完全相同的唯一 Place。網站目前使用已稽核座標 fallback，不會把相近地點偽裝成精準連結。

| 網站項目 | 清單中可見的近似項目 | 目前處理 |
|---|---|---|
| 桃園國際機場 | 無桃園機場項目 | 使用航廈區域的已稽核座標 |
| Geilo Tourist Information | Geilo 城市 | 使用遊客中心的已稽核座標 |
| Voss Station | Voss 城市 | 使用車站的已稽核座標 |
| Sognefjord cruise departure at Flåm berth | Flåm 城鎮 | 使用出發碼頭的已稽核座標 |
| Geirangerfjord cruise Pier 1/2 | Geirangerfjord 地理景點 | 使用 Pier 1/2 的已稽核座標 |
| Trollstigen Visitor Centre | Trollstigen、Stigfossen、Stigfossbrua 與多個 viewpoint | 使用 Visitor Centre 的已稽核座標 |
| Sibelius Monument | Sibelius Park | 使用紀念碑本體的已稽核座標 |
| Oslo 目的地總覽 | 只有 Oslo 個別景點，沒有城市項目 | 使用 Oslo 城市中心座標 |
| Sognefjord 目的地總覽 | 無 Sognefjord 項目 | 使用峽灣地理代表座標 |
| Helsinki 目的地總覽 | 只有 Helsinki 個別景點，沒有城市項目 | 使用 Helsinki 城市中心座標 |

Vøringsfossen 在清單中是瀑布景點而非指定 viewpoint，網站採用該景點 Place；Tallink Silja Line 的清單項目位於 Värtahamnen，只作登船區參考。正式碼頭、船名、時間與艙等仍以登船文件為準。

## 自動驗證

- `tests/maps-coordinate-audit.test.ts` 驗證 81 筆 catalog 完整、精準 URL 格式、活動與目的地的 exact/fallback 選擇、多地點連結，以及九間陸上飯店的住宿連結。
- `tests/maps.test.ts` 驗證精準 Place URL 建立與拒絕短網址、HTTP 或一般搜尋網址。
- `scripts/verify-export.mjs` 驗證靜態行程頁同時含有足量精準 Place URL，以及仍需保留的座標 fallback。

維護時不得把共用清單短網址直接複製到每張卡，也不得只憑相似名稱代換。新增或調整地點後，必須同步更新 catalog、資料映射、上述歧義表與測試。
