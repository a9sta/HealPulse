import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **왼쪽 세로 굵은 선**이다. 제목과 글 덩어리 왼쪽에 굵은 자줏빛 막대를
 *   세우고 순번은 오른쪽 끝으로 민다. 테두리를 맡는다는 이 사이트의 값과 같은 꼴이다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *     솔레이스바디 비스듬히 잘린 귀퉁이 · 각진 타일 · 상아+청록
 *     레스토라럭스 가는 겹줄 액자 · 어두운 남보라 바탕 · 남보라+황동
 *     리쥬베나     덩어리 없음 · 흰 바탕 · 굵은 풀빛 밑줄
 *     바이탈리티럽 18도 기울여 자른 머리표 · 짙은 청록 바탕+호박
 *   ★여기는 **왼쪽 세로 막대**다. 밑줄도 액자도 기울임도 쓰지 않는다.
 *     바탕은 아주 밝은 회백이고 강조는 자주, 보조는 짙은 청록이다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#F4F5F7', card: '#FFFFFF', soft: '#EDEFF3',
  ink: '#1A1C22', dim: '#5B6070',
  acc: '#8C2146', accDk: '#6A1735', accSoft: '#F6E7ED',
  line: '#DCE0E7', teal: '#2F6F5E',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--teal:${t.teal};
  --w:1020px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.86;font-size:16.5px;letter-spacing:-.006em;padding-bottom:84px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--acc);font-weight:700}
