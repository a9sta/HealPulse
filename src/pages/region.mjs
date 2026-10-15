import { layout, band } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseTiles, stepStair, stepSet, factSheet, faqBlock, noticeBlock,
  rimKin, spotIndex, ruralList, dongNameList, guIndex, nearList, tollBand,
  topicLinks, courseTopic, mTxt,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  rimWord, shareWord, faceWord, metWord, seaWord,
  ANCHOR, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 선분을 맞춰 센 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    rim: s.rim, rimTxt: mTxt(s.rim), perimTxt: mTxt(s.perim), rimPct: s.rimPct,
    share: s.share, inner: s.inner, guRimRank: s.guRimRank, rimRank: s.rimRank,
    faceList: s.faceNames.length ? s.faceNames.slice(0, 3).map((x) => x.gu).join(', ') : '',
    faceCount: s.faceCount,
    rimSpot: g.rimSpot, rimSpotTxt: mTxt(g.rimSpotM), rimSpotShare: g.rimSpotShare,
    openSpot: g.openSpot, openPct: g.openPct,
    rimTotalTxt: mTxt(g.rimTotal), innerCount: g.innerCount, edgeCount: g.edgeCount,
    guSeaTxt: mTxt(g.openSea),
    allSpots: counts.spot, guSpotCount: g.spotCount,
    rimNote: rimWord(s.rim), shareNote: shareWord(s.share),
    faceNote: faceWord(s.rimPct), metNote: metWord(s.faceCount), seaNote: seaWord(s.sea),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 페이지 — 메인 네 시도에서만 낸다 ──────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="intro">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = band('fact', 'measured', `${esc(s.name)}${josa(s.name, '이/가')} 맡은 테두리`,
    factSheet([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['겉자리·속자리', s.inner ? `속자리 — 둘레 ${mTxt(s.perim)}가 모두 ${esc(g.name)} 안쪽을 봅니다` : `겉자리 — ${esc(rimWord(s.rim))}`],
      s.inner
        ? ['안쪽에서 드는 길', `${esc(g.name)} 다른 자리를 한 번 거쳐야 닿습니다`]
        : ['맡은 길이', `${mTxt(s.rim)} — 시군구 테두리의 ${s.share}%`],
      s.inner
        ? ['둘레 전체', `${mTxt(s.perim)} · 땅 ${km2(s.area)}`]
        : ['제 둘레', `${mTxt(s.perim)} 가운데 ${s.rimPct}%가 바깥 · 땅 ${km2(s.area)}`],
      ['마주 보는 시군구', s.faceNames.length ? s.faceNames.map((x) => `${esc(x.gu)} ${mTxt(x.m)}${x.out ? '(시도 밖)' : ''}`).join(' · ') : `없음 — ${esc(g.name)} 안쪽 자리들로만 둘러싸였습니다`],
      ...(s.sea ? [['건너가 비어 있는 구간', `${mTxt(s.sea)} — ${esc(seaWord(s.sea))}`]] : []),
      ...(s.inner ? [] : [['시군구 안 차례', `테두리를 맡은 길이로 ${s.guRimRank}번째 / ${g.spotCount}자리`]]),
    ]),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '07');

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) far.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const sameSido = [];
  for (const x of sd.gu) {
    if (x.slug === g.slug) continue;
    for (const y of x.spots) sameSido.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 다른 자리`, items: sameSido, pick: 18, anchor: ANCHOR },
    { label: '테두리를 맞댄 시군구', items: g.near.slice(0, 8).map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시도', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    tollBand(cfg, `${g.name} ${s.name}`, seed),
    courseTiles(courses, seed, s.name, '02', { full: false }),
    rimKin(sd, g, s, seed, '03'),
    spotIndex(sd, g, seed, s.slug, '04'),
    stepStair(seed, '05'),
    guIndex(sd, seed, g.slug, '06', { pick: 12 }),
    faqHtml,
    noticeBlock(seed, '08'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="title1-s">출장마사지 홈타이 · ${s.inner ? `${esc(g.name)} 안쪽에만 닿은 속자리` : `시군구 테두리 ${mTxt(s.rim)}를 맡은 겉자리`}</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 동네', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${g.name} ${s.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시군구 페이지 ────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 페이지에서 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다(강화·가평·양평·연천·기장).
     페이지를 낼 자리가 0이므로 리드·장부·목록을 따로 갈라야 한다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area),
    rimTotalTxt: mTxt(g.rimTotal), openSea: g.openSea, seaTxt: mTxt(g.openSea),
    innerCount: g.innerCount, edgeCount: g.edgeCount,
    rimSpot: g.rimSpot || '', rimSpotTxt: mTxt(g.rimSpotM || 0), rimSpotShare: g.rimSpotShare || 0,
    leastSpot: g.leastSpot || '', leastSpotTxt: mTxt(g.leastSpotM || 0),
    openSpot: g.openSpot || '', openPct: g.openPct || 0,
    nearCount: g.nearCount,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="intro">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}자리`],
    mode === 'spot' ? ['페이지를 낸 동', `${g.spotCount}자리`]
      : mode === 'rural' ? ['페이지를 낸 동', '없음 — 읍·면만 있는 군입니다']
        : ['끊은 겹', '시군구 — 동 이름은 아래에 적었습니다'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}자리 — 이름으로만 적음(읍 ${g.eupCount}·면 ${g.myeonCount})` : '없음'],
    ['바깥 테두리 전체', mTxt(g.rimTotal)],
    ['겉자리·속자리', g.spotCount ? `겉 ${g.edgeCount}자리 · 속 ${g.innerCount}자리` : `행정동 ${g.dongCount}자리를 한 장에서 받습니다`],
    ['마주 보는 시군구', `${g.nearCount}곳`],
    ['건너가 비어 있는 구간', g.openSea ? mTxt(g.openSea) : '없음'],
    ['땅', km2(g.area)],
  ];
  if (mode === 'spot' && g.rimSpot) {
    rows.splice(6, 0,
      ['테두리를 가장 길게 맡은 자리', `<a href="/${sd.slug}/${g.slug}/${g.rimSpotSlug}/">${esc(g.rimSpot)}</a> ${mTxt(g.rimSpotM)}(${g.rimSpotShare}%)${g.leastSpot ? ` · 가장 짧게 맡은 자리 <a href="/${sd.slug}/${g.slug}/${g.leastSpotSlug}/">${esc(g.leastSpot)}</a> ${mTxt(g.leastSpotM)}` : ''}`],
      ['둘레가 가장 많이 열린 자리', `<a href="/${sd.slug}/${g.slug}/${g.openSpotSlug}/">${esc(g.openSpot)}</a> ${g.openPct}%`]);
  }
  const facts = band('fact', 'measured', `${esc(g.name)} 테두리 장부`, factSheet(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '테두리를 맞댄 시군구', items: g.near.slice(0, 8).map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시군구', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '10', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    tollBand(cfg, `${sd.name} ${g.name}`, seed),
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    courseTiles(courses, seed, g.name, '04', { full: false }),
    nearList(sd, g, seed, '05'),
    faqHtml,
    stepStair(seed, '07'),
    noticeBlock(seed, '08'),
    guIndex(sd, seed, g.slug, '09', { pick: 20 }),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="title1-s">출장마사지 홈타이 · ${mode === 'spot' ? `바깥 테두리 ${mTxt(g.rimTotal)}를 동 ${g.spotCount}자리가 나눠 맡습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}자리까지 나갑니다` : `행정동 ${g.dongCount}자리 전부 나갑니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 동네', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${g.name}에서 부르는 다섯 걸음`, steps, cfg),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 페이지 ──────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    innerSum: sd.innerSum,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="intro"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = band('fact', 'measured', `${esc(sd.name)} 테두리 장부`,
    factSheet([
      ['행정 명칭', esc(sd.full)],
      ['페이지를 낸 겹', sd.main ? '시군구 밑에 동까지' : '시군구에서 끊음'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}자리`],
      sd.main ? ['페이지를 낸 동', `${sd.spotCount}자리`] : ['동 이름', '시군구 페이지 안 목록에'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}자리 — 시군구 페이지에 이름으로만` : '없음'],
      ['시군구 테두리 합', mTxt(sd.rimSum)],
      sd.main ? ['속자리', sd.innerSum ? `${sd.innerSum}자리 (${sd.innerPct}%)` : '없음'] : ['여는 시각', `접수 ${esc(cfg.hours)} · 셈 ${esc(cfg.pay)}`],
      sd.main && sd.topSpot ? ['테두리를 가장 길게 맡은 동', `${esc(sd.topSpot)} ${mTxt(sd.topRim)}`] : ['받는 땅', km2(sd.area)],
      ['건너가 비어 있는 구간 합', sd.seaSum ? mTxt(sd.seaSum) : '없음'],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '06');

  const csLinks = band('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<ul class="chips">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `어떤 코스냐에 따라 손이 길게 머무는 자리가 달라집니다. 가격표는 ${esc(sd.name)} 전체가 한 장입니다.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.rim - a.s.rim || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = band('rimtop', 'longest rim', `${esc(sd.name)}에서 테두리를 가장 길게 맡은 동`,
      `<ul class="chips">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${mTxt(x.s.rim)}</a></li>`).join('\n')}\n</ul>`,
      '바깥과 넓게 닿은 자리입니다. 옆 시군구에서 곧장 꺾어 들어오는 경우가 많습니다. 여기 없는 자리는 시군구를 거쳐 들어가 주십시오.', '03');
  } else {
    pickBlock = band('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="chips">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}자리</a></li>`).join('\n')}\n</ul>`,
      '행정동이 많다는 것은 같은 면적을 더 촘촘히 갈라 이름 붙였다는 뜻입니다.', '03');
  }

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const deep = [];
  for (const g of sd.gu) for (const x of g.spots) deep.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    ...(deep.length ? [{ label: `${sd.name} 동으로 바로`, items: deep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시도', items: far, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    tollBand(cfg, sd.name, seed),
    guIndex(sd, seed, null, '02'),
    pickBlock,
    csLinks,
    courseTiles(courses, seed, sd.name, '05'),
    faqHtml,
    stepStair(seed, '07'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="title1-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}자리` : `시군구 ${sd.gu.length}곳`} · 시군구 테두리 합 ${mTxt(sd.rimSum)}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 동네', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
