import {receiptCode,receiptLink,completionTitle} from './receipt.mjs';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,signInAnonymously,signInWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getFirestore,doc,collection,query,where,getDoc,getDocs,onSnapshot,runTransaction,writeBatch,Timestamp,serverTimestamp,setDoc} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import {normalizeConfig,resourceSeed,availability,earliestBookingTime,bookingLeadWindow,activeBookingLeadDays,claim,release,statusNames} from './model.mjs';
const root=document.querySelector('#runtime'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let auth,db,settings,config,pools=[],bookings=[],month='',day='',chosen='',screen='apply',isAdmin=false,busy=false,message='',receipt='',draft={},unsubscribePools,unsubscribeBookings,search='';
let phaseTimer;
let completedBooking=null,lookupBooking=null,lookupCode='',linkOpened=false;
const initialReceipt=receiptCode(location.hash);if(initialReceipt){screen='lookup';lookupCode=initialReceipt;history.replaceState(null,'',location.pathname+location.search)}
const base=normalizeConfig(await (await fetch('./app-config.json')).json());
function showError(e){message=({'permission-denied':'접근 권한을 확인하세요.','auth/invalid-credential':'이메일과 비밀번호를 확인하세요.','auth/operation-not-allowed':'Firebase Authentication에서 익명·이메일 로그인을 활성화하세요.','resource-exhausted':'무료 사용량 또는 처리 한도에 도달했습니다. 시간을 두고 다시 시도하세요.','unavailable':'통신하지 못했습니다. 연결을 확인하고 다시 시도하세요.'}[e.code]||e.message||'처리하지 못했습니다. 다시 시도하세요.');render()}
function milliseconds(t){return t?.toMillis?t.toMillis():Number(t)}
function poolValue(d){return {...d,beginAt:milliseconds(d.beginAt),endAt:milliseconds(d.endAt),cancelBefore:milliseconds(d.cancelBefore)}}
function stampPool(d){return {...d,beginAt:Timestamp.fromMillis(d.beginAt),endAt:Timestamp.fromMillis(d.endAt),cancelBefore:Timestamp.fromMillis(d.cancelBefore)}}
function liveSettings(data){return {...data,opensAt:milliseconds(data.opensAt),closesAt:milliseconds(data.closesAt),priorityUntil:data.priorityUntil==null?null:milliseconds(data.priorityUntil)}}
function id(){return [...crypto.getRandomValues(new Uint8Array(24))].map(x=>x.toString(16).padStart(2,'0')).join('')}
function notify(text){message=text;render()}
function hasPriorityAccess(s) {
  return !!s.priorityUid && auth.currentUser?.uid === s.priorityUid;
}
function priorityRequired(s, now = Date.now()) {
  return s.priorityUntil != null && now < s.priorityUntil;
}
function schedulePhaseRefresh() {
  clearTimeout(phaseTimer);
  const now = Date.now();
  const midnight = config.bookingLeadDays > 0 ? earliestBookingTime(1, now) : null;
  const next = Math.min(...[settings.opensAt, settings.priorityUntil, settings.closesAt, settings.bookingLeadStartAt, settings.bookingLeadEndAt, midnight].filter(time => time > now));
  if (Number.isFinite(next)) phaseTimer = setTimeout(() => {
    if (screen === 'apply') render();
    schedulePhaseRefresh();
  }, Math.min(next - now + 25, 2147483647));
}
function priorityGate() {
  return `<section class="period-screen">
    <p class="period-label">우선 신청</p>
    <h4>우선 신청 번호를 입력해 주세요</h4>
    <p>일반 신청은 ${esc(config.priorityUntil?.replace('T',' '))} (한국 시간)부터 열립니다.</p>
    <form id="priority-form">
      <label class="field">우선 신청 번호<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></label>
      <button class="book-button" ${busy||!settings.priorityUid?'disabled':''}>예약 화면 열기</button>
    </form>
    ${settings.priorityUid?'':'<p>관리자가 우선 신청을 준비하고 있습니다.</p>'}
    <div class="admin-menu"><button data-screen="lookup">내 예약 확인·취소</button></div>
  </section>`;
}
async function enterPriority(pin) {
  if (!/^[0-9]{4}$/.test(pin)) throw Error('숫자 4자리를 입력해 주세요.');
  if (!settings.priorityUid) throw Error('관리자가 우선 신청을 준비하고 있습니다.');
  try {
    await signInWithEmailAndPassword(auth, config.priorityEmail, 'Booking-' + pin + '!');
  } catch (error) {
    if (['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(error.code)) throw Error('우선 신청 번호를 확인해 주세요.');
    if (error.code === 'auth/too-many-requests') throw Error('시도 횟수가 많습니다. 잠시 후 다시 시도해 주세요.');
    throw error;
  }
  if (!hasPriorityAccess(settings)) {
    await signOut(auth);
    await readyUser();
    throw Error('우선 신청 설정을 관리자에게 확인해 주세요.');
  }
  isAdmin = false;
  message = '';
  watchMonth();
}
function prioritySettings() {
  const alreadyEnabled = Boolean(config.priorityUntil);
  const canImport = Boolean(base.priorityUntil && base.priorityUid && base.priorityEmail);
  if (!alreadyEnabled && !canImport) return '';
  return `<fieldset>
    <legend>우선 신청</legend>
    ${alreadyEnabled?'':'<label><input type="checkbox" name="importPriority"> 새 ZIP의 우선 신청 설정 적용</label>'}
    <label class="field">일반 신청 시작 (한국 시간)<input type="datetime-local" name="priorityUntil" value="${esc(config.priorityUntil||base.priorityUntil)}" ${alreadyEnabled?'required':''}></label>
    <p class="subtle">우선 신청 번호는 도우미에서 정한 값을 사용합니다.</p>
  </fieldset>`;
}
async function saveSiteSettings(data) {
  const next = structuredClone(config);
  const separateFields = new Set(['paused','bookingLeadDays','useBookingLead','bookingLeadStart','bookingLeadEnd','priorityUntil','importPriority']);
  for (const [key,value] of data) {
    if (!separateFields.has(key)) next[key] = String(value).trim();
  }
  const days = data.has('useBookingLead') ? Number(data.get('bookingLeadDays')) : 0;
  if (data.has('useBookingLead') && (!Number.isInteger(days) || days < 1 || days > 365)) throw Error('최소 신청 일수를 1~365 사이의 정수로 입력해 주세요.');
  next.bookingLeadDays = days;
  next.bookingLeadStart = days ? String(data.get('bookingLeadStart')||'') : '';
  next.bookingLeadEnd = days ? String(data.get('bookingLeadEnd')||'') : '';
  const leadWindow = bookingLeadWindow(next);
  if (!next.title || next.open >= next.close) throw Error('제목과 신청 기간을 확인하세요.');

  const priority = {};
  if (next.priorityUntil || data.has('importPriority')) {
    const importing = !next.priorityUntil;
    const cutoff = String(data.get('priorityUntil') || '');
    if (!(next.open < cutoff && cutoff < next.close)) throw Error('일반 신청 시작은 신청 시작과 마감 사이로 정해 주세요.');
    next.priorityUntil = cutoff;
    next.priorityEmail = importing ? base.priorityEmail : config.priorityEmail;
    priority.priorityUid = importing ? base.priorityUid : settings.priorityUid;
    if (!next.priorityEmail || !priority.priorityUid) throw Error('우선 신청 연결을 준비하려면 새 ZIP에서 npm run deploy를 실행하세요.');
    priority.priorityUntil = Timestamp.fromDate(new Date(cutoff+'+09:00'));
  }
  await setDoc(doc(db,'site','settings'),{
    config:next,
    opensAt:Timestamp.fromDate(new Date(next.open+'+09:00')),
    closesAt:Timestamp.fromDate(new Date(next.close+'+09:00')),
    paused:data.has('paused'),...leadWindow,...priority,updatedAt:serverTimestamp()
  },{merge:true});
  message='설정을 저장했습니다.';
}
function phase(){if(settings?.paused)return 'paused';if(Date.now()<settings.opensAt)return 'before';if(Date.now()>=settings.closesAt)return 'after';return 'open'}
function months(){return [...new Set(config.slots.map(s=>s.date.slice(0,7)))].sort()}
function chooseMonth(m){month=m;day='';chosen='';watchMonth();render()}
function watchMonth(){unsubscribePools?.();unsubscribeBookings?.();const q=query(collection(db,'resources'),where('date','>=',month+'-01'),where('date','<=',month+'-31'));unsubscribePools=onSnapshot(q,s=>{pools=s.docs.map(d=>({id:d.id,...poolValue(d.data())})).sort((a,b)=>(a.date+a.start+a.item).localeCompare(b.date+b.start+b.item));if(!pools.some(p=>p.date===day))day=pools.find(p=>availability(p,settings)==='가능')?.date||pools[0]?.date||'';render()},showError);if(isAdmin){const bq=query(collection(db,'bookings'),where('snapshot.date','>=',month+'-01'),where('snapshot.date','<=',month+'-31'));unsubscribeBookings=onSnapshot(bq,s=>{bookings=s.docs.map(d=>({id:d.id,...d.data()}));render()},showError)}}
function preserve(){const form=document.querySelector('#booking-form');if(form)for(const [k,v]of new FormData(form))draft[k]=v}
function styling(){const rgb=[1,3,5].map(i=>parseInt(config.accent.slice(i,i+2),16)),wash='#'+rgb.map(n=>Math.round(n*.09+255*.91).toString(16).padStart(2,'0')).join('');const fonts={round:'"Pretendard Variable",sans-serif',serif:'"SUIT Variable",sans-serif',classic:'"Gmarket Sans",sans-serif',noto:'"Noto Sans KR",sans-serif',gowun:'"Gowun Dodum",sans-serif'};return `--book:${config.accent};--wash:${wash};font-family:${fonts[config.font]||fonts.round}`}
function calendar(){const adminView=isAdmin&&screen==='admin';const [y,m]=month.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=new Date(Date.UTC(y,m,0)).getUTCDate(),ms=months(),i=ms.indexOf(month);let cells='<span></span>'.repeat(first);for(let n=1;n<=count;n++){const date=month+'-'+String(n).padStart(2,'0'),ps=pools.filter(p=>p.date===date),ok=ps.some(p=>availability(p,settings)==='가능'),has=ps.length>0,closed=has&&!ok,tooSoon=closed&&ps.some(p=>availability(p,settings)==='신청 제한');cells+=`<button type="button" class="calendar-day ${ok?'available':closed?'closed':'empty'} ${date===day?'chosen':''}" data-day="${date}" ${!adminView&&!ok?'disabled':''}><span>${n}</span>${closed&&!adminView?(tooSoon?'<small>제한</small>':'<small>마감</small>'):''}${adminView&&has?`<small>${bookings.filter(b=>b.snapshot.date===date&&b.active).length}건</small>`:''}</button>`}return `<div class="month-calendar"><div class="calendar-toolbar"><button data-month="${i-1}" ${i<=0?'disabled':''} aria-label="이전 달">‹</button><strong>${y}년 ${m}월</strong><button data-month="${i+1}" ${i>=ms.length-1?'disabled':''} aria-label="다음 달">›</button></div><div class="calendar-week">${['일','월','화','수','목','금','토'].map(x=>'<span>'+x+'</span>').join('')}</div><div class="calendar-grid">${cells}</div></div>`}
function poolLabel(p){return p.date+(p.start?' · '+(p.label?p.label+' · ':'')+p.start+'–'+p.end:'')+(p.item?' · '+p.item:'')}
function units(){return config.kind==='consult'?'명':config.kind==='rental'?'대':'학급'}
function fieldInput(f,i){const value=draft['f'+i]||'',common=`name="f${i}" ${f.required?'required':''}`;return `<label class="field">${esc(f.label)} ${f.required?'*':''}${f.type==='select'?`<select ${common}><option value="">선택해 주세요</option>${f.options.map(o=>`<option ${value===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea ${common} maxlength="300">${esc(value)}</textarea>`:`<input ${common} type="${f.type==='number'?'number':f.type==='tel'?'text':f.type}" ${f.type==='tel'?'inputmode="numeric" pattern="[0-9]+" data-digits':''} value="${esc(value)}" maxlength="100">`}</label>`}
function applicant(){if(phase()!=='open'){const before=phase()==='before';return `<section class="period-screen"><p class="period-label">${before?'신청 시작 안내':'신청 마감 안내'}</p><h4>${esc(phase()==='paused'?'신규 신청을 잠시 중단했습니다':before?config.beforeTitle:config.afterTitle)}</h4><p class="period-message">${esc(before?config.beforeMessage:config.afterMessage)}</p><div class="period-time"><small>${before?'신청 시작':'신청 마감'}</small><strong>${esc((before?config.open:config.close).replace('T',' '))}</strong></div><button class="book-button" data-screen="lookup">내 예약 확인·취소</button></section>`}if(priorityRequired(settings)&&!hasPriorityAccess(settings)&&!isAdmin)return priorityGate();const visible=pools.filter(p=>config.display==='list'||p.date===day);if(!visible.some(p=>p.id===chosen&&availability(p,settings)==='가능'))chosen=visible.find(p=>availability(p,settings)==='가능')?.id||'';const current=pools.find(p=>p.id===chosen),remaining=current?current.capacity-current.used:0;const leadDays=activeBookingLeadDays(settings);const earliest=leadDays>0?new Date(earliestBookingTime(leadDays)+32400000).toISOString().slice(0,10):'';return `<div class="admin-menu"><button data-screen="lookup">내 예약 확인·취소</button></div><h4>예약할 날짜${config.mode==='date'?'':'와 '+(config.mode==='period'?'교시':'시간')}를 선택해 주세요.</h4>${earliest?`<p class="subtle">한국 시간 기준 ${esc(earliest)} 일정부터 신청할 수 있어요.</p>`:''}${config.display==='calendar'?calendar():''}<div class="slot-grid">${visible.map(p=>{const state=availability(p,settings);return `<button class="book-slot ${p.id===chosen?'active':''}" data-pool="${p.id}" ${state!=='가능'?'disabled':''}><span>${esc(poolLabel(p))}</span><small>${state==='가능'?'남은 '+(p.capacity-p.used)+units():state}</small></button>`}).join('')}</div><form id="booking-form">${config.kind==='rental'?`<label class="field">${esc(current?.item||'물품')} 대여 수량<input name="quantity" type="number" min="1" max="${remaining}" step="1" value="${Math.min(Number(draft.quantity)||1,remaining)}" required ${remaining?'':'disabled'}></label><p class="subtle">현재 ${remaining}대 남았습니다.</p>`:''}${config.fields.map(fieldInput).join('')}<div class="book-policy">${esc(config.privacy)}<br><br>${esc(config.policy)}<br>취소: 시작 ${config.cancelHours}시간 전까지</div><label class="check-line"><input type="checkbox" name="consent" required ${draft.consent?'checked':''}>개인정보 안내를 확인했습니다.</label><button class="book-button" ${busy||!remaining?'disabled':''}>${busy?'처리 중…':config.approval==='manual'?'예약 승인 요청하기':'예약 신청하기'}</button></form>`}
function completion(){if(!completedBooking)return '<p>예약 확인 메뉴에서 예약을 확인해 주세요.</p>';const pending=completedBooking.status==='pending';return `<section class="book-result" role="status"><h4>${completionTitle(completedBooking.status)}</h4>${pending?'<p>관리자 승인 후 예약이 확정됩니다.</p>':''}<p>${esc(poolLabel(completedBooking.snapshot))} · ${completedBooking.quantity}${units()}</p><button class="book-button" data-open-receipt="${receipt}">내 예약 확인·취소</button><button class="site-control" data-copy-link="${receipt}">예약 확인 링크 복사</button><p class="subtle">나중에 확인하거나 취소할 수 있도록 링크를 보관해 주세요. 링크를 아는 사람은 이 예약을 확인·취소할 수 있으니 다른 사람에게 공유하지 마세요.</p><details><summary>예약 확인 코드 보기</summary><code>${esc(receipt)}</code><button data-copy="${receipt}">코드 복사</button></details></section>`}
function lookup(){const b=lookupBooking;const deadline=b?Math.min(milliseconds(b.snapshot.cancelBefore),milliseconds(b.snapshot.beginAt)):0;const deadlineLabel=deadline?new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",dateStyle:"medium",timeStyle:"short"}).format(deadline):"";return `<h4>내 예약 확인·취소</h4><p class="subtle">보관한 예약 확인 링크로 예약을 확인하고 취소할 수 있어요.</p>${b?'<details><summary>다른 예약 조회</summary>':''}<form id="lookup-form"><label class="field">예약 확인 링크 또는 코드<input name="code" required autocomplete="off" spellcheck="false" value="${esc(lookupCode)}"></label><button class="book-button">예약 확인</button></form>${b?'</details>':''}<div id="lookup-result">${b?`<div class="book-result">${esc(poolLabel(b.snapshot))}<br>${statusNames[b.status]} · ${b.quantity} ${units()}${b.active&&Date.now()<deadline?`<button class="site-control site-danger" data-cancel-code="${lookupCode}">예약 취소</button>`:b.active&&deadlineLabel?`<p class="subtle">취소 기한(${esc(deadlineLabel)})이 지났습니다. 변경이 필요하면 관리자에게 문의해 주세요.</p>`:''}</div>`:''}</div><button data-screen="apply" class="site-control lookup-back">← 신청 화면으로</button>`}
async function loadReceipt(value){const code=receiptCode(value);if(!code)throw Error('예약 확인 링크 또는 코드를 확인해 주세요.');await readyUser();const snap=await getDoc(doc(db,'receipts',code));if(!snap.exists())throw Error('예약을 찾을 수 없습니다.');lookupCode=code;lookupBooking=snap.data();screen='lookup';render()}

function setupScreen(content){return `<section class="booking ${esc(config.theme)}" style="${styling()}"><div class="book-body">${content}</div></section>`}
function login(){return `<h4>관리자 로그인</h4><form id="login-form"><label class="field">이메일<input type="email" name="email" autocomplete="username" required></label><label class="field">비밀번호<input type="password" name="password" autocomplete="current-password" required></label><button class="book-button" ${busy?'disabled':''}>로그인</button></form><p class="subtle">관리자 계정은 본인 Firebase Authentication에서 생성합니다. 이 사이트는 가입 기능으로 관리자 권한을 부여하지 않습니다.</p>`}
function table(rows){return `<div class="admin-table-scroll"><table class="admin-table"><thead><tr><th scope="col">예약 일정</th><th scope="col">상태 및 작업</th></tr></thead><tbody>${rows.map(b=>`<tr><td><strong class="manage-reservation-date">${esc(b.snapshot.date)}</strong><span class="manage-reservation-meta">${esc(poolLabel(b.snapshot).split(" · ").slice(1).join(" · ") || "날짜 예약")} · ${esc(b.quantity+units())}</span><button class="site-control manage-detail" data-detail="${b.id}">상세 보기</button></td><td><span class="booking-status" data-status="${esc(b.status)}">${statusNames[b.status]}</span><div class="manage-actions">${b.status==='pending'?`<button data-state="confirmed" data-bid="${b.id}">승인</button><button data-state="rejected" data-bid="${b.id}">거절</button>`:''}${b.active?`<button data-state="cancelled" data-bid="${b.id}">예약 취소</button><button data-move="${b.id}">일정 변경</button>`:''}${config.kind==='rental'&&b.status==='confirmed'?`<button data-state="loaned" data-bid="${b.id}">대여</button>`:''}${b.status==='loaned'?`<button data-state="returned" data-bid="${b.id}">반납</button>`: ''}</div></td></tr>`).join('')||'<tr><td colspan="2">예약이 없습니다.</td></tr>'}</tbody></table></div>`}

const confirmedOnly={day:false,month:false};
function reservationFilter(scope){
  const selected=confirmedOnly[scope];
  return `<div class="reservation-filter" role="group" aria-label="${scope==='day'?'선택한 날짜':'이 달'} 예약 상태"><button type="button" data-filter-scope="${scope}" data-filter-value="all" aria-pressed="${!selected}">전체</button><button type="button" data-filter-scope="${scope}" data-filter-value="confirmed" aria-pressed="${selected}">확정만</button></div>`;
}
function filterConfirmed(rows,scope){
  return confirmedOnly[scope]?rows.filter(row=>row.status==='confirmed'):rows;
}

function admin(){const all=filteredBookings();return `<div class="manage-heading"><h4>운영 관리</h4><div class="manage-actions"><button class="site-control manage-export" data-action="csv">전체 예약 CSV 받기</button><button class="site-control" data-action="logout">로그아웃</button></div></div>${calendar()}<div class="reservation-list-heading"><strong>선택한 날짜의 예약</strong>${reservationFilter("day")}</div>${table(filterConfirmed(all.filter(b=>b.snapshot.date===day),"day"))}<details><summary>이 달의 예약 · 검색</summary><form id="search-form"><input name="query" value="${esc(search)}" placeholder="이름·학급·물품·상태 검색"><button>검색</button></form><div class="reservation-list-heading"><strong>이 달의 예약</strong>${reservationFilter("month")}</div>${table(filterConfirmed(all,"month"))}<div class="manage-downloads"><button class="site-control" data-action="backup">월별 백업 받기</button></div></details><details><summary>일정·정원·물품 수량</summary>${pools.filter(p=>p.date===day).map(p=>`<form class="manage-session" data-resource="${p.id}"><div class="manage-session-title"><strong>${esc(poolLabel(p))}</strong><small>예약 ${p.used}${units()}</small></div><label class="field manage-capacity">${config.kind==='rental'?'이 회차 보유 수량':'정원'} (${units()})<input type="number" name="capacity" min="${Math.max(1,p.used)}" max="9999" value="${p.capacity}" required></label><label class="manage-session-toggle"><input type="checkbox" name="closed" ${p.closed?'checked':''}>신청 중지</label><button class="site-control" type="submit">저장</button></form>`).join('')}<p class="subtle">예약이 있는 회차의 시간·식별자는 변경하지 않습니다. 회차 중지 후 기존 예약을 이동하거나 취소하세요.</p></details><details><summary>사이트 설정 · 신청 전·중·후</summary>${settingsForm()}</details><details><summary>추가 운영일 만들기</summary><form id="add-date-form"><label class="field">날짜<input type="date" name="date" required></label><button>동일한 시간표로 운영일 추가</button></form><p class="subtle">이미 등록된 운영일에는 중복 추가하지 않습니다. 기존 예약을 덮어쓰지 않습니다.</p></details>`}
function settingsForm(){const texts=[['organization','학교·기관'],['title','예약 제목'],['beforeTitle','신청 전 제목'],['beforeMessage','신청 전 안내'],['description','신청 중 안내'],['afterTitle','마감 후 제목'],['afterMessage','마감 후 안내'],['privacy','개인정보 안내'],['policy','취소 안내']];return `<form id="settings-form">${texts.map(([key,label])=>`<label class="field">${label}<textarea name="${key}" maxlength="1000" required>${esc(config[key])}</textarea></label>`).join('')}<label class="field">신청 시작<input type="datetime-local" name="open" value="${config.open}" required></label><label class="field">신청 마감<input type="datetime-local" name="close" value="${config.close}" required></label><fieldset><legend>신청일 제한</legend><label><input type="checkbox" name="useBookingLead" ${config.bookingLeadDays>0?'checked':''}> 신청일 제한 사용</label><fieldset data-booking-lead-options ${config.bookingLeadDays>0?'':'disabled hidden'}><label class="field">최소 신청 일수<input type="number" name="bookingLeadDays" min="1" max="365" step="1" value="${esc(config.bookingLeadDays||3)}" required></label><label class="field">제한 시작 (한국 시간)<input type="datetime-local" name="bookingLeadStart" value="${esc(config.bookingLeadStart)}"></label><label class="field">제한 종료 (한국 시간)<input type="datetime-local" name="bookingLeadEnd" value="${esc(config.bookingLeadEnd)}"></label><p class="subtle">시작·종료 시각을 모두 비워 두면 전체 신청 기간에 적용돼요.</p></fieldset></fieldset>${prioritySettings()}<label><input type="checkbox" name="paused" ${settings.paused?'checked':''}>신규 접수 일시 중지</label><button class="book-button">사이트 설정 저장</button></form>`}
function render(){const expanded=new Set([...root.querySelectorAll('details[open]')].map(d=>d.querySelector('summary')?.textContent));if(!config)return;if(!settings){root.innerHTML=setupScreen(login()+(message?`<p class="runtime-message" role="status">${esc(message)}</p>`:''));return}preserve();root.innerHTML=`<div class="booking ${esc(config.theme)}" style="${styling()}"><div class="book-hero"><div class="book-title-row">${config.logo?`<img class="school-logo" src="${esc(config.logo)}" alt="기관 로고">`:''}<div class="book-heading"><small>${esc(config.organization)}</small><h3>${esc(config.title)}</h3></div></div><p class="book-description">${esc(config.description)}</p></div><div class="book-body">${message?`<p class="runtime-message" role="status">${esc(message)}</p>`:''}${screen==='admin'?isAdmin?admin():login():screen==='lookup'?lookup():screen==='complete'?completion():applicant()}<div class="runtime-footer"><button data-screen="apply">예약 신청</button><button data-screen="lookup">예약 확인</button><button data-screen="admin">관리자</button></div></div></div>`;for(const detail of root.querySelectorAll('details'))if(expanded.has(detail.querySelector('summary')?.textContent))detail.open=true;}
async function readyUser(){if(!auth.currentUser)await signInAnonymously(auth);return auth.currentUser}
async function makeBooking(data){await readyUser();const rid=chosen,bid=id(),code=id(),ref=doc(db,'resources',rid);let saved,observed;for(let attempt=0;;attempt++){try{await runTransaction(db,async tx=>{const [r,setting]=await Promise.all([tx.get(ref),tx.get(doc(db,'site','settings'))]);if(!r.exists())throw Error('해당 회차가 없습니다.');observed=JSON.stringify([r.data().used,r.data().lastBooking]);const p=poolValue(r.data()),s=liveSettings(setting.data());if(priorityRequired(s)&&!hasPriorityAccess(s)&&!isAdmin)throw Error('우선 신청 번호를 입력해 주세요.');const quantity=config.kind==='rental'?Number(data.get('quantity')):1;const state=availability(p,s);if(state==='신청 제한')throw Error('오늘로부터 '+s.config.bookingLeadDays+'일 뒤 일정부터 신청할 수 있어요.');if(state!=='가능')throw Error('신청 기간이 아니거나 정원이 마감됐습니다.');const used=claim(p,quantity),answers=config.fields.map((f,i)=>({label:f.label,value:String(data.get('f'+i)||'').slice(0,300)}));if(config.fields.some((f,i)=>f.required&&!answers[i].value.trim()))throw Error('필수 항목을 입력하세요.');tx.update(ref,{used,lastBooking:bid});const booking={bookingId:bid,receiptCode:code,ownerUid:auth.currentUser.uid,resourceId:rid,quantity,active:true,status:s.config.approval==='manual'?'pending':'confirmed',answers,snapshot:r.data(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()};saved=booking;tx.set(doc(db,'bookings',bid),booking);tx.set(doc(db,'receipts',code),booking)});break}catch(error){if(attempt>=19||!['permission-denied','aborted'].includes(error.code)||!observed)throw error;const latest=await getDoc(ref);if(!latest.exists()||JSON.stringify([latest.data().used,latest.data().lastBooking])===observed)throw error;await new Promise(resolve=>setTimeout(resolve,80+Math.floor(Math.random()*160)));}}receipt=code;completedBooking=saved;draft={};}
async function setStatus(key,status,sourceCollection=isAdmin?'bookings':'receipts'){const viaReceipt=sourceCollection==='receipts';await readyUser();await runTransaction(db,async tx=>{const source=doc(db,sourceCollection,key),snap=await tx.get(source);if(!snap.exists())throw Error('예약을 찾을 수 없습니다.');const b=snap.data(),bid=b.bookingId,br=doc(db,'bookings',bid),receiptRef=doc(db,'receipts',b.receiptCode),rr=doc(db,'resources',b.resourceId);let update={status,updatedAt:serverTimestamp()};if(['cancelled','rejected','returned'].includes(status)){const r=await tx.get(rr);if(!b.active)throw Error('이미 종료된 예약입니다.');if(viaReceipt&&(Date.now()>=milliseconds(b.snapshot.cancelBefore)||Date.now()>=milliseconds(b.snapshot.beginAt)))throw Error('취소 가능 기한이 지났습니다.');update.active=false;if(viaReceipt)update.cancelCode=key;tx.update(rr,{used:release(r.data(),b.quantity),lastBooking:bid})}tx.update(br,update);tx.set(receiptRef,{...b,...update})});}

async function moveBooking(bid,target){const fresh=id(),code=id();await runTransaction(db,async tx=>{const br=doc(db,'bookings',bid),oldSnap=await tx.get(br);if(!oldSnap.exists()||!oldSnap.data().active)throw Error('유효한 예약이 아닙니다.');const old=oldSnap.data();if(old.resourceId===target)throw Error('다른 회차를 선택하세요.');const oldRef=doc(db,'resources',old.resourceId),newRef=doc(db,'resources',target),[a,b]=await Promise.all([tx.get(oldRef),tx.get(newRef)]);if(!b.exists()||b.data().closed||milliseconds(b.data().beginAt)<=Date.now())throw Error('변경할 수 없는 회차입니다.');if(b.data().item!==old.snapshot.item)throw Error('같은 물품의 회차만 선택하세요.');tx.update(oldRef,{used:release(a.data(),old.quantity),lastBooking:bid});tx.update(newRef,{used:claim(b.data(),old.quantity),lastBooking:fresh});const archived={...old,active:false,status:'cancelled',updatedAt:serverTimestamp()};tx.update(br,{active:false,status:'cancelled',updatedAt:serverTimestamp()});tx.set(doc(db,'receipts',old.receiptCode),archived);const replacement={...old,bookingId:fresh,receiptCode:code,resourceId:target,snapshot:b.data(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()};tx.set(doc(db,'bookings',fresh),replacement);tx.set(doc(db,'receipts',code),replacement)});notify('일정을 변경했습니다. 새 예약 확인 코드: '+code)}
async function initialise(){if(!isAdmin)throw Error('관리자 권한이 필요합니다.');if(base.priorityUntil&&(!base.priorityUid||!base.priorityEmail))throw Error('우선 신청 연결을 준비하려면 npm run deploy를 실행하세요.');const existing=await getDocs(query(collection(db,'resources')));if((await getDoc(doc(db,'site','settings'))).exists())throw Error('이미 초기 설정이 있습니다. 초기화를 다시 실행하지 않습니다.');const seed=resourceSeed(base),prior=new Map(existing.docs.map(d=>[d.id,d.data()]));if(existing.docs.some(d=>d.data().used!==0||!seed.some(p=>p.id===d.id)))throw Error('기존 자료와 설치 구성이 다릅니다. 덮어쓰지 않습니다.');for(let i=0;i<seed.length;i+=150){const batch=writeBatch(db);for(const p of seed.slice(i,i+150)){if(prior.has(p.id))continue;const {id,...value}=p;batch.set(doc(db,'resources',id),stampPool(value))}await batch.commit()}await setDoc(doc(db,'site','settings'),{config:base,opensAt:Timestamp.fromDate(new Date(base.open+'+09:00')),closesAt:Timestamp.fromDate(new Date(base.close+'+09:00')),paused:!!base.paused,...bookingLeadWindow(base),...(base.priorityUntil?{priorityUntil:Timestamp.fromDate(new Date(base.priorityUntil+'+09:00')),priorityUid:base.priorityUid}:{}),updatedAt:serverTimestamp()});notify('초기 운영 자료 저장 완료. 실제 예약을 받기 전 아래 설치 검사를 진행하세요.')}

function filteredBookings(){
  return bookings.filter(b=>!search||JSON.stringify(b.answers).includes(search)||poolLabel(b.snapshot).includes(search)||statusNames[b.status].includes(search));
}

function bookingCsv(rows){
  const columns=new Map();
  function answerColumns(fields){
    const counts=new Map();
    return (fields||[]).map(field=>{
      const label=String(field.label||'신청 항목');
      const occurrence=(counts.get(label)||0)+1;
      counts.set(label,occurrence);
      const key=JSON.stringify([label,occurrence]);
      if(!columns.has(key))columns.set(key,occurrence===1?label:label+' ('+occurrence+')');
      return [key,field.value??''];
    });
  }
  answerColumns(config.fields);
  const sorted=[...rows].sort((a,b)=>(a.snapshot.date+(a.snapshot.start||'')).localeCompare(b.snapshot.date+(b.snapshot.start||'')));
  const answers=sorted.map(b=>new Map(answerColumns(b.answers)));
  const showTime=config.mode!=='date'||sorted.some(b=>b.snapshot.start);
  const showItem=config.kind==='rental'||sorted.some(b=>b.snapshot.item);
  const header=['예약일',...(showTime?['회차','시작 시간','종료 시간']:[]),...(showItem?['물품']:[]),'상태','수량 ('+units()+')',...columns.values()];
  const records=sorted.map((b,i)=>{
    const p=b.snapshot;
    return [p.date,...(showTime?[p.label,p.start,p.end]:[]),...(showItem?[p.item]:[]),statusNames[b.status]||b.status,b.quantity,...[...columns.keys()].map(key=>answers[i].get(key)??'')];
  });
  const quote=value=>'"'+String(value??'').replace(/^(?:[\t\r\n]|\s*[=+@-])/,match=>"'"+match).replace(/"/g,'""')+'"';
  return '\ufeff'+[header,...records].map(row=>row.map(quote).join(',')).join('\r\n');
}

async function downloadAllBookings(button){
  if(!isAdmin)throw Error('관리자 권한이 필요합니다.');
  button.disabled=true;
  try{
    const records=await getDocs(collection(db,'bookings'));
    const title=String(config.title||'예약').replace(/[<>:"/\\|?*\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,100)||'예약';
    output(title+' 내역.csv',bookingCsv(records.docs.map(doc=>doc.data())),'text/csv;charset=utf-8');
  }finally{button.disabled=false;}
}

function output(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
document.addEventListener('input',e=>{if(e.target.hasAttribute('data-digits'))e.target.value=e.target.value.replace(/[^0-9]/g,'');if(e.target.name==='quantity'){const max=Number(e.target.max);if(Number(e.target.value)>max)e.target.value=String(max)}if(e.target.closest('#booking-form'))preserve()});

function operationDialog(title,body){
  const dialog=document.querySelector('dialog');
  dialog.setAttribute('aria-labelledby','operation-title');
  document.querySelector('#dialog-body').innerHTML=`<h3 id="operation-title">${esc(title)}</h3>${body}<p class="operation-error" role="alert" hidden></p>`;
  dialog.showModal();
}
function operationActions(label,danger=false,disabled=false){
  return `<div class="operation-actions"><button type="button" data-dialog-close autofocus>돌아가기</button><button type="submit" class="${danger?'operation-danger':'operation-primary'}" ${disabled?'disabled':''}>${esc(label)}</button></div>`;
}
function confirmCancellation(booking,key,viaReceipt){
  if(!booking?.active)throw Error('이미 종료된 예약입니다.');
  operationDialog('이 예약을 취소할까요?',`<p class="operation-summary">${esc(poolLabel(booking.snapshot))} · ${esc(booking.quantity+units())}</p><p>취소하면 이 회차의 자리가 다시 열립니다.</p><form data-confirm-cancel="${esc(key)}" data-cancel-source="${viaReceipt?'receipts':'bookings'}">${operationActions('예약 취소하기',true)}</form>`);
}
function showMoveDialog(bid){
  const booking=bookings.find(b=>b.id===bid);
  if(!booking?.active)throw Error('유효한 예약이 아닙니다.');
  const candidates=pools.filter(p=>p.id!==booking.resourceId&&!p.closed&&p.beginAt>Date.now()&&p.item===booking.snapshot.item&&p.capacity-p.used>=booking.quantity);
  operationDialog('예약 일정 변경',`<p class="operation-summary"><strong>현재 일정</strong>${esc(poolLabel(booking.snapshot))}</p><form data-move-form="${esc(bid)}"><label class="operation-field">새 일정<select name="target" required ${candidates.length?'':'disabled'}><option value="">${candidates.length?'변경할 회차를 선택하세요':'이 달에 변경 가능한 회차가 없습니다'}</option>${candidates.map(p=>`<option value="${esc(p.id)}">${esc(poolLabel(p))} · 남은 ${p.capacity-p.used}${units()}</option>`).join('')}</select></label>${operationActions('일정 변경하기',false,!candidates.length)}</form>`);
}

document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled||busy)return;try{if(b.dataset.filterScope&&isAdmin){confirmedOnly[b.dataset.filterScope]=b.dataset.filterValue==='confirmed';render();root.querySelector(`[data-filter-scope="${b.dataset.filterScope}"][aria-pressed="true"]`)?.focus()}else if(b.hasAttribute('data-dialog-close')){b.closest('dialog').close()}else if(b.dataset.screen){screen=b.dataset.screen;message='';render()}else if(b.dataset.month!==undefined){chooseMonth(months()[Number(b.dataset.month)])}else if(b.dataset.day){preserve();day=b.dataset.day;chosen='';render()}else if(b.dataset.pool){preserve();chosen=b.dataset.pool;render()}else if(b.dataset.openReceipt){message='';await loadReceipt(b.dataset.openReceipt)}else if(b.dataset.copyLink){try{await navigator.clipboard.writeText(receiptLink(b.dataset.copyLink,location.href));notify('예약 확인 링크를 복사했습니다.')}catch{notify('링크를 복사하지 못했습니다. 예약 확인 코드를 펼쳐 보관해 주세요.')}}else if(b.dataset.copy){await navigator.clipboard.writeText(b.dataset.copy);notify('코드를 복사했습니다.')}else if(b.dataset.state){if(b.dataset.state==='cancelled')confirmCancellation(bookings.find(r=>r.id===b.dataset.bid),b.dataset.bid,false);else{await setStatus(b.dataset.bid,b.dataset.state);notify('처리했습니다.')}}else if(b.dataset.detail){
  const booking=bookings.find(r=>r.id===b.dataset.detail);
  if(!booking)throw Error('예약을 찾을 수 없습니다.');
  operationDialog('예약 상세',`<div class="operation-summary"><strong>${esc(poolLabel(booking.snapshot))}</strong><span>${esc(statusNames[booking.status])} · ${esc(booking.quantity+units())}</span></div><dl class="operation-details">${(booking.answers||[]).map(a=>`<dt>${esc(a.label)}</dt><dd>${esc(a.value||'—')}</dd>`).join('')}<dt>확인 코드</dt><dd><code>${esc(booking.receiptCode)}</code></dd></dl><div class="operation-actions"><button type="button" data-dialog-close autofocus>닫기</button></div>`);
}else if(b.dataset.move){showMoveDialog(b.dataset.move)}else if(b.dataset.cancelCode){confirmCancellation(lookupBooking,b.dataset.cancelCode,true)}else if(b.dataset.action==='logout'){unsubscribeBookings?.();unsubscribeBookings=undefined;bookings=[];message='';await signOut(auth);isAdmin=false;await signInAnonymously(auth);screen='apply';watchMonth();render()}else if(b.dataset.action==='initialise'){await initialise();location.reload()}else if(b.dataset.action==='csv'){await downloadAllBookings(b)}else if(b.dataset.action==='backup')output(month+'-예약백업.json',JSON.stringify(bookings,null,2),'application/json')}catch(err){showError(err)}});
document.addEventListener('change', event => {
  const checkbox = event.target;
  if (checkbox.name !== 'useBookingLead' || checkbox.form?.id !== 'settings-form') return;
  const options = checkbox.form.querySelector('[data-booking-lead-options]');
  options.disabled = !checkbox.checked;
  options.hidden = !checkbox.checked;
});
document.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;const form=e.target,data=new FormData(form);busy=true;try{if(form.id==='booking-form'){await makeBooking(data);screen='complete';message='';document.querySelector('#booking-form')?.reset();draft={}}else if(form.id==='priority-form'){await enterPriority(String(data.get('pin')||''));}else if(form.id==='login-form'){await signInWithEmailAndPassword(auth,data.get('email'),data.get('password'));isAdmin=(await getDoc(doc(db,'admins',auth.currentUser.uid))).data()?.enabled===true;if(!isAdmin)throw Error('관리자 권한이 없습니다. Firebase에서 admins 문서를 설정하세요.');screen='admin';if(!settings){root.innerHTML=setupScreen('<h2>최초 자료 설정</h2><p>이 프로젝트에 예약 자료가 없습니다.</p><p class="subtle">내려받은 구성의 일정과 신청 항목을 이 프로젝트에 저장합니다. 처음 한 번만 실행하세요.</p><button class="book-button" data-action="initialise">선택한 구성으로 초기 자료 만들기</button>');return}watchMonth()}else if(form.id==='lookup-form'){message='';await loadReceipt(data.get('code'));return}else if(form.id==='settings-form'){await saveSiteSettings(data);}else if(form.dataset.resource){const capacity=Number(data.get('capacity'));await runTransaction(db,async tx=>{const ref=doc(db,'resources',form.dataset.resource),snapshot=await tx.get(ref);if(capacity<snapshot.data().used)throw Error('현재 예약 수량보다 줄일 수 없습니다.');tx.update(ref,{capacity,closed:data.has('closed')})});message='회차 설정을 저장했습니다.'}else if(form.id==='search-form')search=String(data.get('query'));else if(form.dataset.confirmCancel){const key=form.dataset.confirmCancel,source=form.dataset.cancelSource;await setStatus(key,'cancelled',source);form.closest('dialog').close();if(source==='receipts'){await loadReceipt(key);if(key===receipt){receipt='';completedBooking=null}}notify('예약을 취소했습니다.')}else if(form.dataset.moveForm){await moveBooking(form.dataset.moveForm,String(data.get('target')));document.querySelector('dialog').close()}else if(form.id==='add-date-form'){const date=String(data.get('date'));if(config.slots.some(s=>s.date===date))throw Error('이미 등록된 운영일입니다.');const sample=config.slots[0].date,extra=config.slots.filter(s=>s.date===sample).map(s=>({...s,date})),next=structuredClone(config);next.slots.push(...extra);normalizeConfig(next);const generated=resourceSeed({...next,slots:extra});for(let i=0;i<generated.length;i+=150){const batch=writeBatch(db);for(const p of generated.slice(i,i+150)){const {id:unused,...value}=p;batch.set(doc(db,'resources',id()),stampPool(value))}await batch.commit()}await setDoc(doc(db,'site','settings'),{config:next},{merge:true});message='운영일을 추가했습니다.'}}catch(err){showError(err);const error=form.closest('dialog')?.querySelector('.operation-error');if(error){error.textContent=message;error.hidden=false}}finally{busy=false;if(form.id!=='lookup-form'&&settings)render()}});
try{const fb=await(await fetch('./firebase-config.json')).json();if(!fb.projectId||fb.projectId==='YOUR_PROJECT_ID')throw Error('최초 연결 설정이 필요합니다. 다운로드 폴더의 시작하기.html을 열어 주세요.');db=getFirestore(initializeApp(fb));auth=getAuth();await setPersistence(auth,browserLocalPersistence);await auth.authStateReady();await readyUser();if(auth.currentUser&&!auth.currentUser.isAnonymous)isAdmin=(await getDoc(doc(db,'admins',auth.currentUser.uid))).data()?.enabled===true;onSnapshot(doc(db,'site','settings'),snap=>{if(!snap.exists()){config=base;root.innerHTML=setupScreen(login()+'<p class="runtime-message">초기 자료를 아직 만들지 않았습니다. 관리자 로그인 후 초기화를 진행하세요.</p>');return}settings=liveSettings(snap.data());config=settings.config;schedulePhaseRefresh();if(!month)month=months()[0];watchMonth();render();if(initialReceipt&&!linkOpened){linkOpened=true;loadReceipt(initialReceipt).catch(showError)}},showError)}catch(err){root.innerHTML=`<section class="setup-error"><h2>설치 설정을 확인해 주세요.</h2><p>${esc(err.message)}</p><p>이 화면은 연결 성공을 뜻하지 않습니다.</p></section>`}
