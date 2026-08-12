/**
 * Exact Google Maps places supplied in the traveller's shared list.
 *
 * The `data=!4m2!3m1!1s<CID>` form identifies the selected Google place.  It
 * deliberately avoids a free-text search, which can resolve to a similarly
 * named place or to a city-wide search result.
 */

export const GOOGLE_MAPS_SHARED_LIST_URL =
  "https://maps.app.goo.gl/dL64FfoHPCJFbfCN8";

export const GOOGLE_MAPS_SHARED_LIST_PLACE_COUNT = 81;

const GOOGLE_MAPS_CID_PATTERN = /^0x[0-9a-f]+:0x[0-9a-f]+$/i;
const GOOGLE_MAPS_EXACT_PLACE_PATH_PATTERN =
  /^\/maps\/place\/[^/]+\/data=!4m2!3m1!1s0x[0-9a-f]+:0x[0-9a-f]+$/i;

export function createExactGoogleMapsPlaceUrl(name: string, cid: string): string {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error("Google Maps exact place name must not be empty.");
  }

  if (!GOOGLE_MAPS_CID_PATTERN.test(cid)) {
    throw new Error(`Invalid Google Maps CID: ${cid}`);
  }

  return `https://www.google.com/maps/place/${encodeURIComponent(normalizedName)}/data=!4m2!3m1!1s${cid}`;
}

export function isExactGoogleMapsPlaceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "www.google.com" &&
      !parsed.search &&
      !parsed.hash &&
      GOOGLE_MAPS_EXACT_PLACE_PATH_PATTERN.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export interface GoogleMapsPlace {
  readonly listIndex: number;
  readonly name: string;
  readonly cid: string;
  readonly url: string;
}

function listPlace(
  listIndex: number,
  name: string,
  cid: string,
): GoogleMapsPlace {
  return Object.freeze({
    listIndex,
    name,
    cid,
    url: createExactGoogleMapsPlaceUrl(name, cid),
  });
}

/**
 * Complete 81-row snapshot, in the same order as the shared list on
 * 2026-08-13.  Rows 52/55 and 53/54 are duplicate list rows with the same CID;
 * both remain here so the snapshot faithfully represents the user's list.
 */