.jump{position:absolute;left:-9999px}
.jump:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#fff;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.crown{background:var(--card);border-bottom:1px solid var(--line)}
.crown-in{max-width:var(--w);margin:0 auto;padding:17px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.mark{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.mark:hover{text-decoration:none}
.pmk{width:30px;height:30px;flex:none}
.mark-t b{display:block;font-size:19.5px;font-weight:800;letter-spacing:-.034em;line-height:1.12}
.mark-t i{display:block;font-style:normal;font-family:var(--mono);font-size:9.5px;letter-spacing:.22em;color:var(--teal)}
.crown-r{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.crown-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.crown-run span{display:block}
.lane{background:var(--card);border-bottom:1px solid var(--line)}
.lane ul{max-width:var(--w);margin:0 auto;padding:0 20px;list-style:none;display:flex;gap:26px;overflow-x:auto}
.lane a{display:block;padding:11px 0;font-size:13.5px;font-weight:700;color:var(--dim);white-space:nowrap;border-left:0}
.lane a:hover{color:var(--ink);text-decoration:none}
.lane a[aria-current]{color:var(--acc);box-shadow:inset 0 -3px 0 var(--acc)}

/* ── 지나온 길 ─────────────────────────────────────── */
.path{max-width:var(--w);margin:0 auto;padding:14px 20px 0}
.path ol{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.path li+li::before{content:"›";margin-right:8px;color:var(--line)}
.path a{color:var(--dim)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:22px 20px 62px}
.title1{font-size:26.5px;font-weight:800;letter-spacing:-.04em;line-height:1.26;margin:16px 0 22px;
  padding-left:18px;border-left:9px solid var(--acc)}
@media (min-width:720px){.title1{font-size:35px;padding-left:22px}}
.title1-s{display:block;margin-top:11px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.008em}
.intro{margin:0 0 34px;max-width:52rem;font-size:17px}
.intro p{margin:0 0 .95em}
.intro p:last-child{margin-bottom:0}

/* ── 칸 = 왼쪽 세로 막대 ──────────────────────────── */
.band{margin:0 0 34px;padding-left:18px;border-left:4px solid var(--line)}
.band:hover{border-left-color:var(--accSoft)}
.band-h{margin:0 0 17px;display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap}
.band h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.032em;line-height:1.36;flex:1 1 15em}
@media (min-width:720px){.band h2{font-size:23px}}
.band-no{font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--teal);white-space:nowrap;text-align:right}
.band-no::before{content:attr(data-eyebrow)}
.band-s{margin:0;flex:1 1 100%;font-size:14px;color:var(--dim)}
.band-x{margin:17px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 장부 ──────────────────────────────────────────── */
.sheet{width:100%;border-collapse:collapse;font-size:15px;background:var(--card)}
.sheet th,.sheet td{padding:11px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.sheet th{width:44%;font-weight:700;color:var(--teal);font-size:12.5px;background:var(--soft)}
@media (min-width:600px){.sheet th{width:28%}}

/* ── 코스 = 세 칸 타일 ─────────────────────────────── */
.tiles{list-style:none;margin:0;padding:0;display:grid;gap:12px}
@media (min-width:620px){.tiles{grid-template-columns:1fr 1fr}}
@media (min-width:920px){.tiles{grid-template-columns:1fr 1fr 1fr}}
.tiles li{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--acc);padding:15px 16px}
.tiles a{display:block;color:var(--ink)}
.tiles a:hover{text-decoration:none}
.t-n{display:block;font-size:17px;font-weight:800;letter-spacing:-.028em}
.tiles a:hover .t-n{color:var(--acc)}
.t-w{display:block;margin-top:5px;font-family:var(--mono);font-size:16px;color:var(--acc);font-weight:700}
.t-s{display:block;margin-top:5px;font-size:12px;color:var(--dim)}
.t-t{margin:10px 0 0;font-size:13px;color:var(--dim);border-top:1px dashed var(--line);padding-top:9px}

/* ── 접수 = 세로 계단 ──────────────────────────────── */
.stair{list-style:none;margin:0;padding:0;counter-reset:sr}
.stair li{position:relative;padding:13px 0 13px 52px;border-bottom:1px solid var(--line)}
.stair li:last-child{border-bottom:0}
.stair li:nth-child(2){padding-left:62px}
.stair li:nth-child(3){padding-left:72px}
.stair li:nth-child(4){padding-left:82px}
.stair li:nth-child(5){padding-left:92px}
@media (max-width:620px){.stair li,.stair li:nth-child(2),.stair li:nth-child(3),.stair li:nth-child(4),.stair li:nth-child(5){padding-left:46px}}
.stair li::before{content:counter(sr);counter-increment:sr;position:absolute;left:0;top:14px;
  width:30px;height:30px;line-height:30px;text-align:center;background:var(--acc);color:#fff;
  font-family:var(--mono);font-size:13px;font-weight:700}
.stair li:nth-child(2)::before{left:10px}
.stair li:nth-child(3)::before{left:20px}
.stair li:nth-child(4)::before{left:30px}
.stair li:nth-child(5)::before{left:40px}
@media (max-width:620px){.stair li::before,.stair li:nth-child(2)::before,.stair li:nth-child(3)::before,.stair li:nth-child(4)::before,.stair li:nth-child(5)::before{left:0}}
.stair h3{margin:0 0 4px;font-size:15.5px;font-weight:800}
.stair p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.qlist{margin:0}
.qlist>div{position:relative;padding:16px 0 16px 42px;border-bottom:1px solid var(--line)}
.qlist>div:last-child{border-bottom:0}
.qlist .mk{position:absolute;left:0;top:18px;font-family:var(--mono);font-size:21px;font-weight:700;color:var(--accSoft)}
.qlist h3{margin:0 0 7px;font-size:16.5px;font-weight:800;letter-spacing:-.025em}
.qlist p{margin:0;font-size:15px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.cares{list-style:none;margin:0;padding:0}
.cares li{padding:11px 0 11px 20px;font-size:14.5px;color:var(--dim);border-bottom:1px solid var(--line);
  position:relative}
.cares li:last-child{border-bottom:0}
.cares li::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accSoft)}

/* ── 목록·링크 ─────────────────────────────────────── */
.chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.chips a{display:inline-block;font-size:13.5px;color:var(--ink);background:var(--card);
  border:1px solid var(--line);padding:5px 12px;border-radius:14px}
.chips a:hover{border-color:var(--acc);color:var(--acc);text-decoration:none}
.grid3{list-style:none;margin:0;padding:0;display:grid;gap:0;background:var(--card);border:1px solid var(--line)}
@media (min-width:560px){.grid3{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.grid3{grid-template-columns:1fr 1fr 1fr}}
.grid3 li{border-bottom:1px solid var(--line)}
.grid3 a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;padding:10px 12px;color:var(--ink)}
.grid3 a:hover{text-decoration:none;color:var(--acc);background:var(--soft)}
.grid3 .here a,.grid3 a[aria-current]{background:var(--accSoft);font-weight:700}
.g-n{font-weight:600;font-size:14.5px}
.g-s{font-family:var(--mono);font-size:10.5px;color:var(--dim);white-space:nowrap}
.bare{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 15px}
.bare li{font-size:13.5px;color:var(--dim)}

/* ── 견주기 ────────────────────────────────────────── */
.table2{width:100%;border-collapse:collapse;font-size:14.5px;background:var(--card)}
.table2 th,.table2 td{padding:11px 10px;text-align:left;border-bottom:1px solid var(--line)}
.table2 thead th{font-size:12px;color:#fff;background:var(--acc);font-weight:700}
.table2 tbody th{font-weight:700}
.table2 tbody tr.pick th,.table2 tbody tr.pick td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.chip{display:inline-flex;align-items:center;gap:12px;background:var(--acc);color:#fff;
  padding:11px 22px;text-decoration:none;border-radius:26px}
.chip:hover{background:var(--accDk);text-decoration:none}
.chip-i{flex:none;display:block;width:11px;height:11px;border-radius:50%;background:#fff}
.chip-t{display:flex;flex-direction:column;line-height:1.24;min-width:0}
.chip-k{font-size:9.5px;letter-spacing:.22em;font-family:var(--mono);opacity:.9}
.chip-v{font-family:var(--mono);font-weight:700;white-space:nowrap}
.chip-s .chip-v{font-size:15px}
.chip-m .chip-v{font-size:18px}
.chip-l .chip-v{font-size:21px}
.chip-l{padding:13px 26px}
.chip-b{display:flex;width:100%;justify-content:center}
.toll{background:var(--card);border:1px solid var(--line);border-left:9px solid var(--acc);
  padding:22px 22px;margin:0 0 34px}
.toll-p{margin:0 0 15px;font-size:16px;max-width:47rem}
.toll-s{margin:13px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.open{padding:6px 0 32px;margin:0 0 34px;border-bottom:1px solid var(--line)}
.open-sl{margin:0 0 15px;font-size:23px;font-weight:800;letter-spacing:-.04em;max-width:21em;line-height:1.36;
  padding-left:18px;border-left:9px solid var(--teal)}
@media (min-width:720px){.open-sl{font-size:30px}}
.open-p{margin:0 0 23px;color:var(--dim);font-size:16px;max-width:45rem}
.open-f{display:grid;gap:10px;margin:24px 0 0}
@media (min-width:640px){.open-f{grid-template-columns:repeat(4,1fr)}}
.open-f div{background:var(--card);border:1px solid var(--line);padding:12px 14px}
.open-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--acc)}
.open-f dd{margin:4px 0 0;font-size:12.5px;color:var(--dim)}

/* ── 지역 고르기 = 펼침 나무 ───────────────────────
   ★이름을 두 칸으로 늘어놓지 않는다. 시도를 접어 두고 누르면 그 아래 시군구가
     테두리 길이와 함께 펼쳐진다. 스크립트 없이 details 로만 움직인다. */
.tree{margin:0}
.tree details{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--line);margin-bottom:8px}
.tree details[open]{border-left-color:var(--acc)}
.tree summary{list-style:none;cursor:pointer;padding:13px 16px;display:flex;align-items:baseline;
  justify-content:space-between;gap:12px;flex-wrap:wrap}
.tree summary::-webkit-details-marker{display:none}
.tree summary::before{content:"+";font-family:var(--mono);font-weight:700;color:var(--acc);margin-right:9px}
.tree details[open] summary::before{content:"−"}
.tree summary b{font-size:17px;font-weight:800;letter-spacing:-.03em}
.tree summary .sum{font-family:var(--mono);font-size:11px;color:var(--dim)}
.tree .kids{list-style:none;margin:0;padding:0 16px 14px;display:grid;gap:0}
@media (min-width:620px){.tree .kids{grid-template-columns:1fr 1fr}}
@media (min-width:920px){.tree .kids{grid-template-columns:1fr 1fr 1fr}}
.tree .kids li{border-top:1px solid var(--line)}
.tree .kids a{display:flex;justify-content:space-between;gap:8px;padding:8px 0;color:var(--ink);font-size:14px}
.tree .kids a:hover{color:var(--acc);text-decoration:none}
.tree .kids span{font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.tree .go{display:block;padding:0 16px 14px;font-size:13px}
.tree-key{margin:16px 0 0;font-size:13px;color:var(--dim);border-top:1px solid var(--line);padding-top:13px}

/* ── 주제 묶음 링크 ────────────────────────────────── */
.lanes{display:grid;gap:22px}
@media (min-width:720px){.lanes{grid-template-columns:1fr 1fr}}
.lane-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--teal);
  padding-left:9px;border-left:3px solid var(--accSoft)}

/* ── 글 ────────────────────────────────────────────── */
.essay{max-width:45rem;font-size:17px}
.essay h2{margin:32px 0 13px;font-size:19px;font-weight:800;padding-left:14px;border-left:6px solid var(--acc)}
.essay p{margin:0 0 1.05em}
.essay ul{margin:0 0 1.05em;padding-left:1.1em;color:var(--dim)}
.cards2{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:680px){.cards2{grid-template-columns:1fr 1fr}}
.cards2 li{background:var(--card);border:1px solid var(--line)}
.cards2 a{display:block;padding:15px 16px;color:var(--ink)}
.cards2 a:hover{text-decoration:none}
.cards2 b{display:block;font-size:16.5px;font-weight:800;margin-bottom:6px}
.cards2 a:hover b{color:var(--acc)}
.cards2 p{margin:0;font-size:13.5px;color:var(--dim)}
.cards2 time{display:block;margin-top:8px;font-family:var(--mono);font-size:10.5px;color:var(--teal)}
.rule h2{margin:26px 0 9px;font-size:16.5px;font-weight:800;padding-left:12px;border-left:5px solid var(--accSoft)}
.rule p,.rule li{font-size:15px;color:var(--dim)}
.when{margin:0 0 17px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.foot2{background:var(--card);border-top:4px solid var(--acc);margin-top:26px}
.foot2-in{max-width:var(--w);margin:0 auto;padding:30px 20px 22px;display:grid;gap:26px}
@media (min-width:860px){.foot2-in{grid-template-columns:1.3fr 1fr 1fr}}
.f-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.22em;color:var(--teal)}
.f-nm{margin:0 0 8px;font-size:19px;font-weight:800;letter-spacing:-.025em}
.f-say{margin:0 0 14px;font-size:14px;color:var(--dim)}
.f-run{margin:12px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.f-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:14px}
.f-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.f-sm{margin:10px 0 0;font-size:12px;color:var(--dim)}
.foot2-end div{max-width:var(--w);margin:0 auto;padding:0 20px 24px;border-top:1px solid var(--line);padding-top:18px}
.f-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.f-pale{opacity:.7}
.f-ai{margin:0 0 8px;font-size:12px;color:var(--dim);line-height:1.72}
.f-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.sticky{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:3px solid var(--acc);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;transition:transform .2s}
.sticky.hid{transform:translateY(130%)}
.sticky-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.sticky{display:none}}
@media print{.sticky,.lane,.toll{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.sticky'),ft=document.querySelector('.foot2');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('hid',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 네모 테두리 한 변만 굵게 — 테두리를 나눠 맡는다는 뜻 그대로 */
const RIMMARK = (a, b) => `<rect x="5" y="5" width="22" height="22" fill="none" stroke="${b}" stroke-width="2"/>
<path d="M5 5h22" stroke="${a}" stroke-width="5" stroke-linecap="square"/>
<path d="M27 5v11" stroke="${a}" stroke-width="5" stroke-linecap="square"/>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${t.card}"/>${RIMMARK(t.acc, t.teal)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 48"><rect width="250" height="48" fill="${t.card}"/><g transform="translate(8,8)">${RIMMARK(t.acc, t.teal)}</g><text x="48" y="26" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">힐펄스</text><text x="48" y="38" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.teal}">HEALPULSE</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<rect x="0" y="0" width="22" height="630" fill="${t.acc}"/>
<g transform="translate(92,74) scale(3)">${RIMMARK(t.acc, t.teal)}</g>
<text x="96" y="318" font-family="system-ui,sans-serif" font-size="50" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="96" y="380" font-family="system-ui,sans-serif" font-size="25" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="96" y="428" font-family="ui-monospace,monospace" font-size="20" fill="${t.teal}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="96" y="466" width="400" height="70" rx="35" fill="${t.acc}"/>
<text x="130" y="494" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="${t.accSoft}">${cfg.telLabel}</text>
<text x="130" y="524" font-family="ui-monospace,monospace" font-size="26" font-weight="700" fill="#FFFFFF">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'hpl.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'hpl.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const RIMLOGO = (t = THEME) => `<svg class="pmk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${RIMMARK(t.acc, t.teal)}</svg>`;
