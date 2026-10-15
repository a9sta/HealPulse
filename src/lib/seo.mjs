/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 열세 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *     어반오아시스 `{동} 출장마사지 홈타이 / {구} {코스어} {행동어} · 어반오아시스`
 *     솔레이스바디 `{동} 출장마사지 홈타이 : {구} {코스어} {행동어} | 솔레이스바디`
 *     레스토라럭스 `{동} 출장마사지 | {구} 홈타이 {코스어} {행동어} · 레스토라럭스`
 *     리쥬베나     `{동} 출장마사지 홈타이 · {코스어} · {구} {행동어} 리쥬베나`
 *     바이탈리티럽 `{동} {코스어} 출장마사지 홈타이 — {구} {행동어} — 바이탈리티럽`
 *   ★**구 이름을 대괄호로 감싸 맨 앞에 두는** 모양은 여기서 처음 쓴다. 괄호를 쓴
 *     곳은 바이탈리즈 하나인데 그쪽은 둥근 괄호를 가운데에 썼다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다. 가운데 토막은 그 자리에서만 나오는 계산값
 *   (맡은 길이, 몫, 겉자리·속자리, 마주 보는 시군구)으로 채워 전부 달라지게 한다.
 */
import { hash, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const mT = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);

export const BRAND = '힐펄스';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 일곱 가지에서만 돌린다. */
const COURSE_WORD = ['아로마', '스웨디시', '경락', '림프', '타이', '두피', '발반사'];
/** 제목 꼬리 행동어 */
const ACT = ['바로 접수', '밤에도 방문', '시간 맞춰', '오늘 가능', '금액 안내'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} · 서울 인천 경기 부산 동네 방문 · 24시 후불 접수`,
  areaHub: (c) => `${KEY} 가는 동네 · 동 ${c.spot}자리 시군구 ${c.gu}곳 전체 | ${BRAND}`,
  sido: (sd) => `[${sd.name}] ${KEY} · ${sd.main ? `동 ${sd.spotCount}자리` : `시군구 ${sd.gu.length}곳`} ${at(hash(sd.name, 'sdt'), ACT)} | ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}자리` : g.main ? `읍면 ${g.ruralCount}자리` : `행정동 ${g.dongCount}자리`;
    return `[${g.name}] ${KEY} · ${sd.name} ${unit} ${at(h, ACT, 0)} | ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `[${g.name}] ${s.name} ${KEY} · ${at(h, COURSE_WORD, 0)} ${at(h, ACT, 1)} | ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} · ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 세기 ${c.pressure} | ${BRAND}`,
  sidoCourse: (sd, c) => `[${sd.name}] ${c.ko} ${KEY} · ${sd.name} 방문 ${at(hash(sd.name, c.slug), ACT)} | ${BRAND}`,
  page: (t) => `${t} | ${BRAND} ${KEY}`,
  post: (p) => `${p.title} | ${BRAND} 테두리 노트`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 테두리 분담에서 나온 값으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => (s.inner ? `사방이 ${g.name} 안쪽으로만 둘러싸인 속자리입니다` : `${g.name} 바깥 테두리 가운데 ${mT(s.rim)}를 맡습니다`),
    () => (s.inner ? `${g.name} 테두리에 한 뼘도 닿지 않는 자리입니다` : `시군구 테두리에서 차지하는 몫이 ${s.share}%입니다`),
    () => `둘레 ${mT(s.perim)} 가운데 ${s.rimPct}%가 바깥을 봅니다`,
    () => (s.faceNames.length ? `테두리 건너로 ${s.faceNames[0].gu}${josa(s.faceNames[0].gu, '을/를')} ${mT(s.faceNames[0].m)} 마주 봅니다` : `건너에 마주 볼 시군구가 없는 안쪽 땅입니다`),
    () => `${g.name}에서 테두리를 맡은 길이로 ${s.guRimRank}번째입니다`,
    () => `땅 ${km2(s.area)}에 둘레 ${mT(s.perim)}, 바깥을 보는 몫 ${s.rimPct}%입니다`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '금액은 마치고 치릅니다',
  '선입금을 받지 않습니다',
  '거리로 가격표를 고치지 않습니다',
  '한밤에도 같은 금액입니다',
  '셈은 끝나고 한 번뿐입니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 시군구 테두리를 동네마다 얼마나 맡았는지 재 두었습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이로 나가는 동 ${c.spot}자리와 시군구 ${c.gu}곳. 자리마다 맡은 테두리 길이를 적었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}자리에 페이지가 있고 속자리가 ${sd.innerSum}곳입니다.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이고 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `바깥 테두리 ${mT(g.rimTotal)}를 동 ${g.spotCount}자리가 나눠 맡습니다`,
        `테두리를 가장 길게 맡은 자리는 ${g.rimSpot}${josa(g.rimSpot, '으로/로')} ${g.rimSpotShare}%입니다`,
        g.innerCount ? `바깥에 닿지 않는 속자리가 ${g.innerCount}곳 있습니다` : `모든 자리가 바깥 테두리에 조금씩 닿아 있습니다`,
        `테두리 건너로 ${g.nearCount}곳을 마주 봅니다`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}자리가 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}자리와 면 ${g.myeonCount}자리를 이름으로 올렸습니다`,
          `땅 ${km2(g.area)}에 바깥 테두리가 ${mT(g.rimTotal)}입니다`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}자리가 들어 있고 테두리는 ${mT(g.rimTotal)}입니다`,
          `테두리 건너로 ${g.nearCount}곳과 맞닿은 ${km2(g.area)}짜리 땅입니다`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}자리 모두 나갑니다` : `동 ${g.dongNames.length}자리 어디나 한 번호로`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역을 가리지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.focus}${josa(c.focus, '을/를')} 오래 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
