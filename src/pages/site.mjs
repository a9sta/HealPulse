import { layout, band, callChip } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseTiles, stepStair, stepSet, factSheet, faqBlock, noticeBlock,
  longtail, tollBand, siteLinks, topicLinks, courseTopic, docTopics, mTxt,
} from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="open" aria-label="첫 안내">
  <p class="open-sl">${esc(cfg.brand.slogan)}</p>
  <p class="open-p">오실 가게가 없습니다. 걸어 주시면 관리사가 가방을 들고 그 주소로 찾아갑니다. 수도권과 부산은 동마다 페이지를 냈고, 대전·대구·울산과 지정한 시·군은 시군구에서 겹을 끊었습니다.</p>
  ${callChip(cfg, { size: 'l' })}
  <dl class="open-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>밤낮 구분 없이</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>마치고 한 번에</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>보통 이만큼 걸립니다</dd></div>
    <div><dt>동 ${counts.spot}자리</dt><dd>시군구 ${counts.gu}곳 안에</dd></div>
  </dl>
</section>`;

  /* ★지역 고르기 — 이름을 두 칸으로 늘어놓지 않는다. 시도를 접어 두고 누르면
     그 아래 시군구가 테두리 길이와 함께 펼쳐진다. 스크립트 없이 details 로만 움직인다. */
  const rows = [...main, ...sub].map((r) => `<details${r.main ? ' open' : ''}>
    <summary><b>${esc(r.name)}</b><span class="sum">${r.main ? `동 ${r.spotCount}자리` : `시군구 ${r.gu.length}곳`} · 테두리 합 ${mTxt(r.rimSum)}${r.main && r.innerSum ? ` · 속자리 ${r.innerSum}` : ''}</span></summary>
    <ul class="kids">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/">${esc(g.name)}<span>${mTxt(g.rimTotal)}</span></a></li>`).join('')}</ul>
    <p class="go"><a href="/${r.slug}/">${esc(r.name)} 한 장으로 보기</a></p>
  </details>`).join('\n');
  const areaBlock = band('area', 'where', '어느 동네로 가 드릴까요',
    `<div class="tree">${rows}</div>
     <p class="tree-key">시도 이름을 누르시면 그 아래 시군구가 펼쳐집니다. 오른쪽 숫자는 그 시군구를 두르는 바깥 테두리의 길이입니다.
       접혀 있는 쪽은 시군구에서 겹을 끊은 지역이고, 겹이 달라도 받는 번호와 금액은 하나입니다.
       <a href="/area/">가는 동네를 한 장에</a> 펼쳐 두었습니다.</p>`,
    '겹이 둘로 나뉜 것은 기록한 깊이가 다를 뿐입니다. 찾아가는 지역을 줄여 둔 것이 아닙니다.', '01');

  const whyBlock = band('why', 'method', '왜 테두리를 재 두나요?',
    `<div class="intro">
      <p>동네 페이지를 열면 그 자리가 <strong>시군구 바깥 테두리 가운데 몇 미터를 맡고 있는지</strong>가 적혀 있습니다. 가장 길게 맡은 자리는 ${esc(counts.topName)}로 ${mTxt(counts.topM)}이고, 한 자리가 가져가는 몫이 가장 큰 곳은 ${esc(counts.shareName)}로 ${counts.sharePct}%입니다. 페이지를 낸 ${counts.spot}자리의 한가운데 값은 ${mTxt(counts.rimMid)}입니다.</p>
      <p>이 숫자를 적는 까닭은 하나입니다. 테두리를 길게 맡은 동네는 옆 시군구에서 곧장 꺾어 들어올 수 있고, 한 뼘도 닿지 않는 속자리는 안쪽을 한 번 거쳐야 합니다. 속자리는 ${counts.inner}곳으로 전체의 ${counts.innerPct}%입니다. <strong>어느 길이 빠른지가 여기서 갈립니다.</strong></p>
      <p>전국 행정동 ${counts.featAll}곳의 경계를 선분 단위로 맞춰 센 값이고, 같은 방식으로 다시 세면 같은 숫자가 나옵니다. 계산 절차는 <a href="/magazine/what-is-rim-share/">따로 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = band('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="cards2">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="band-x"><a href="/magazine/">노트 전부 보기</a></p>`,
    '체험담이 아닙니다. 미리 보시면 통화가 줄어드는 내용만 골랐습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 동네'), 6, '06');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseTiles(courses, seed, '부르시는 동네', '03'),
    stepStair(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    topics,
    tollBand(cfg, '지금 계신 동네', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="title1-s">서울·인천·경기·부산 동 ${counts.spot}자리 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 걸음', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="intro">
  <p>페이지를 낸 자리를 한 화면에 모았습니다. 시군구 ${counts.gu}곳과 동 ${counts.spot}자리가 있습니다. 읍·면 ${counts.rural}자리는 페이지만 없고 받는 것도 나가는 것도 같습니다.</p>
  <p>수도권과 부산에서는 동을 하나씩 눌러 들어가실 수 있고, 나머지는 시군구 페이지 안에 동 이름을 적어 두었습니다. 깊이가 둘로 나뉜 것은 문의가 몰리는 쪽만 더 촘촘히 갈랐기 때문입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => band(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}자리` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="grid3">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="g-n">${esc(g.name)}</span><span class="g-s">테두리 ${mTxt(g.rimTotal)}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}에서는 시군구를 먼저 고르셔야 그 아래 동이 나타납니다. 오른쪽 숫자는 그 시군구를 두르는 바깥 선의 길이입니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구가 마지막 겹입니다. 행정동 ${r.dongCount}자리 이름은 시군구 페이지마다 적어 두었습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '90');

  const body = [open, tollBand(cfg, '사시는 동네', seed), blocks, faqHtml, stepStair(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `가는 동네 <span class="title1-s">시군구 ${counts.gu}곳과 동 ${counts.spot}자리를 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '가는 동네', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 나가는 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '사시는 동네에서 부르는 다섯 걸음', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="intro">
  <p>일곱 가지입니다. 고르실 것은 세 가지뿐입니다 — 세기와 길이, 그리고 기름. 나머지는 통화하면서 맞춥니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 오래 받는다고 세게 받는 것이 아니고 비싸다고 더 나은 것도 아닙니다.</p>
</div>`;

  const table = band('all', 'table', '일곱 가지를 한자리에',
    `<table class="table2"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '금액이 낮은 것부터 세웠습니다. 어느 동네에서 부르셔도 같은 표를 씁니다.', '01');

  const pickBy = band('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="cards2">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '고르신 뒤에 바꾸셔도 됩니다. 셈은 마지막에 받으신 코스로 매깁니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [open, table, pickBy, tollBand(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한자리에 모았습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="title1-s">세기 · 길이 · 기름으로 나란히 놓고 보기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`), desc: clampDesc(`코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한자리에 모았습니다.`), listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 가격표 ───────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="intro">
  <p>표 한 장으로 끝납니다. 표에 올리지 않은 돈은 어떤 이름으로도 받지 않습니다.</p>
  <p>길 건너든 한 시간을 달리는 읍내든 코스가 같으면 금액이 같습니다. 멀리 가는 부담은 저희 쪽에서 집니다.</p>
</div>`;

  const table = band('tbl', 'prices', '코스별 기본 길이와 금액',
    `<table class="table2"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">금액</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 금액은 서로 비교해 보시라고 적은 것입니다. 실제로 분 단위로 나눠 받지는 않습니다.', '01');

  const noExtra = band('nox', 'never', '붙지 않는 것',
    `<ul class="cares">
      <li>차비 — 거리가 얼마든 계산에 넣지 않습니다.</li>
      <li>심야 할증 — 새벽에 부르셔도 표가 바뀌지 않습니다.</li>
      <li>명절·휴일 할증 — 달력에 따라 금액이 오르지 않습니다.</li>
      <li>선금 — 예약금과 보증금을 아예 두지 않았습니다.</li>
      <li>취소 수수료 — 날짜를 옮기거나 접으셔도 받지 않습니다.</li>
      <li>주차비 — 저희가 냅니다.</li>
    </ul>`,
    '입금을 먼저 요구하는 연락이라면 저희 쪽이 아닙니다.', '02');

  const pay = band('how', 'payment', '금액은 어떻게 내나요?',
    factSheet([
      ['내는 때', '마치고 그 자리에서'],
      ['수단', '현금과 카드 — 어느 쪽이든 같은 금액'],
      ['영수증', '말씀하시면 드립니다'],
      ['길게 받으실 때', '접수할 때 정하면 늘어난 만큼만 붙습니다'],
      ['두 분이 받으실 때', '인원수만큼 계산합니다. 묶음 할인이 없습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '04');

  const body = [open, table, noExtra, pay, tollBand(cfg, '금액 확인', seed), faqHtml, docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`가격표 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 길이와 금액입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 마친 뒤 현금이나 카드로 받습니다.`),
      h1: `가격표 <span class="title1-s">${won(sorted[0].price)}원부터 · 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '가격표', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 금액`, desc: clampDesc(`코스별 기본 길이와 금액입니다. ${won(sorted[0].price)}원부터입니다.`), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 이용 안내 ──────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="intro">
  <p>처음 이용해 보시는 분을 염두에 두고 적었습니다. 전화 한 통이면 끝나는 일이라 오래 읽으실 필요가 없습니다.</p>
</div>`;

  const what = band('need', 'ready', '무엇을 두고 기다리면 되나요?',
    `<ul class="cares">
      <li>누우실 자리 — 바닥이든 침대든 상관없습니다.</li>
      <li>수건 두 장 — 집에 있는 것이면 되고 기름 없는 코스는 한 장으로 족합니다.</li>
      <li>방 하나 — 문이 닫히면 식구가 계셔도 괜찮습니다.</li>
    </ul>
    <p class="band-x">접이식 매트와 기름, 향은 관리사 가방에 들어 있습니다. 장을 보실 것이 없습니다.</p>`,
    null, '01');

  const timing = band('when', 'hours', '언제 부를 수 있나요?',
    factSheet([
      ['접수', `${esc(cfg.hours)} — 시각에 제한을 두지 않습니다`],
      ['도착', `보통 ${esc(cfg.arrive)}, 안쪽 골목이면 더 걸립니다`],
      ['시간 옮기기', '언제든 됩니다. 비용이 붙지 않습니다'],
      ['취소', '관리사가 도착해 있으면 그것만 알려 주십시오'],
      ['몰리는 때', '금요일과 토요일 밤'],
      ['한가한 때', '주중 낮 — 거의 바로 나갑니다'],
    ]), null, '02');

  const refuse = band('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="cares">
      <li>성적인 이야기가 섞일 때 — 즉시 통화를 끊습니다.</li>
      <li>발열이 있거나 상처가 부었을 때 — 다른 날로 옮겨 드립니다.</li>
      <li>주소 끝자리를 끝까지 안 주실 때 — 배정과 경로를 정할 수 없습니다.</li>
      <li>관리사 개인 연락처를 요구하실 때.</li>
      <li>의료기관을 먼저 찾으셔야 할 상태로 보일 때.</li>
      <li>만 열아홉 살에 못 미치실 때.</li>
    </ul>`,
    '거절된 경우에는 어떤 비용도 청구하지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 동네'), 6, '05');

  const body = [open, what, timing, stepStair(seed, '04'), refuse, tollBand(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용 안내 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다. 준비물, 접수 시각, 못 받는 경우, 금액 내는 법을 차례로 적었습니다.'),
      h1: `이용 안내 <span class="title1-s">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용 안내', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부르실 때 거치는 다섯 걸음', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: clampDesc('처음 부르실 때 필요한 것만 모았습니다.'), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';

  const open = `<div class="intro">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 없이 방문만 하는 곳입니다. 업소를 늘어놓고 이어 주는 중개가 아니라 저희가 받고 저희가 나갑니다.</p>
  <p>이름은 낫게 한다는 말(heal)과 맥박(pulse)을 붙인 것입니다. 손으로 할 수 있는 범위를 넘지 않겠다는 뜻으로 지었습니다.</p>
</div>`;

  const line = band('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="cares">
      <li>합니다 — 손으로 뭉친 자리를 풀어 드리는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 형태로도 두지 않습니다.</li>
      <li>안 합니다 — 진단과 치료. 의료기관이 할 일입니다.</li>
      <li>안 받습니다 — 만 19세 미만인 분.</li>
      <li>안 싣습니다 — 후기와 별점. 꾸며 쓴 글을 걸러 낼 수가 없습니다.</li>
      <li>안 올립니다 — 인물 사진. 사진과 실물이 어긋나는 일이 많습니다.</li>
      <li>안 받습니다 — 선입금. 앞서 받는 돈이 없습니다.</li>
    </ul>`, null, '01');

  const how = band('data', 'sources', '테두리 분담은 어떻게 잰 건가요?',
    `<div class="intro">
      <p>공개된 행정동 경계를 전국 ${counts.featAll}곳 모두 읽어 <strong>선분 단위로 쪼갠 뒤 시군구마다 따로 맞춰</strong> 보았습니다. 같은 선분이 그 시군구 안에서 두 번 나오면 안쪽 경계로, 한 번만 나오면 바깥 테두리로 보았습니다.</p>
      <p>그 길이를 미터로 더해 동네마다 맡은 몫을 냈습니다. 전국 시군구 테두리를 모두 합하면 ${counts.rimKm}km가 되고, 한 자리가 맡은 길이는 한가운데가 ${mTxt(counts.rimMid)}, 가장 긴 곳이 ${esc(counts.topName)}의 ${mTxt(counts.topM)}입니다.</p>
      <p>바깥에 한 뼘도 닿지 않는 속자리는 ${counts.inner}곳으로 전체의 ${counts.innerPct}%입니다. 제 둘레 가운데 바깥을 보는 비율은 한가운데가 ${counts.pctMid}%입니다. 남은 테두리 선분을 전국에서 다시 맞춰 건너편 시군구와 맞댄 길이도 함께 냈습니다.</p>
      <p>이 값은 행정 경계의 길이일 뿐 실제 도로가 그 선을 따라 나 있는지는 보지 않습니다. 강이나 철길로 막혀 돌아가야 하는 구간도 맞댄 것으로 셉니다. 그 점을 알고 쓰셔야 합니다.</p>
    </div>
    ${factSheet([
      ['밑자료 출처', esc(data.source)],
      ['자료 묶음 이름', esc(data.version)],
      ['재는 값', esc(data.axis)],
      ['계산 절차', esc(data.method)],
      ['페이지를 내는 기준', esc(data.coverageFrom)],
      ['페이지를 낸 단위', `시도 ${counts.sido} · 시군구 ${counts.gu} · 동 ${counts.spot}`],
      ['페이지가 없는 단위', `읍 ${counts.eup}자리 · 면 ${counts.myeon}자리 — 목록에 이름으로만`],
      ['테두리를 가장 길게 맡은 자리', `${esc(counts.topName)} ${mTxt(counts.topM)}`],
      ['한 자리가 가져간 몫의 최대', `${esc(counts.shareName)} ${counts.sharePct}%`],
      ['속자리', `${counts.inner}곳 (${counts.innerPct}%)`],
    ])}`, null, '02');

  const body = [open, line, how, tollBand(cfg, '문의', seed), docTopics(ctx, seed, '11', esc(at(hash(seed, 'dt'), SEC.topicHead, 8)), esc(at(hash(seed, 'dt'), SEC.topicSub, 3))), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 페이지의 테두리 분담을 어떤 자료로 어떻게 쟀는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="title1-s">지키는 선과 계산 절차</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (목적)', '이 약관은 힐펄스(아래 "회사")가 손님이 계신 곳으로 찾아가 제공하는 방문 관리에 관하여 이용 조건과 절차, 그리고 회사와 손님이 각각 지는 책임을 밝히는 것을 목적으로 합니다.'],
  ['제2조 (접수 경로)', '접수는 사이트에 적힌 번호로 걸어 주시는 통화로만 받습니다. 이 번호는 중계 번호이므로 손님 번호가 관리사 쪽으로 그대로 넘어가지 않습니다. 채팅, 게시판, 전자우편을 통한 접수는 처리하지 않습니다.'],
  ['제3조 (제공 범위)', '회사는 손님이 지정하신 장소로 관리사를 보내어 손으로 굳은 근육을 풀어 드립니다. 질병을 진단하거나 치료하는 행위는 하지 않으며 성적인 서비스 역시 제공하지 않습니다.'],
  ['제4조 (연령 제한)', '만 19세 이상인 분만 이용하실 수 있습니다. 연령이 미달인 경우에는 보호자가 동행하시더라도 접수를 받지 않습니다.'],
  ['제5조 (테두리 분담 정보의 성격)', '사이트에 적힌 맡은 길이, 몫, 겉자리·속자리 구분, 마주 보는 시군구는 공개된 행정동 경계를 선분 단위로 맞춰 계산한 값입니다. 도로 사정이나 실제 이동 시간을 보장하지 않으며, 어느 방향에서 들어가면 좋을지 가늠해 보시는 참고 자료입니다.'],
  ['제6조 (금액과 결제)', '금액은 가격표와 같으며 지역에 따라 달라지지 않습니다. 셈은 관리를 마친 현장에서 현금 또는 카드로 치릅니다. 예약금, 보증금과 같이 앞서 받는 돈은 어떤 명목으로도 두지 않습니다.'],
  ['제7조 (일정 변경·취소)', '관리사가 출발하기 전까지는 언제든 시간을 바꾸시거나 취소하실 수 있으며 위약금이 없습니다. 이미 문 앞에 도착한 뒤라면 그 사실만 즉시 알려 주시면 됩니다.'],
  ['제8조 (접수 거절과 중단)', '다음 중 어느 하나에 해당하는 경우 회사는 접수를 거절하거나 진행 중인 관리를 중단할 수 있습니다. 1. 성적인 서비스를 요청하시는 경우. 2. 관리사에게 거친 말이나 물리력을 행사하거나 사적인 연락처를 요구하시는 경우. 3. 방문 주소를 끝까지 알려 주지 않으시는 경우. 4. 발열이나 열린 상처가 있어 관리가 적절하지 않은 경우.'],
  ['제9조 (손님의 준비 사항)', '관리를 받으실 공간과 수건을 준비해 주시고, 진행에 영향을 줄 수 있는 건강 상태를 접수 통화에서 알려 주셔야 합니다. 붓기나 멍이 쉽게 생기는 체질이시라면 경락을 고르시기 전에 먼저 말씀해 주시기 바랍니다.'],
  ['제10조 (후기·평점 미운영)', '회사는 후기와 평점을 수집하지 않으며 화면에 게시하지도 않습니다. 이 사이트의 어떤 문장도 특정 손님의 경험을 옮긴 것이 아닙니다.'],
  ['제11조 (중단 시 금액 산정)', '손님의 요청이나 건강 상태로 중단한 경우에는 경과한 시간만큼만 산정합니다. 시작 후 10분이 지나지 않았다면 받지 않습니다. 제8조 제1호를 사유로 중단한 경우에는 중단 시점까지 산정합니다.'],
  ['제12조 (책임)', '관리 과정에서 회사의 과실로 발생한 손해는 회사가 배상합니다. 사전에 알려 주지 않으신 건강 상태에서 비롯된 손해, 천재지변이나 통신 장애로 인한 지연에 대해서는 책임을 지지 않습니다.'],
  ['제13조 (약관 변경)', '약관을 변경하는 경우 사이트에 먼저 게시하고 게시한 날부터 적용합니다. 변경 후에 접수하시면 바뀐 내용에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="intro"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 주신 시점에 아래 내용을 받아들이신 것으로 봅니다.</p></div>`,
    band('terms', 'terms', '전문', `<div class="rule">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    tollBand(cfg, '약관 문의', 'terms'),
    docTopics(ctx, 'terms', '11', esc(at(hash('terms', 'dt'), SEC.topicHead, 8)), esc(at(hash('terms', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 경로와 제공 범위, 금액과 결제, 변경과 취소를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="title1-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 수집 항목', '접수 통화에서 적어 두는 것은 네 가지입니다 — 찾아갈 주소, 연락이 닿는 번호, 고르신 코스, 원하시는 시각. 성명과 생년월일, 주민등록번호는 여쭙지도 적지도 않습니다.'],
  ['2. 이용 목적', '적어 둔 내용은 관리사를 배정하고 출발과 도착을 알려 드리는 데에만 씁니다. 이후 광고 문자를 보내거나 저희 쪽에서 먼저 연락드리지 않습니다.'],
  ['3. 번호 처리 방식', '화면의 번호는 중계되는 번호입니다. 그래서 손님 번호가 관리사 휴대전화에 그대로 표시되지 않습니다.'],
  ['4. 보유 기간', '방문이 문제없이 끝나면 그날 중으로 지웁니다. 분쟁이 있었던 건만 마무리될 때까지 따로 보관합니다.'],
  ['5. 제3자 제공·처리 위탁', '외부 사업자에게 제공하거나 위탁하지 않습니다. 법령에 근거한 수사기관의 적법한 요청이 있는 경우에만 예외로 둡니다.'],
  ['6. 자동 수집 장치', '이 사이트는 미리 만들어 둔 파일을 내보내기만 합니다. 로그인, 장바구니, 댓글이 없고 광고 추적이나 방문자 분석 스크립트를 넣지 않았으며 쿠키도 사용하지 않습니다.'],
  ['7. 손님의 권리', '보유 중인 내용의 열람이나 삭제를 요청하실 수 있습니다. 화면의 번호로 걸어 주시면 그 통화 중에 처리해 드립니다.'],
  ['8. 담당자 안내', '사업자 정보가 확정되면 이 항목과 화면 맨 아래에 함께 게시합니다. 그때까지는 사이트의 번호가 창구 역할을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="intro"><p>길지 않습니다. 애초에 적어 두는 항목이 네 가지뿐이기 때문입니다.</p></div>`,
    band('pp', 'privacy', '전문', `<div class="rule">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    tollBand(cfg, '개인정보 문의', 'privacy'),
    docTopics(ctx, 'privacy', '11', esc(at(hash('privacy', 'dt'), SEC.topicHead, 8)), esc(at(hash('privacy', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 받아 적는 항목과 이용 목적, 보유 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="title1-s">받아 적는 항목이 넷뿐입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 노트 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="intro"><p>부르시기 전에 알아 두면 통화가 짧아지는 것만 적어 둡니다. 소감이나 평점은 싣지 않습니다.</p></div>`,
    band('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="cards2">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS 로도 나갑니다.', '01'),
    tollBand(cfg, '접수', 'magazine'),
    docTopics(ctx, 'magazine', '11', esc(at(hash('magazine', 'dt'), SEC.topicHead, 8)), esc(at(hash('magazine', 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('테두리 노트'),
      desc: clampDesc(`부르시기 전에 정해 두면 편한 것들을 ${list.length}편으로 적어 두었습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `테두리 노트 <span class="title1-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '노트', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('테두리 노트'), desc: clampDesc(`부르시기 전에 정해 두면 편한 것들을 ${list.length}편으로 적어 두었습니다.`), listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '테두리 노트', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="when"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 테두리 노트</p>`,
    `<article class="essay">${html}</article>`,
    tollBand(cfg, '접수', p.slug),
    band('more', 'next', '함께 읽을 글',
      `<ul class="cards2">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    docTopics(ctx, p.slug, '11', esc(at(hash(p.slug, 'dt'), SEC.topicHead, 8)), esc(at(hash(p.slug, 'dt'), SEC.topicSub, 3))),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '노트', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="intro"><p>그 주소에 페이지가 없습니다. 주소가 옮겨졌거나 애초에 만들지 않은 자리입니다. 아래에서 다시 짚어 주십시오.</p></div>`,
    band('back', 'back', '여기서 다시',
      `<ul class="chips">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">가는 동네</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">가격표</a></li>
        <li><a href="/guide/">이용 안내</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    tollBand(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 페이지가 없습니다. 아래에서 다시 짚어 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
