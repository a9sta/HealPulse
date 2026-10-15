import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { band, callChip } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
/** 미터를 읽기 좋게 */
export const mTxt = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function tollBand(cfg, place, seedKey) {
  const h = hash(seedKey, 'tb');
  const lines = [
    `${place}까지만 말씀하셔도 괜찮습니다. 남은 주소는 저희가 되물어 가며 채웁니다.`,
    `${place}에 지금 나갈 수 있는지 통화하는 동안 바로 확인해 드립니다.`,
    `${place}까지 가는 데 필요한 것은 코스와 시각, 주소 셋뿐입니다.`,
    `${place} 접수를 받는 창구는 이 번호 하나입니다. 다른 입구를 만들지 않았습니다.`,
  ];
  return `<section class="toll" aria-label="${esc(place)} 예약 문의">
  <p class="toll-p">${esc(at(h, lines))}</p>
  ${callChip(cfg, { size: 'l' })}
  <p class="toll-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 = 타일 격자 ───────────────────────────────────────────
   ★★페이지마다 일곱 가지를 통째로 되풀이하면 그 덩어리가 본문에서 가장 커지고
     동 페이지끼리 겹침이 올라간다. 동·시군구 페이지에서는 **시드로 고른 셋만**
     보이고 나머지는 코스 페이지로 보낸다. 허브·시도에서만 전체를 편다. */
export function courseTiles(courses, seedKey, place, num = '01', { full = true } = {}) {
  const h = hash(seedKey, 'ct');
  const show = full ? courses : shuffle(courses.slice(), h).slice(0, 3);
  const withText = new Set(shuffle(show.map((c) => c.slug), h).slice(0, full ? 2 : 1));
  const list = show.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="t-n">${esc(c.ko)}</span>
      <span class="t-w">${won(c.price)}원</span>
      <span class="t-s">${c.min}분 · 세기 ${esc(c.pressure)} · ${c.oil ? '기름 씀' : '기름 안 씀'}</span>
    </a>
    ${withText.has(c.slug) ? `<p class="t-t">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  const short = [
    `${esc(place)}에도 일곱 가지를 그대로 들고 갑니다. 빠진 넷은 <a href="/course/">코스 페이지</a>에서, 금액은 <a href="/price/">가격표</a>에서 보십시오.`,
    `${esc(place)} 통화에서 가장 자주 나오는 셋입니다. <a href="/course/">일곱 가지 전체</a>와 <a href="/price/">금액만 모은 쪽</a>을 따로 두었습니다.`,
    `${esc(place)}에서도 고르실 수 있는 가짓수는 그대로입니다. <a href="/course/">빠진 넷</a>과 <a href="/price/">금액 전체</a>를 함께 걸어 두었습니다.`,
    `세기나 길이가 안 맞으시면 <a href="/course/">일곱 가지</a>를 펼쳐 보십시오. 지역이 달라도 <a href="/price/">쓰는 표는 하나</a>입니다.`,
  ];
  const tail = full
    ? `${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}`
    : at(h, short, 4);
  return band('course', 'courses', full ? `${esc(place)}까지 들고 가는 일곱 가지` : `${esc(place)}에서 많이 고르시는 셋`,
    `<ul class="tiles">\n${list}\n</ul>
     <p class="band-x">${tail}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepSet(seedKey) {
  return at(hash(seedKey, 'st'), STEP_SETS);
}
export function stepStair(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return band('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="stair">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factSheet(rows) {
  return `<table class="sheet"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'fq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = band('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="qlist">\n${qa.map((x) => `<div><span class="mk" aria-hidden="true">?</span><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return band('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="cares">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return band('longtail', label, heading, `<ul class="chips">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 롱테일 주제 묶음 ──────────────────────────────────────────
   ★★'다른 지역' 한 덩어리로만 링크를 걸면 코스 이름·금액 같은 말로 들어오는 길이
     없다. 주제별로 갈라 묶고 묶음마다 앵커 틀을 달리 둔다. */
export function topicLinks(groups, seedKey, num, heading, sub) {
  const h = hash(seedKey, 'tp');
  const body = groups.filter((g) => g.items && g.items.length).map((g, gi) => {
    const picked = (g.pick ? shuffle(g.items, hash(seedKey, 'tp', gi)) : g.items).slice(0, g.pick || g.items.length);
    const li = picked.map((p) => {
      const base = p.labels ? p.labels[parseInt(hash(seedKey, p.href).substr(0, 3), 16) % p.labels.length] : p.label;
      const tpl = g.anchor ? g.anchor[parseInt(hash(seedKey, g.label, base).substr(0, 3), 16) % g.anchor.length] : null;
      return `<li><a href="${p.href}">${esc(tpl ? tpl(base) : base)}</a></li>`;
    }).join('\n');
    return `<div>
      <p class="lane-h">${esc(g.label)}</p>
      <ul class="chips">\n${li}\n</ul>
    </div>`;
  }).join('\n');
  return band('topic', 'ways in', heading, `<div class="lanes">${body}</div>`,
    sub || esc(at(h, SEC.ltSub, 6)), num);
}

/** 코스 묶음 — 시도별 코스 페이지로 가는 롱테일. */
export function courseTopic(sd, courses) {
  return courses.map((c) => ({ label: `${sd.name} ${c.ko}`, href: `/${sd.slug}/course/${c.slug}/` }));
}

/* ── 테두리를 나눠 맡은 이웃 ───────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리가 아니라 **맡은 길이**로
     줄을 세운다. 속자리는 뒤로 밀린다. */
export function rimKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const sorted = pool.slice().sort((a, b) => b.rim - a.rim || a.name.localeCompare(b.name, 'ko'));
  const pick = sorted.slice(0, 8);
  return band('kin', 'rim share', `${esc(g.name)} 테두리를 함께 나눠 맡은 자리`,
    `<ul class="grid3">\n${pick.map((x) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="g-n">${esc(x.name)}</span><span class="g-s">${x.inner ? '속자리' : `${mTxt(x.rim)} · ${x.share}%`}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'rk'), SEC.kinSub)), num);
}

/* ── 시군구 안의 자리 목록 ──────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="here"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="g-n">${esc(s.name)}</span><span class="g-s">${s.inner ? '속자리' : mTxt(s.rim)}</span></a></li>`).join('\n');
  return band('spotidx', 'places', `${esc(g.name)}에서 페이지를 낸 ${g.spotCount}자리`,
    `<ul class="grid3">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 페이지를 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return band('rural', 'rural', `${esc(g.name)}에 든 ${esc(label)}자리`,
    `<ul class="bare">\n${g.rural.map((m) => `<li>${esc(m.name)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return band('dongidx', 'dong', `${esc(g.name)}에 속한 동 ${g.dongNames.length}자리`,
    `<ul class="bare">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num, { pick = 0 } = {}) {
  /* ★★동 페이지에서 시군구를 통째로 되풀이하면(경기는 47곳) 그 목록이 본문에서
     가장 큰 덩어리가 되어 동 페이지끼리 겹침이 크게 올라간다. 깊이 들어온 쪽에서는
     시드로 고른 일부만 걸고 나머지는 시도 페이지로 보낸다. */
  let list = sd.gu;
  if (pick && sd.gu.length > pick) {
    const keep = new Set(shuffle(sd.gu.map((g) => g.slug), hash(seedKey, 'gi')).slice(0, pick));
    if (currentSlug) keep.add(currentSlug);
    list = sd.gu.filter((g) => keep.has(g.slug));
  }
  const items = list.map((g) => `<li${g.slug === currentSlug ? ' class="here"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="g-n">${esc(g.name)}</span><span class="g-s">${mTxt(g.rimTotal)}</span></a></li>`).join('\n');
  const partial = list.length < sd.gu.length;
  return band('guidx', 'districts', partial ? `${esc(sd.name)} 시군구 가운데 ${list.length}곳` : `${esc(sd.name)} 아래 시군구 ${sd.gu.length}곳`,
    `<ul class="grid3">\n${items}\n</ul>${partial ? `\n<p class="band-x">${esc(sd.name)}에 있는 시군구는 모두 ${sd.gu.length}곳입니다. <a href="/${sd.slug}/">${esc(sd.name)} 한 장</a>에서 전부 보실 수 있습니다.</p>` : ''}`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 테두리를 맞댄 시군구 (길을 거는 용도) ──────────────────── */
export function nearList(sd, g, seedKey, num) {
  if (!g.nearCount) return '';
  const items = g.near.slice(0, 12).map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="g-n">${esc(t.gu)}</span><span class="g-s">${mTxt(t.m)}${t.same ? '' : ' · 시도 밖'}</span></a></li>`).join('\n');
  return band('near', 'facing', `${esc(g.name)}${josa(g.name, '과/와')} 선을 맞댄 시군구 ${g.nearCount}곳`,
    `<ul class="grid3">\n${items}\n</ul>`,
    `맞댄 길이가 긴 차례입니다. 경계에 바짝 붙은 주소라면 길게 맞댄 쪽에서 넘어오는 편이 빠를 때가 있습니다.`, num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 페이지용) ─────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return band('also', 'more', '이어서 볼 곳',
    `<ul class="chips">
      <li><a href="/area/">가는 동네 전부</a></li>
      <li><a href="/guide/">이용 안내</a></li>
      <li><a href="/price/">가격표</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">노트</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도 아래 시군구가 놓이고 수도권과 부산에만 동이 한 겹 더 붙습니다. 읍·면과 나머지 지역의 동은 이름으로만 목록에 올라 있습니다.');
}

/** 문서·글 페이지에 다는 주제 묶음. 지역 목록 대신 찾는 말로 갈라 건다. */
export function docTopics(ctx, seedKey, num, heading, sub) {
  const { regions, courses } = ctx;
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  return topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 12, anchor: COURSE_ANCHOR },
    { label: '시군구로', items: guList, pick: 14, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seedKey, num, heading, sub);
}