export const GOOGLE_MAPS_PLACE_CATALOG = Object.freeze({
  "scandic-park-helsinki": listPlace(1, "Scandic Park Helsinki", "0x46920a2e5b4b6ec7:0x162cbe9cca76bdc5"),
  "tallink-silja-line-stockholm": listPlace(2, "Tallink Silja Line", "0x465f9d333f503c71:0x48a7c44310ac5b1"),
  "clarion-hotel-orebro": listPlace(3, "Clarion Hotel Örebro", "0x465c14e39f7025d5:0x26051bb5557dbfef"),
  "thon-hotel-victoria-hamar": listPlace(4, "Thon Hotel Victoria Hamar", "0x4641e138e3129947:0x77b62cd6bce65a23"),
  "havila-hotel-geiranger": listPlace(5, "Havila Hotel Geiranger", "0x46142640ba38ae85:0xf211cda6bf5216a7"),
  "quality-hotel-sogndal": listPlace(6, "Quality Hotel Sogndal", "0x4615f98bb9572341:0xd3e648d7e4f401f0"),
  "scandic-flesland-airport": listPlace(7, "Scandic Flesland Airport", "0x463cf08602697fc1:0xad5b74765814d6bc"),
  "vestlia-resort": listPlace(8, "Vestlia Resort", "0x463fbb2bdbca7919:0xe2efaae8c6faae85"),
  "quality-hotel-11-eriksbergshallen": listPlace(9, "Quality Hotel 11 & Eriksbergshallen", "0x464f8cb46696ddc9:0x53e62fd69eb3cef1"),
  "crowne-plaza-copenhagen-towers": listPlace(10, "Crowne Plaza Copenhagen Towers by IHG", "0x465254b83438cd9b:0xf78f4b50dae98ac7"),
  voringsfossen: listPlace(11, "Vøringsfossen", "0x463e5fb3c511f01f:0x922df9ae6d08d909"),
  gothenburg: listPlace(12, "哥德堡", "0x464f8e67966c073f:0x4019078290e7c40"),
  "little-mermaid": listPlace(13, "美人魚", "0x464c90eb8d422103:0xdfa8900ca2351e3c"),
  "frederiksborg-castle": listPlace(14, "腓特烈堡城堡", "0x46524097762941e1:0x12c6a634246b6152"),
  "kronborg-castle": listPlace(15, "克倫堡", "0x4652310d8be4e5e3:0xc201c3cdc1f14036"),
  "gefion-fountain": listPlace(16, "吉菲昂噴泉", "0x4652532092758a5d:0xca4f8b1b331039ae"),
  "amalienborg-palace": listPlace(17, "阿馬林堡宮", "0x46525322363e0673:0x5cf17fab9d15553f"),
  "christiansborg-palace": listPlace(18, "克里斯蒂安堡宮", "0x46525316bf91ba09:0x2cb677e778366219"),
  "deichman-bjorvika": listPlace(19, "Deichman Bjørvika", "0x46416e8bd25e4add:0x7de8fbd1e762663e"),
  "oslo-public-library-torshov": listPlace(20, "Oslo Public Library, Torshov", "0x46416e15c6358007:0x4faaae60854a045d"),
  "norwegian-opera-and-ballet": listPlace(21, "The Norwegian Opera and Ballet", "0x46416e8bb997070b:0x603d52b5f22c95f"),
  stockholm: listPlace(22, "斯德哥爾摩", "0x465f763119640bcb:0xa80d27d3679d7766"),
  waynor: listPlace(23, "WayNor", "0x46416f3136014a41:0xc624135ef89d7a7e"),
  "temppeliaukio-church": listPlace(24, "聖殿廣場教堂", "0x46920a3167360cb1:0x80bafdaf2781439f"),
  "oodi-central-library": listPlace(25, "赫爾辛基頌歌中央圖書館", "0x46920bcab6fcbbeb:0x6edaf369263e75dd"),
  "storting-building": listPlace(26, "國會大廈", "0x46416e7d5be9999b:0x5cb4a8a9b4d04d2"),
  "wb-samson-egertorget": listPlace(27, "W.B. Samson – Egertorget", "0x46416e7d55d46963:0xc67f3ea50aa8afd6"),
  "sibelius-park": listPlace(28, "西貝流士公園", "0x46920a249134c9ff:0xf1d374c1f319d539"),
  "uspenski-cathedral": listPlace(29, "烏斯佩斯基大教堂", "0x46920bd2278b8df1:0xa03dca3ae6b14ca9"),
  "helsinki-senate-square": listPlace(30, "赫爾辛基參議院廣場", "0x46920bce46c319b7:0xbc57e32cb4d908ca"),
  "tim-wendelboe": listPlace(31, "Tim Wendelboe", "0x46416e6f545025f5:0x2f10917800396987"),
  "porvoo-cathedral": listPlace(32, "Porvoo Cathedral", "0x4691f428e4ac7ccf:0xb0771d4e2fc79f3e"),
  "porvoo-riverside-warehouses": listPlace(33, "Porvoo Riverside Warehouses", "0x4691f7878bf5d80b:0xe6e7604aaeec9a39"),
  "vasa-museum": listPlace(34, "瓦薩沉船博物館", "0x465f9d546d8329af:0xcff09af1b4c13241"),
  "holzweiler-flagship-store": listPlace(35, "Holzweiler Flagship Store", "0x46416f1027a76073:0x1aee969097f9d555"),
  "orebro-castle": listPlace(36, "Örebro Castle", "0x465c14e28e532c05:0xafa950e40634bfcb"),
  "oslo-city-hall": listPlace(37, "奧斯陸市政廳", "0x46416e87392ca3a5:0x52f65653724888bc"),
  "oslo-opera-house": listPlace(38, "奧斯陸歌劇院", "0x46416e8ba321f715:0x1cb6a7c6a2a2d611"),
  "vigeland-sculpture-park": listPlace(39, "維格蘭雕塑公園", "0x46416dcebaff5fb1:0x863f8a43655c796"),
  "fram-museum": listPlace(40, "前進號博物館", "0x46416c3ab370c031:0x807b0e0e5adea37a"),
  hamar: listPlace(41, "哈馬爾", "0x4641e1066bc9a397:0xa8314181f32bdb50"),
  lysgardsbakkene: listPlace(42, "Lysgårdsbakkene Hoppanlegg", "0x466a629a3a5073f5:0x7568e883664f26dc"),
  stigfossbrua: listPlace(43, "Stigfossbrua", "0x46140e741d9c29a9:0x1e1aec915daf67c2"),
  "trollstigen-foothill-viewpoint": listPlace(44, "Trollstigen Foothill Viewpoint", "0x46140f408e2fd08d:0x303bac62c5f01f11"),
  "stigfossen-waterfall": listPlace(45, "Stigfossen", "0x46140e7475666d9d:0x362280f07f94bbe"),
  "trollstigen-outer-viewpoint": listPlace(46, "Trollstigen Outer Viewpoint", "0x46140f003552405d:0xab4e3542b09a395b"),
  "stigfossen-tourist-attraction": listPlace(47, "Stigfossen", "0x46140faabc66b1b7:0x4455596cf947d8f3"),
  trollstigen: listPlace(48, "Trollstigen", "0x46140f7b5976f149:0x17fd842a48e0baaf"),
  fuglen: listPlace(49, "Fuglen", "0x46416e7cf2cdc573:0xb1cc18413d9b0a56"),
  "ornesvingen-viewpoint": listPlace(50, "Ørnesvingen Viewpoint", "0x46142707c8241b95:0x80f4e4ef733a1e0d"),
  geirangerfjord: listPlace(51, "蓋朗厄爾峽灣", "0x46169d427b268c51:0xb8c99540dcc397fe"),
  "troll-car-station": listPlace(52, "Troll Car Station", "0x461677c8cf8f4e8b:0x23e7d98280605fa1"),
  "briksdalsbre-mountain-lodge": listPlace(53, "Briksdalsbre Mountain Lodge", "0x461676d3b9b4edb3:0x81ac80477150a184"),
  "briksdalsbre-mountain-lodge-duplicate": listPlace(54, "Briksdalsbre Mountain Lodge", "0x461676d3b9b4edb3:0x81ac80477150a184"),
  "troll-car-station-duplicate": listPlace(55, "Troll Car Station", "0x461677c8cf8f4e8b:0x23e7d98280605fa1"),
  myrdal: listPlace(56, "Myrdal", "0x463e6c97201f1cf9:0x6be155f6795600fd"),
  voss: listPlace(57, "Voss", "0x463ddabb9d4fa8af:0xc3351a9efa98af29"),
  mismo: listPlace(58, "MISMO", "0x465253356ce5e4f5:0x1ea4bbc81842ee88"),
  "bastard-burgers": listPlace(59, "Bastard Burgers", "0x465f9d68d4dec5b5:0xe1c950eb95d59ce5"),
  stortorget: listPlace(60, "Stortorget", "0x465f77cab5eb974d:0x463a46ce4246168c"),
  "stadsholmen-island": listPlace(61, "城島", "0x465f77fd1a779ed3:0xa69b484aa4c2e0ab"),
  "the-wooden-horse": listPlace(62, "The Wooden Horse", "0x465f77e264047617:0xc6914e882784456"),
  "frankys-burger": listPlace(63, "Franky's Burger", "0x465f9d6ef609ebc5:0xc5af47eb93e76810"),
  "ostermalms-food-hall": listPlace(64, "Östermalms Food Hall", "0x465f9d5b24096139:0x3d784e22bab4355a"),
  "stockholm-city-hall": listPlace(65, "斯德哥爾摩市政廳", "0x465f77df9092cde9:0xaeafc90d911394c0"),
  "stockholm-royal-palace": listPlace(66, "斯德哥爾摩王宮", "0x465f9d587e4c4a01:0xbdf97a9648763e36"),
  "atp-atelier": listPlace(67, "ATP Atelier", "0x465f9d4207b8a057:0x6de3cad471e89379"),
  "oresund-bridge": listPlace(68, "松德海峽大橋", "0x4653a7023a051afb:0xbc0e93c11c372873"),
  nyhavn: listPlace(69, "新港", "0x46525322aa676daf:0x99c2a00928e5eaeb"),
  "bergen-fish-market": listPlace(70, "Fishmarket in Bergen", "0x463cfea7e7267061:0xca5264b221de2d38"),
  bryggen: listPlace(71, "布呂根", "0x463cfc1d80be31e1:0xf278657d7d75232e"),
  bergen: listPlace(72, "卑爾根", "0x46390d4966767d77:0x9e42a03eb4de0a08"),
  preikestolen: listPlace(73, "佈道台", "0x463bd51bf654eb09:0x4a83e6bdbfa3b78b"),
  "hardanger-bridge": listPlace(74, "哈當厄大橋", "0x463e7c69b13f58b5:0xea0b9e4d2174163d"),
  geilo: listPlace(75, "耶盧", "0x463fbad93394d403:0xebe09732e103617c"),
  copenhagen: listPlace(76, "哥本哈根", "0x4652533c5c803d23:0x4dd7edde69467b8"),
  "helsinki-cathedral": listPlace(77, "赫爾辛基座堂", "0x46920bce46c319b7:0x28a7d7b40911eba2"),
  "porvoo-old-town": listPlace(78, "Porvoo Old Town", "0x4691f682093f324b:0xf4f7f572532bac33"),
  flam: listPlace(79, "弗洛姆", "0x463e13cfcfc357c3:0x33286ff6aad510c5"),
  flamsbana: listPlace(80, "Flåmsbana", "0x463e117f1a03cf01:0x91431566fbcf92ea"),
  munch: listPlace(81, "孟克美術館", "0x46416e5bed844b27:0x653ef5922c5d121b"),
} as const satisfies Readonly<Record<string, GoogleMapsPlace>>);

