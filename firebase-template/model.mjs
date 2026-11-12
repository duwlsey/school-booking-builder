export function normalizeConfig(c) {
  const out=structuredClone(c);
  if(!out.title?.trim()||!out.organization?.trim()||!out.slots?.length)throw Error('학교 이름과 예약 일정을 입력하세요.');
  if(out.open>=out.close)throw Error('신청 마감은 시작보다 뒤여야 합니다.');
  if(out.priorityUntil!=null&&!(out.open<out.priorityUntil&&out.priorityUntil<out.close))throw Error('일반 신청 시작은 신청 시작과 마감 사이로 정해 주세요.');
  out.bookingLeadDays ??= 0;
  if(!Number.isInteger(out.bookingLeadDays)||out.bookingLeadDays<0||out.bookingLeadDays>365)throw Error('최소 신청 일수를 0~365 사이의 정수로 입력해 주세요.');
  bookingLeadWindow(out);
  const slots=[...out.slots].sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  const keys=new Set();
  for(let i=0;i<slots.length;i++){
    const s=slots[i],key=[s.date,s.start,s.end].join('|');
    if(keys.has(key))throw Error('중복 회차가 있습니다.');keys.add(key);
    if(out.mode!=='date'&&(!s.start||s.start>=s.end))throw Error('회차 시간을 확인하세요.');
    if(i&&s.date===slots[i-1].date&&(out.mode==='date'||s.start<slots[i-1].end))throw Error('겹치는 회차가 있습니다. 중복 재고 계산을 막기 위해 시간을 겹치지 않게 정리하세요.');
    if(!Number.isInteger(s.capacity)||s.capacity<1)throw Error('회차 정원을 확인하세요.');
  }
  out.slots=slots;return out;
}
export function resourceSeed(c) {
  const all=[];
  c.slots.forEach((s,index)=>{
    const start=s.start||'00:00',end=s.end||'23:59',begin=Date.parse(s.date+'T'+start+':00+09:00'),finish=Date.parse(s.date+'T'+end+':00+09:00');
    const items=c.kind==='rental'?c.items:[''];
    items.forEach((item,j)=>all.push({id:'s'+index+'i'+j,slotKey:[s.date,s.start||'',s.end||''].join('|'),label:s.label||'',date:s.date,start:s.start||'',end:s.end||'',item,kind:c.kind,capacity:c.kind==='rental'?c.itemStock[item]:s.capacity,used:0,closed:!!s.closed,beginAt:begin,endAt:finish,cancelBefore:begin-c.cancelHours*3600000,lastBooking:''}));
  });return all;
}
const dayMillis = 86400000;
const koreaOffsetMillis = 32400000;
export function koreanMidnight(now) {
  return Math.floor((now + koreaOffsetMillis) / dayMillis) * dayMillis - koreaOffsetMillis;
}
export function earliestBookingTime(days, now = Date.now()) {
  return koreanMidnight(now) + days * dayMillis;
}
export function bookingLeadWindow(config) {
  const { bookingLeadDays, bookingLeadStart, bookingLeadEnd } = config;
  if (!bookingLeadDays || (!bookingLeadStart && !bookingLeadEnd)) return {bookingLeadStartAt:null,bookingLeadEndAt:null};
  const bookingLeadStartAt=Date.parse(bookingLeadStart+'+09:00');
  const bookingLeadEndAt=Date.parse(bookingLeadEnd+'+09:00');
  if (!Number.isFinite(bookingLeadStartAt) || !Number.isFinite(bookingLeadEndAt) || bookingLeadStartAt>=bookingLeadEndAt) {
    throw Error('신청일 제한의 시작과 종료 시각을 순서대로 입력해 주세요.');
  }
  return {bookingLeadStartAt,bookingLeadEndAt};
}
export function activeBookingLeadDays(settings, now=Date.now()) {
  if (settings.bookingLeadStartAt!=null && now<settings.bookingLeadStartAt) return 0;
  if (settings.bookingLeadEndAt!=null && now>=settings.bookingLeadEndAt) return 0;
  return settings.config?.bookingLeadDays||0;
}
export function availability(pool,settings,now=Date.now()) {
  if(settings.paused||pool.closed)return '중지';
  if(now<settings.opensAt)return '신청 시작 전';
  if(now>=settings.closesAt||now>=pool.beginAt||pool.used>=pool.capacity)return '마감';
  const leadDays=activeBookingLeadDays(settings,now);
  if(leadDays>0&&pool.beginAt<earliestBookingTime(leadDays,now))return '신청 제한';
  return '가능';
}
export function claim(pool,quantity){if(!Number.isInteger(quantity)||quantity<1||quantity>pool.capacity-pool.used)throw Error('남은 정원·수량이 부족합니다.');return pool.used+quantity}
export function release(pool,quantity){if(!Number.isInteger(quantity)||quantity<1||quantity>pool.used)throw Error('예약 수량과 재고가 일치하지 않습니다. 관리자에게 문의하세요.');return pool.used-quantity}
export const activeStatuses=['pending','confirmed','loaned'];
export const statusNames={pending:'승인 대기',confirmed:'확정',cancelled:'취소',rejected:'거절',loaned:'대여중',returned:'반납'};
