import { layout, band } from '../lib/html.mjs';
import { esc, hash, won, josa, km2, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factSheet, faqBlock, stepStair, stepSet, noticeBlock, tollBand, courseTiles, topicLinks, courseTopic, guIndex, mTxt } from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않는다. 1,232 × 7 이면 여덟 쪽이 넘는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 페이지가 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름이 들어갑니다. 마치고 씻으실 수 있는 시각인지만 한 번 보시고 고르십시오.',
  false: '기름이 들어가지 않습니다. 옷을 입은 채 받고 마치면 그대로 나가셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 받으시는 동안 맞춰 갑니다. 처음 십 분이면 어느 선이 맞는지 서로 알게 됩니다.',
  '표에 적은 등급은 출발점일 뿐입니다. 아프시면 참지 마시고 바로 짚어 주십시오.',
  '같은 힘도 사람마다 다르게 느낍니다. 적힌 글자보다 그날의 몸이 먼저입니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 고르시는 분들은 대개 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 쓰시라고 맞춰 둔 코스입니다. 사정이 다르면 통화하면서 바꿔 드립니다.`,
  (c) => `${c.for} 이쪽이 맞습니다. 정하셨다가 바꾸셔도 되고 셈은 마지막에 받으신 코스로 합니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="intro">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = band('fact', 'course', `${esc(c.ko)} 한 장에 정리`,
    factSheet([
      ['기본 길이', `${c.min}분`],
      ['금액', `${won(c.price)}원 — 어느 지역이든 같음`],
      ['세기', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['준비물', c.oil ? '수건 두 장과 누우실 자리' : '누우실 자리 하나 — 수건은 한 장으로 족합니다'],
      ['여는 시각', `${esc(cfg.hours)} 접수 · ${esc(cfg.pay)} 셈 · 도착 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = band('cmp', 'compare', '나머지와 나란히 놓고 보면',
    `<table class="table2"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="pick"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '길게 받는 것과 깊게 받는 것은 다릅니다. 길이 칸과 세기 칸을 떼어 놓고 보십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '04');

  const bySido = regions.map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const others2 = courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: x.ko, href: `/course/${x.slug}/` }));
  const steps = stepSet(seed);
  const deepAll = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const x of g.spots) deepAll.push({ label: `${g.name} ${x.name}`, href: `/${r.slug}/${g.slug}/${x.slug}/` });
  const topics = topicLinks([
    { label: `${c.ko}${josa(c.ko, '을/를')} 지역에서`, items: bySido, anchor: COURSE_ANCHOR },
    { label: '다른 코스', items: others2, anchor: COURSE_ANCHOR },
    { label: '시군구로 바로', items: guList, pick: 18, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deepAll, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '07', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    tollBand(cfg, c.ko, seed),
    compare,
    stepStair(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="title1-s">${c.min}분에 ${won(c.price)}원 · 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const openLines = [
    `${sd.name} 안에서 ${c.ko}에 매기는 금액은 하나뿐입니다. ${c.min}분에 ${won(c.price)}원이고 가깝다고 빼거나 멀다고 더 받지 않습니다.`,
    `${sd.name} 어느 동네에서 부르셔도 ${c.ko}의 내용은 똑같습니다. 바뀌는 것은 도착까지 걸리는 시간뿐입니다.`,
    `${sd.name}에서 들어오는 ${c.ko} 문의 역시 이 번호로 받습니다. ${c.min}분에 ${won(c.price)}원입니다.`,
  ];
  const secondMain = [
    `${sd.name}에서는 동 ${sd.spotCount}자리가 저마다 페이지를 가집니다. 사시는 자리를 누르시면 그 동네가 시군구 테두리를 얼마나 맡았는지, 건너편이 어디인지가 나옵니다.`,
    `${sd.name}의 시군구 테두리를 모두 더하면 ${mTxt(sd.rimSum)}이고, 그중 ${sd.innerSum}자리는 바깥에 전혀 닿지 않는 속자리입니다.`,
    `${sd.name}에서 테두리를 가장 길게 맡은 자리는 ${sd.topSpot}로 ${mTxt(sd.topRim)}입니다. 겉자리와 속자리는 들어오는 길이 다릅니다.`,
  ];
  const secondSub = [
    `${sd.name}${josa(sd.name, '은/는')} 시군구 ${sd.gu.length}곳에서 겹을 끊었습니다. 동네 이름까지 보시려면 시군구 페이지로 한 번 더 들어가십시오.`,
    `${sd.name}에서 받는 땅의 시군구 테두리를 더하면 ${mTxt(sd.rimSum)}입니다. 페이지는 시군구 ${sd.gu.length}곳까지 냈습니다.`,
    `${sd.name}의 행정동 ${sd.dongCount}자리 이름은 시군구 페이지마다 올려 두었습니다. 접수 때는 그중 하나만 말씀하시면 됩니다.`,
  ];
  const second = at(h, sd.main ? secondMain : secondSub, 6);

  const open = `<div class="intro">
  <p>${esc(at(h, openLines, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = band('fact', 'course', `${esc(sd.name)}에서 받는 ${esc(c.ko)}`,
    factSheet([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['페이지를 낸 겹', sd.main ? `시군구 ${sd.gu.length}곳 밑에 동 ${sd.spotCount}자리` : `시군구 ${sd.gu.length}곳`],
      ['기본 길이', `${c.min}분`],
      ['금액', `${won(c.price)}원 — ${esc(sd.name)} 어디나 같음`],
      ['세기와 결', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['오래 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '안 씁니다'],
      ['이 지역 시군구 테두리 합', mTxt(sd.rimSum)],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '05');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 페이지를 함께 걸어 얇은 페이지가 생기지 않게 한다. */
  const guHere = sd.gu.map((g) => ({ label: `${g.name}`, href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const otherCourse = courses.filter((x) => x.slug !== c.slug)
    .map((x) => ({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` }));
  const sameCourse = regions.filter((r) => r.slug !== sd.slug)
    .map((r) => ({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} 다른 코스`, items: otherCourse, anchor: COURSE_ANCHOR },
    { label: `${c.ko}${josa(c.ko, '을/를')} 다른 지역에서`, items: sameCourse, anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 시군구`, items: guHere, pick: 16, anchor: ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동으로 바로`, items: deepHere, pick: 14, anchor: ANCHOR }] : []),
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '06', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  /* ★서브 시도의 시도×코스는 지역 고유 내용이 적어 얇아진다. 그 시도에 든
     행정동 이름을 그대로 깔아 쪽마다 다른 살을 붙인다(시군구 쪽에도 있는 목록이다). */
  const subNames = [];
  if (!sd.main) for (const g of sd.gu) {
    for (const d of (g.dongNames || [])) subNames.push(`${g.name} ${d}`);
    for (const m of (g.rural || [])) subNames.push(`${g.name} ${m.name}`);
  }
  /* ★한 시도의 코스 쪽 7~9장이 같은 이름 목록을 통째로 이고 있으면 그 덩어리 하나로
     쪽끼리 겹침이 60%%를 넘는다. 쪽마다 시드로 다른 묶음을 보이고 전부는 시도 쪽에 둔다. */
  const nameShow = subNames.length
    ? shuffle(subNames, hash(seed, 'sn')).slice(0, Math.max(10, Math.round(subNames.length * 0.42)))
    : [];
  const namesBlock = nameShow.length
    ? band('sidodong', 'dong', `${esc(sd.name)}에 든 행정동 가운데 ${nameShow.length}곳`,
        `<ul class="bare">${nameShow.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`
        + `<p class="band-x">${esc(sd.name)}에 든 행정동은 모두 ${subNames.length}곳입니다. <a href="/${sd.slug}/">${esc(sd.name)} 페이지</a>에서 시군구별로 보실 수 있습니다.</p>`,
        '이 지역은 시군구에서 겹을 끊었습니다. 아래 이름 하나만 전화로 불러 주시면 됩니다.', '03')
    : '';

  const body = [
    open,
    facts,
    tollBand(cfg, `${sd.name} ${c.ko}`, seed),
    courseTiles(courses, seed, sd.name, '02', { full: false }),
    namesBlock,
    guIndex(sd, seed, null, '04', { pick: 14 }),
    faqHtml,
    stepStair(seed, '06'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="title1-s">출장마사지 홈타이 방문 · ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '가는 동네', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 ${c.ko}${josa(c.ko, '을/를')} 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
