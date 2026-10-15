/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **테두리 분담**이다. 시군구의 바깥 테두리를 그 안
 *   동들이 나눠 맡는다고 보고, 한 칸이 몇 미터를 맡았는지를 잰다.
 *     맡은 길이 : 그 동의 경계 가운데 시군구 바깥과 맞닿은 부분의 길이(m)
 *     맡은 몫   : 시군구 테두리 전체에서 그 칸이 차지하는 비율(%)
 *     겉칸·속칸 : 바깥에 한 뼘도 닿지 않으면 속칸이다
 *     제 둘레 몫 : 그 칸 둘레 가운데 바깥을 향한 부분의 비율(%)
 *     마주 보는 곳 : 그 테두리 건너에 있는 시군구와 맞댄 길이
 *
 *   겉칸은 다른 시군구에서 바로 넘어올 수 있고, 속칸은 반드시 같은 시군구
 *   안쪽을 거쳐야 한다. 들어오는 길이 어디서 열리는지가 달라진다.
 *
 *   ★마루온은 '맞닿았는가'를 셌고 리쥬베나는 '몇 다리 건너인가'를 셌다. 여기서는
 *     맞닿은 **길이**를 재고 그것을 시군구 테두리에 대한 **몫**으로 바꾼다.
 *   ★길이를 재려면 꼭짓점이 아니라 **선분**을 맞춰야 한다. 같은 선분이 두 번
 *     나오면 시군구 안쪽 경계, 한 번만 나오면 바깥 테두리다.
 *   앞선 열세 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·
 *   가로세로·둘레·뭉침 정도·안쪽 깊이·매듭점·시도 바깥선까지의 거리·이름 세기·
 *   해의 자리·테두리의 결·다리 수·누운 방향을 썼다. 테두리를 나눠 맡는 축은 처음이다.
 *
 *   node --max-old-space-size=4096 scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');
const vk = (c) => `${Math.round(c[0] * 1e6)},${Math.round(c[1] * 1e6)}`;

function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return null;
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A) / 1e6, lng: (X / A) / kx, lat: (Y / A) / ky, kx, ky };
}
/** 꼭짓점 두 개 사이의 거리(m) */
function segLen(a, b, kx, ky) {
  return Math.hypot((a[0] - b[0]) * kx, (a[1] - b[1]) * ky);
}

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 1차: 전국 시군구별로 묶어 선분을 맞춘다 ─────────────────
   같은 선분이 그 시군구 안에서 두 번 나오면 안쪽 경계, 한 번만 나오면
   바깥 테두리다. 시군구마다 따로 보므로 메모리가 한꺼번에 불어나지 않는다. */
const guKeyOf = (p) => `${p.sidonm}|${p.sggnm}`;
const featsByGu = new Map();
for (const ft of geo.features) {
  const k = guKeyOf(ft.properties);
  if (!featsByGu.has(k)) featsByGu.set(k, []);
  featsByGu.get(k).push(ft);
}

/** code → { rim, perim, segs:[ [k, len] ] } */
const rimOf = new Map();
/** 전국 바깥 테두리 선분 — 2차에서 시군구끼리 맞춘다 */
const rimSegs = new Map();   // segKey → [ {code, guKey, len} , … ]

for (const [guKey, fts] of featsByGu) {
  const local = new Map();   // segKey → [{code, len}]
  const own = new Map();     // code → {perim, list:[{key,len}]}
  for (const ft of fts) {
    const p = ft.properties;
    const code = String(p.adm_cd2);
    const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
    const lat0 = polys[0][0][0][1];
    const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
    const rec = { perim: 0, list: [] };
    for (const poly of polys) {
      for (const ring of poly) {
        for (let i = 0, n = ring.length - 1; i < n; i++) {
          const a = vk(ring[i]), b = vk(ring[i + 1]);
          if (a === b) continue;
          const key = a < b ? `${a}|${b}` : `${b}|${a}`;
          const len = segLen(ring[i], ring[i + 1], kx, ky);
          rec.perim += len;
          rec.list.push({ key, len });
          if (!local.has(key)) local.set(key, []);
          local.get(key).push({ code, len });
        }
      }
    }
    own.set(code, rec);
  }
  for (const [code, rec] of own) {
    let rim = 0;
    const segs = [];
    for (const { key, len } of rec.list) {
      const hit = local.get(key);
      // 같은 시군구 안 다른 칸과 맞댄 선분이면 안쪽 경계다
      const inside = hit && hit.some((x) => x.code !== code);
      if (inside) continue;
      rim += len;
      segs.push(key);
      if (!rimSegs.has(key)) rimSegs.set(key, []);
      rimSegs.get(key).push({ code, guKey, len });
    }
    rimOf.set(code, { rim, perim: rec.perim, segs });
  }
}
featsByGu.clear();

