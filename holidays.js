/* Reviewed 2026-11-02 against KASI calendar tables and KASA 2027 announcement.
   Explicit years avoid silently guessing future holidays or lunar dates.
   https://astro.kasi.re.kr/kor/life/post/calendarData?year=2026
   https://astro.kasi.re.kr/kor/life/post/calendarData?year=2027
   https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431 */
const holidayCache=new Map();
function koreanHolidays(year){
 if(holidayCache.has(year))return holidayCache.get(year);
 if(!Number.isInteger(year)||year<2026||year>2100)throw Error('공휴일 자동 계산은 2026~2100년을 지원합니다.');
 const map={},groups=[],pad=n=>String(n).padStart(2,'0'),day=d=>d.toISOString().slice(0,10),date=s=>new Date(s+'T12:00:00Z'),shift=(s,n)=>day(new Date(+date(s)+n*86400000)),weekday=s=>date(s).getUTCDay();
 function add(d,name){(map[d]??=[]).push(name)}
 for(const [md,name,sub] of [['01-01','신정',false],['03-01','삼일절',true],['05-01','노동절',true],['05-05','어린이날',true],['06-06','현충일',false],['07-17','제헌절',true],['08-15','광복절',true],['10-03','개천절',true],['10-09','한글날',true],['12-25','성탄절',true]]){const d=year+'-'+md;add(d,name);if(sub)groups.push({days:[d],name,lunar:false})}
 const lunar=new Intl.DateTimeFormat('en-u-ca-dangi',{month:'numeric',day:'numeric',timeZone:'Asia/Seoul'});
 if(lunar.resolvedOptions().calendar!=='dangi')throw Error('이 브라우저는 음력 계산을 지원하지 않습니다. 최신 브라우저로 열어 주세요.');
 let found=0;
 for(let d=date(year+'-01-01');d.getUTCFullYear()===year;d.setUTCDate(d.getUTCDate()+1)){
 const parts=lunar.formatToParts(d),m=parts.find(p=>p.type==='month')?.value,n=Number(parts.find(p=>p.type==='day')?.value),iso=day(d);
 const name=m==='1'&&n===1?'설날':m==='4'&&n===8?'부처님오신날':m==='8'&&n===15?'추석':'';
 if(!name)continue;found++;const days=name==='부처님오신날'?[iso]:[-1,0,1].map(offset=>shift(iso,offset));days.forEach(x=>add(x,name));groups.push({days,name,lunar:name!=='부처님오신날'});
 }
 if(found!==3)throw Error('음력 공휴일 계산에 실패했습니다. 브라우저를 업데이트해 주세요.');
 if(year===2026)add('2026-06-03','전국동시지방선거');
 const triggers=new Map();for(const g of groups)if(g.days.some(d=>(g.lunar?weekday(d)===0:[0,6].includes(weekday(d)))||(map[d]?.length||0)>1)){const end=g.days[g.days.length-1];triggers.set(end,g.name)}
 for(const [end,name] of [...triggers].sort(([a],[b])=>a.localeCompare(b))){let d=shift(end,1);while([0,6].includes(weekday(d))||map[d])d=shift(d,1);add(d,'대체공휴일 ('+name+')')}
 const result=Object.fromEntries(Object.entries(map).map(([d,names])=>[d,names.join('·')]));holidayCache.set(year,result);return result;
}
function holidayName(date){if(new Date(date+'T12:00:00Z').getUTCDay()===0)return '일요일';return koreanHolidays(Number(date.slice(0,4)))[date]||''}
function extraHolidayDates(){const dates=(config.holidayExtras||'').split(/[\s,]+/).filter(Boolean);if(dates.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d+'T00:00:00Z'))||new Date(d+'T00:00:00Z').toISOString().slice(0,10)!==d))throw Error('추가 제외일을 YYYY-MM-DD 형식으로 입력해 주세요.');return new Set(dates)}
function rangeHolidays(){const entries=[];const extras=extraHolidayDates();for(let y=Number(config.rangeStart.slice(0,4));y<=Number(config.rangeEnd.slice(0,4));y++)for(const [date,name] of Object.entries(koreanHolidays(y)))if(date>=config.rangeStart&&date<=config.rangeEnd)entries.push({date,name});for(const date of extras)if(date>=config.rangeStart&&date<=config.rangeEnd&&!entries.some(h=>h.date===date))entries.push({date,name:'추가 제외일'});return entries.sort((a,b)=>a.date.localeCompare(b.date))}
function holidaySummary(){try{return rangeHolidays().map(h=>esc(h.date)+' · '+esc(h.name)).join('<br>')||'기간 내 공휴일이 없습니다.'}catch(err){return esc(err.message)}}
function holidayControls(){return `<label class="radio-line"><input type="checkbox" data-exclude-holidays ${config.excludeHolidays?'checked':''}>공휴일 제외<small>선택한 연도의 대한민국 공휴일·대체공휴일을 자동 계산합니다.</small></label><p class="subtle">체크 후 일괄 추가하면 기간 안의 공휴일 회차도 제거합니다. 자동 계산 결과가 실제 공휴일과 다를 수 있으니, 제외된 날짜를 확인해 주세요. 임시공휴일·선거일·학교 재량휴업일은 추가 제외일에 넣을 수 있어요.</p>${config.excludeHolidays?`${textfield('추가 제외일 · 한 줄에 YYYY-MM-DD 하나씩','holidayExtras')}<details><summary>기간 내 제외일 확인</summary><p class="subtle">${holidaySummary()}</p><a class="subtle" href="https://astro.kasi.re.kr/life/post/almanac" target="_blank" rel="noopener">월력요항 확인 ↗</a></details>`:''}`}
document.addEventListener('change',e=>{if(e.target.hasAttribute('data-exclude-holidays')){config.excludeHolidays=e.target.checked;render()}});

document.addEventListener('change',e=>{if(config.excludeHolidays&&['rangeStart','rangeEnd','holidayExtras'].includes(e.target.dataset.key))render()});
