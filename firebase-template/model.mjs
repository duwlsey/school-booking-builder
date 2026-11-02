export function normalizeConfig(c) {
  const out=structuredClone(c);
  if(!out.title?.trim()||!out.organization?.trim()||!out.slots?.length)throw Error('학교 이름과 예약 일정을 입력하세요.');
  if(out.open>=out.close)throw Error('신청 마감은 시작보다 뒤여야 합니다.');
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
export function availability(pool,settings,now=Date.now()) {
  if(settings.paused||pool.closed)return '중지';
  if(now<settings.opensAt)return '신청 시작 전';
  if(now>=settings.closesAt||now>=pool.beginAt||pool.used>=pool.capacity)return '마감';
  return '가능';
}
export function claim(pool,quantity){if(!Number.isInteger(quantity)||quantity<1||quantity>pool.capacity-pool.used)throw Error('남은 정원·수량이 부족합니다.');return pool.used+quantity}
export function release(pool,quantity){if(!Number.isInteger(quantity)||quantity<1||quantity>pool.used)throw Error('예약 수량과 재고가 일치하지 않습니다. 관리자에게 문의하세요.');return pool.used-quantity}
export const activeStatuses=['pending','confirmed','loaned'];
export const statusNames={pending:'승인 대기',confirmed:'확정',cancelled:'취소',rejected:'거절',loaned:'대여중',returned:'반납'};