const placeUrl = (key: keyof typeof GOOGLE_MAPS_PLACE_CATALOG): string =>
  GOOGLE_MAPS_PLACE_CATALOG[key].url;

/** Only mapsQuery keys that have one unambiguous counterpart in the list. */
export const ACTIVITY_GOOGLE_MAPS_URLS = Object.freeze({
  "Christiansborg Palace Copenhagen": placeUrl("christiansborg-palace"),
  "Kronborg Castle Helsingør Denmark": placeUrl("kronborg-castle"),
  "Frederiksborg Castle Hillerød Denmark": placeUrl("frederiksborg-castle"),
  "Nyhavn Copenhagen Denmark": placeUrl("nyhavn"),
  "Øresund Bridge centre": placeUrl("oresund-bridge"),
  "Gothenburg city centre Sweden": placeUrl("gothenburg"),
  "MUNCH Bjørvika Oslo Norway": placeUrl("munch"),
  "Vøringsfossen viewpoint Norway": placeUrl("voringsfossen"),
  "Hardanger Bridge Norway": placeUrl("hardanger-bridge"),
  "Bryggen Bergen Norway": placeUrl("bryggen"),
  "Bergen Fish Market Norway": placeUrl("bergen-fish-market"),
  "Flåm Railway and Flåm Station Norway": placeUrl("flamsbana"),
  "Briksdal Troll Car departure Norway": placeUrl("troll-car-station"),
  "Ørnesvingen Viewpoint Norway": placeUrl("ornesvingen-viewpoint"),
  "Lysgårdsbakkene Lillehammer Norway": placeUrl("lysgardsbakkene"),
  "Hamar city centre Norway": placeUrl("hamar"),
  "Fram Museum Oslo Norway": placeUrl("fram-museum"),
  "Vigeland Sculpture Park Oslo Norway": placeUrl("vigeland-sculpture-park"),
  "Oslo Opera House Norway": placeUrl("oslo-opera-house"),
  "Örebro Castle Sweden": placeUrl("orebro-castle"),
  "Vasa Museum Stockholm Sweden": placeUrl("vasa-museum"),
  "Stockholm Royal Palace Sweden": placeUrl("stockholm-royal-palace"),
  "Värtahamnen ferry terminal Stockholm Sweden": placeUrl("tallink-silja-line-stockholm"),
  "Porvoo Old Town Finland": placeUrl("porvoo-old-town"),
  "Porvoo riverside red warehouses Finland": placeUrl("porvoo-riverside-warehouses"),
  "Porvoo Cathedral Finland": placeUrl("porvoo-cathedral"),
  "Helsinki Cathedral and Senate Square Finland": placeUrl("helsinki-cathedral"),
  "Uspenski Cathedral Helsinki Finland": placeUrl("uspenski-cathedral"),
  "Oodi Central Library Helsinki Finland": placeUrl("oodi-central-library"),
  "Temppeliaukio Church Helsinki Finland": placeUrl("temppeliaukio-church"),
} as const satisfies Readonly<Record<string, string>>);

