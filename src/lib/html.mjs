import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { RIMLOGO } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **callChip() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 * ★제목과 덩어리 왼쪽에는 굵은 세로 막대를 세운다. 순번은 오른쪽 끝으로 민다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#8C2146">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/hpl.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="jump" href="#main">본문 먼저 보기</a>
${header(ctx, path)}
${crumbs.length > 1 ? pathHtml(crumbs) : ''}
<main id="main">
<h1 class="title1">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${stickyBar(cfg)}
<script src="/assets/hpl.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 둥근 자줏빛 알약이지만 `<a href="tel:">` 이다.
   size: s(머리) · m(본문) · l(대문·아래 줄) */
export function callChip(cfg, { size = 'm', bar = false } = {}) {
  return `<a class="chip chip-${size}${bar ? ' chip-b' : ''}" href="tel:${cfg.telRaw}">
  <span class="chip-i" aria-hidden="true"></span>
  <span class="chip-t"><span class="chip-k">${esc(cfg.telLabel)}</span><span class="chip-v">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리 — 흰 띠 두 줄. 현재 자리는 아래 선으로 표시한다. */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '가는 동네'], ['/course/', '코스'], ['/price/', '가격표'], ['/guide/', '이용 안내'], ['/magazine/', '노트']];
  return `<header>
  <div class="crown">
    <div class="crown-in">
      <a class="mark" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">
        ${RIMLOGO()}<span class="mark-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
      </a>
      <div class="crown-r">
        <p class="crown-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
        ${callChip(cfg, { size: 's' })}
      </div>
    </div>
  </div>
  <nav class="lane" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
</header>`;
}

function pathHtml(crumbs) {
  return `<nav class="path" aria-label="여기까지 온 길"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="foot2">
  <div class="foot2-in">
    <section>
      <p class="f-nm">${esc(cfg.brand.ko)}</p>
      <p class="f-say">오실 가게가 없습니다. 걸어 주시면 관리사가 그 주소로 찾아갑니다. 페이지를 가진 겹은 시군구 ${counts.gu}곳과 동 ${counts.spot}자리, 들어오는 창구는 아래 번호 하나입니다.</p>
      ${callChip(cfg, { size: 'm' })}
      <p class="f-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="f-h">동 한 자리까지</p>
      <ul class="chips">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="f-h" style="margin-top:15px">시군구 선까지</p>
      <ul class="chips">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="f-sm"><a href="/area/">가는 동네를 한 장에 펼치기</a> · 읍·면 ${counts.rural}자리는 이름만 적었습니다</p>
    </nav>
    <div>
      <p class="f-h">문서</p>
      <ul class="f-ul">
        <li><a href="/guide/">이용 안내</a></li>
        <li><a href="/price/">가격표</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="f-h" style="margin-top:17px">최근 노트</p>
      <ul class="f-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="f-h" style="margin-top:17px">긁어 가는 길</p>
      <ul class="chips"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="f-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="foot2-end"><div>
    ${biz ? `<p class="f-biz">${biz}</p>` : '<p class="f-biz f-pale">사업자 정보는 정해지는 대로 이 줄에 올립니다.</p>'}
    <p class="f-ai">지역 페이지에 적힌 테두리 길이와 몫은 공개된 행정동 경계를 선분 단위로 맞춰 기계로 센 값이며, 문장은 <strong>AI 도구로 초벌을 쓰고</strong> 사람이 고쳐 올렸습니다. 후기·체험담·별점을 모으지도 싣지도 않고 인물 사진을 쓰지 않습니다. 밑자료: ${esc(data.source)}</p>
    <p class="f-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 병을 고치는 의료 행위가 아니고 성적인 서비스를 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 줄 */
function stickyBar(cfg) {
  return `<div class="sticky">
  ${callChip(cfg, { size: 'l', bar: true })}
  <span class="sticky-s">도착 ${esc(cfg.arrive)}</span>
</div>`;
}

/**
 * 칸 틀 — 왼쪽 세로 막대. 순번은 제목 오른쪽 끝에 붙는다.
 */
export function band(id, label, h2, inner, sub, n) {
  return `<section class="band" id="${id}" aria-labelledby="${id}-h">
  <header class="band-h">
    <h2 id="${id}-h">${h2}</h2>
    <span class="band-no" aria-hidden="true" data-eyebrow="${esc(label)}${n ? ` ${n}` : ''}"></span>
    ${sub ? `<p class="band-s">${sub}</p>` : ''}
  </header>
  <div class="band-b">${inner}</div>
</section>`;
}