/* ── 2차: 바깥 테두리 건너에 누가 있는가 ────────────────────── */
const guMeta = new Map();    // guKey → {sidonm, sggnm}
for (const ft of geo.features) {
  const p = ft.properties;
  guMeta.set(guKeyOf(p), { sidonm: p.sidonm, sggnm: p.sggnm });
}
/** code → Map(상대 guKey → 맞댄 길이) · '' 는 바다·국경처럼 건너에 아무도 없는 쪽 */
const facing = new Map();
for (const [, arr] of rimSegs) {
  if (arr.length === 1) {
    const { code, len } = arr[0];
    if (!facing.has(code)) facing.set(code, new Map());
    const m = facing.get(code);
    m.set('', (m.get('') || 0) + len);
    continue;
  }
  for (const a of arr) {
    if (!facing.has(a.code)) facing.set(a.code, new Map());
    const m = facing.get(a.code);
    for (const b of arr) {
      if (b.guKey === a.guKey) continue;
      m.set(b.guKey, (m.get(b.guKey) || 0) + a.len);
    }
  }
}
rimSegs.clear();
for (const r of rimOf.values()) delete r.segs;

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rr = rimOf.get(code) || { rim: 0, perim: 0 };
  const fc = facing.get(code) || new Map();
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm, guKey: guKeyOf(p),
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
    rim: Math.round(rr.rim), perim: Math.round(rr.perim),
    face: fc,
  };
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const rimTotal = list.reduce((s, d) => s + d.rim, 0);
  const guFace = new Map();
  for (const d of list) for (const [gk, m2] of d.face) guFace.set(gk, (guFace.get(gk) || 0) + m2);
  const openSea = Math.round(guFace.get('') || 0);
  const guSido = list[0].sidonm;

  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    rimTotal: Math.round(rimTotal),
    openSea,
    innerCount: list.filter((d) => d.rim < 1).length,
    edgeCount: list.filter((d) => d.rim >= 1).length,
    guKey: list[0].guKey, guSido,
    _face: guFace,
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const faceList = [...d.face]
        .filter(([gk]) => gk)
        .map(([gk, m2]) => ({ gk, m: Math.round(m2), ...guMeta.get(gk) }))
        .sort((a, b) => b.m - a.m);
      const outSido = faceList.filter((x) => x.sidonm !== d.sidonm).reduce((s, x) => s + x.m, 0);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        rim: d.rim, perim: d.perim,
        rimPct: d.perim ? Math.round((d.rim / d.perim) * 100) : 0,
        share: rimTotal ? r1((d.rim / rimTotal) * 100) : 0,
        inner: d.rim < 1 ? 1 : 0,
        outSido: Math.round(outSido),
        sea: Math.round(d.face.get('') || 0),
        faceNames: faceList.slice(0, 4).map((x) => ({ gu: pretty(x.sggnm), m: x.m, out: x.sidonm !== d.sidonm })),
        faceCount: faceList.length,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* ── 테두리를 맞댄 시군구 — 이 사이트의 '옆 동네' ────────── */
{
  const byKey = new Map(guAll.map((g) => [g.guKey, g]));
  const sidoSlug = (key) => (MAIN[key] || SUB[key]).slug;
  for (const g of guAll) {
    const list = [...g._face]
      .filter(([gk]) => gk && byKey.has(gk) && byKey.get(gk) !== g)
      .map(([gk, m2]) => {
        const o = byKey.get(gk);
        return { sidoSlug: sidoSlug(o.sidoKey), gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey, m: Math.round(m2) };
      })
      .sort((a, b) => b.m - a.m);
    g.near = list;
    g.nearCount = list.length;
    g.touchSum = list.reduce((s, x) => s + x.m, 0);
    delete g._face;
  }
}