export interface ApprovedGoogleMapsLink {
  readonly label: string;
  readonly url: string;
}

const namedPlaceLink = (
  key: keyof typeof GOOGLE_MAPS_PLACE_CATALOG,
): ApprovedGoogleMapsLink => ({
  label: GOOGLE_MAPS_PLACE_CATALOG[key].name,
  url: GOOGLE_MAPS_PLACE_CATALOG[key].url,
});

/** Activities whose confirmed itinerary card covers more than one saved place. */
export const ACTIVITY_GOOGLE_MAPS_LINKS = Object.freeze({
  "Christiansborg Palace Copenhagen": Object.freeze([
    namedPlaceLink("christiansborg-palace"),
    namedPlaceLink("amalienborg-palace"),
    namedPlaceLink("little-mermaid"),
    namedPlaceLink("gefion-fountain"),
  ]),
  "Oslo Opera House Norway": Object.freeze([
    namedPlaceLink("oslo-city-hall"),
    namedPlaceLink("oslo-opera-house"),
  ]),
  "Helsinki Cathedral and Senate Square Finland": Object.freeze([
    namedPlaceLink("helsinki-cathedral"),
    namedPlaceLink("helsinki-senate-square"),
  ]),
  "Värtahamnen ferry terminal Stockholm Sweden": Object.freeze([
    {
      label: "Tallink Silja Line Värtahamnen 登船區參考",
      url: placeUrl("tallink-silja-line-stockholm"),
    },
  ]),
} as const satisfies Readonly<Record<string, readonly ApprovedGoogleMapsLink[]>>);

/** Only destination IDs with one unambiguous counterpart in the shared list. */
export const DESTINATION_GOOGLE_MAPS_URLS = Object.freeze({
  copenhagen: placeUrl("copenhagen"),
  "helsingor-kronborg": placeUrl("kronborg-castle"),
  "hillerod-frederiksborg": placeUrl("frederiksborg-castle"),
  "oresund-bridge": placeUrl("oresund-bridge"),
  gothenburg: placeUrl("gothenburg"),
  orebro: placeUrl("orebro-castle"),
  stockholm: placeUrl("stockholm"),
  geilo: placeUrl("geilo"),
  voringsfossen: placeUrl("voringsfossen"),
  "hardangerfjord-bridge": placeUrl("hardanger-bridge"),
  bergen: placeUrl("bergen"),
  "voss-myrdal": placeUrl("voss"),
  flam: placeUrl("flam"),
  "briksdal-glacier": placeUrl("troll-car-station"),
  geirangerfjord: placeUrl("geirangerfjord"),
  lillehammer: placeUrl("lysgardsbakkene"),
  hamar: placeUrl("hamar"),
  porvoo: placeUrl("porvoo-old-town"),
} as const satisfies Readonly<Record<string, string>>);

/** Confirmed land hotel for each applicable day in the list. */
export const ACCOMMODATION_GOOGLE_MAPS_URLS_BY_DAY = Object.freeze({
  2: placeUrl("crowne-plaza-copenhagen-towers"),
  3: placeUrl("quality-hotel-11-eriksbergshallen"),
  4: placeUrl("vestlia-resort"),
  5: placeUrl("scandic-flesland-airport"),
  6: placeUrl("quality-hotel-sogndal"),
  7: placeUrl("havila-hotel-geiranger"),
  8: placeUrl("thon-hotel-victoria-hamar"),
  9: placeUrl("clarion-hotel-orebro"),
  11: placeUrl("scandic-park-helsinki"),
} as const satisfies Readonly<Partial<Record<number, string>>>);