/* ── 시군구 안 차례 ───────────────────────────────────────── */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byRim = g.spots.slice().sort((a, b) => b.rim - a.rim || a.name.localeCompare(b.name, 'ko'));
  byRim.forEach((s, i) => { s.guRimRank = i + 1; });
  g.rimSpot = byRim[0].name; g.rimSpotSlug = byRim[0].slug; g.rimSpotM = byRim[0].rim; g.rimSpotShare = byRim[0].share;
  const edges = byRim.filter((s) => !s.inner);
  g.leastSpot = edges.length ? edges[edges.length - 1].name : '';
  g.leastSpotSlug = edges.length ? edges[edges.length - 1].slug : '';
  g.leastSpotM = edges.length ? edges[edges.length - 1].rim : 0;
  const byPct = g.spots.slice().sort((a, b) => b.rimPct - a.rimPct);
  g.openSpot = byPct[0].name; g.openSpotSlug = byPct[0].slug; g.openPct = byPct[0].rimPct;
  g.innerNames = g.spots.filter((s) => s.inner).map((s) => s.name).sort((a, b) => a.localeCompare(b, 'ko'));
}

/* ── 전국 차례 ────────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.rim - a.rim).forEach((s, i) => { s.rimRank = i + 1; });
spotAll.slice().sort((a, b) => b.share - a.share).forEach((s, i) => { s.shareRank = i + 1; });

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.guKey; delete g.guSido;
  }
  const top = allSpots.slice().sort((a, b) => b.rim - a.rim)[0];
  const innerSum = allSpots.filter((s) => s.inner).length;
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    rimSum: gus.reduce((s, g) => s + g.rimTotal, 0),
    seaSum: gus.reduce((s, g) => s + g.openSea, 0),
    innerSum,
    edgeSum: allSpots.length - innerSum,
    innerPct: allSpots.length ? Math.round((innerSum / allSpots.length) * 100) : 0,
    topSpot: top ? top.name : '', topRim: top ? top.rim : 0,
    gu: gus,
  });
}

const rims = spotAll.map((s) => s.rim).sort((a, b) => a - b);
const pcts = spotAll.map((s) => s.rimPct).sort((a, b) => a - b);
const innerAll = spotAll.filter((s) => s.inner).length;
const out = {
  version: VERSION,
  source: '행정동 경계 admdongkor(CC BY 4.0) — 원자료 국가공간정보포털, 배포처 github.com/vuski/admdongkor',
  built: new Date().toISOString().slice(0, 10),
  axis: '테두리 분담 — 시군구 바깥 테두리에서 그 동이 맡은 길이와 몫, 겉칸과 속칸',
  method: '행정동 경계를 선분 단위로 쪼개 시군구마다 따로 맞췄다. 같은 선분이 그 시군구 안에서 두 번 나오면 안쪽 경계로 보고, 한 번만 나오면 바깥 테두리로 보았다. 그 길이를 미터로 더해 동마다 맡은 길이를 내고, 시군구 테두리 전체로 나눠 몫을 구했다. 남은 테두리 선분을 전국에서 다시 맞춰 건너편 시군구와 맞댄 길이를 냈다.',
  coverageFrom: '서울·인천·경기·부산에서는 동마다 페이지를 하나씩 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구에서 멈춘다. 읍과 면은 페이지 없이 시군구 목록에 이름으로만 실린다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    rimMid: rims[rims.length >> 1], rimMax: rims[rims.length - 1],
    pctMid: pcts[pcts.length >> 1],
    inner: innerAll,
    innerPct: Math.round((innerAll / spotAll.length) * 100),
    topName: spotAll.slice().sort((a, b) => b.rim - a.rim)[0].name,
    topM: spotAll.slice().sort((a, b) => b.rim - a.rim)[0].rim,
    shareName: spotAll.slice().sort((a, b) => b.share - a.share)[0].name,
    sharePct: spotAll.slice().sort((a, b) => b.share - a.share)[0].share,
    rimKm: Math.round(guAll.reduce((s, g) => s + g.rimTotal, 0) / 1000),
    featAll: geo.features.length,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out, (k, v) => (k === 'face' ? undefined : v)));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`맡은 길이 중앙 ${C.rimMid}m · 최대 ${C.topM}m(${C.topName}) · 테두리 합 ${C.rimKm}km`);
console.log(`속칸 ${C.inner}곳(${C.innerPct}%) · 제 둘레 가운데 바깥을 향한 몫 중앙 ${C.pctMid}%`);
console.log(`한 칸이 가장 크게 맡은 몫 ${C.shareName} ${C.sharePct}%`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 테두리 ${String(Math.round(s.rimSum / 1000)).padStart(4)}km · 속칸 ${String(s.innerSum).padStart(3)}(${s.innerPct}%)`);
