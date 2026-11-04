/* Local administrator prototype. Changes commit only after compatibility checks. */
let adminMonth='',adminDay='',adminFilter={query:'',status:'',from:'',to:''},adminLog=[];
function activeReservation(r){return ['대기','확정','대여중'].includes(r.status)}
function reservationSlot(r,c=config){return c.slots.find(s=>slotKey(s)===(r.slotKey||slotKey(r.slotSnapshot||{}))||(!r.slotKey&&slotText(s)===r.slot))}
function reservationDay(r){return r.slotSnapshot?.date||r.rental?.date||r.slot?.slice(0,10)||''}
function guardedConfig(next){if(!next.title.trim()||!next.organization.trim())throw Error('학교 이름과 예약 제목을 입력하세요.');if(!next.open||!next.close||next.open>=next.close)throw Error('신청 마감은 시작보다 뒤로 설정하세요.');for(const r of demoReservations.filter(activeReservation)){const s=reservationSlot(r,next);if(!s)throw Error('예약이 있는 회차는 삭제하거나 시간을 바꿀 수 없습니다. 먼저 해당 예약을 다른 회차로 옮기거나 취소하세요.');if(next.kind!=='rental'){const used=demoReservations.filter(x=>activeReservation(x)&&reservationSlot(x,next)&&slotKey(reservationSlot(x,next))===slotKey(s)).length;if(s.capacity<used)throw Error('이미 예약된 '+used+capacityUnit()+'보다 정원을 줄일 수 없습니다.')}else if(!next.items.includes(r.rental?.item))throw Error('대여 예약이 남아 있는 물품은 삭제할 수 없습니다.');}if(next.kind==='rental'){for(const item of next.items){const total=next.itemStock[item];if(!Number.isInteger(total)||total<1||total>9999)throw Error('물품 수량은 1~9999대로 입력하세요.');for(const slot of next.slots){const used=demoReservations.filter(r=>activeReservation(r)&&r.rental?.item===item&&r.rental.date===slot.date&&(next.mode==='date'||r.rental.start<slot.end&&slot.start<r.rental.end)).reduce((n,r)=>n+r.rental.quantity,0);if(used>total)throw Error(item+' 예약 수량 '+used+'대보다 보유 수량을 줄일 수 없습니다.');}}}return next}
function adminCommit(change,message){const next=JSON.parse(JSON.stringify(config));change(next);guardedConfig(next);config=next;adminLog.unshift({at:new Date().toLocaleString('ko-KR'),message});adminLog=adminLog.slice(0,30);renderPreview();toast(message)}
function adminRows(){return demoReservations.map((r,i)=>({r,i})).filter(({r})=>{const d=reservationDay(r),q=(r.code+' '+r.slot+' '+(r.rental?.item||'')+' '+(r.answers||[]).map(a=>a.label+' '+a.value).join(' ')).toLowerCase();return (!adminFilter.query||q.includes(adminFilter.query.toLowerCase()))&&(!adminFilter.status||r.status===adminFilter.status)&&(!adminFilter.from||d>=adminFilter.from)&&(!adminFilter.to||d<=adminFilter.to)})}
const previewConfirmedOnly={day:false,month:false};
const previewStatusKey={대기:'pending',확정:'confirmed',취소:'cancelled',거절:'rejected',대여중:'loaned',반납:'returned'};
function previewReservationFilter(scope){
  const selected=previewConfirmedOnly[scope];
  return `<div class="reservation-filter" role="group" aria-label="예약 상태"><button type="button" data-preview-filter="${scope}" data-filter-value="all" aria-pressed="${!selected}">전체</button><button type="button" data-preview-filter="${scope}" data-filter-value="confirmed" aria-pressed="${selected}">확정만</button></div>`;
}
function adminReservationTable(rows,scope){
  const visible=previewConfirmedOnly[scope]?rows.filter(({r})=>r.status==='확정'):rows;
  return `<div class="admin-table-scroll"><table class="admin-table"><thead><tr><th scope="col">예약 일정</th><th scope="col">상태 및 작업</th></tr></thead><tbody>${visible.map(({r,i})=>`<tr><td><strong class="manage-reservation-date">${esc(reservationDay(r))}</strong><span class="manage-reservation-meta">${esc(r.slot.split(' · ').slice(1).join(' · ')||'날짜 예약')} · ${esc(r.rental?r.rental.quantity+'대':'1'+capacityUnit())}</span><button class="site-control manage-detail" data-admin-detail="${i}">상세 보기</button></td><td><span class="booking-status" data-status="${previewStatusKey[r.status]||''}">${esc(r.status==='대기'?'승인 대기':r.status)}</span><div class="manage-actions">${r.status==='대기'?`<button data-admin-status="확정" data-reservation="${i}">승인</button><button data-admin-status="거절" data-reservation="${i}">거절</button>`:''}${activeReservation(r)?`<button data-preview-cancel="${i}" data-state="cancelled">예약 취소</button><button data-admin-move="${i}">일정 변경</button>`:''}${r.rental&&['확정','대여중'].includes(r.status)?`<button data-admin-status="${r.status==='확정'?'대여중':'반납'}" data-reservation="${i}">${r.status==='확정'?'대여':'반납'}</button>`:''}</div></td></tr>`).join('')||'<tr><td colspan="2">예약이 없습니다.</td></tr>'}</tbody></table></div>`;
}
function adminCalendar(){const months=[...new Set([...config.slots.map(s=>s.date.slice(0,7)),...demoReservations.map(r=>reservationDay(r).slice(0,7))])].sort();if(!months.includes(adminMonth))adminMonth=months[0]||config.date.slice(0,7);if(!adminDay.startsWith(adminMonth))adminDay=config.slots.find(s=>s.date.startsWith(adminMonth))?.date||adminMonth+'-01';const [y,m]=adminMonth.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=new Date(Date.UTC(y,m,0)).getUTCDate();let cells='<span></span>'.repeat(first);for(let n=1;n<=count;n++){const date=adminMonth+'-'+String(n).padStart(2,'0'),rows=demoReservations.filter(r=>reservationDay(r)===date&&activeReservation(r)),pending=rows.filter(r=>r.status==='대기').length,has=config.slots.some(s=>s.date===date);cells+=`<button class="calendar-day ${date===adminDay?'chosen':''} ${has?'available':'empty'}" data-admin-day="${date}"><b>${n}</b><small>${rows.length?rows.length+'건':has?'운영':''}</small>${pending?`<em>대기 ${pending}</em>`:''}</button>`}return `<div class="calendar-toolbar"><button data-admin-month="-1" ${months.indexOf(adminMonth)<=0?'disabled':''}>‹</button><strong>${y}년 ${m}월</strong><button data-admin-month="1" ${months.indexOf(adminMonth)>=months.length-1?'disabled':''}>›</button></div><div class="calendar-week">${['일','월','화','수','목','금','토'].map(x=>'<span>'+x+'</span>').join('')}</div><div class="calendar-grid">${cells}</div>`}
function adminInput(label,name,value,type='text',extra=''){return `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`}
function adminText(label,key){return `<label class="field">${label}<textarea name="${key}" rows="3" maxlength="1000">${esc(config[key])}</textarea></label>`}
function adminSiteSettings(){
  const fields=[['organization','학교·기관'],['title','예약 제목'],['beforeTitle','신청 전 제목'],['beforeMessage','신청 전 안내'],['description','신청 중 안내'],['afterTitle','마감 후 제목'],['afterMessage','마감 후 안내'],['privacy','개인정보 안내'],['policy','취소 안내']];
  return `<form data-admin-form="site">${fields.map(([key,label])=>adminText(label,key)).join('')}${adminInput('신청 시작','open',config.open,'datetime-local','required')}${adminInput('신청 마감','close',config.close,'datetime-local','required')}<label class="check-line"><input type="checkbox" name="paused" ${config.paused?'checked':''}>신규 접수 일시 중지</label><button class="book-button">사이트 설정 저장</button></form>`;
}
function adminPreview(){
  const open=new Set(Array.from(document.querySelector('#preview')?.querySelectorAll?.('details[open][data-preview-section]')||[],d=>d.dataset.previewSection));
  const calendar='<div class="month-calendar">'+adminCalendar()+'</div>';
  const rows=adminRows();
  const section=(key,title,body)=>`<details data-preview-section="${key}" ${open.has(key)?'open':''}><summary>${title}</summary>${body}</details>`;
  return `<div class="manage-heading"><h4>운영 관리</h4><div class="manage-actions"><button class="site-control manage-export" data-admin-export>전체 예약 CSV 받기</button><button class="site-control" data-preview-logout>로그아웃</button></div></div>${calendar}<div class="reservation-list-heading"><strong>선택한 날짜의 예약</strong>${previewReservationFilter('day')}</div>${adminReservationTable(rows.filter(({r})=>reservationDay(r)===adminDay),'day')}${section('month','이 달의 예약 · 검색',`<form id="search-form" data-admin-form="filter"><input name="query" aria-label="예약 검색" value="${esc(adminFilter.query)}" placeholder="이름·학급·물품·상태 검색"><button>검색</button></form><div class="reservation-list-heading"><strong>이 달의 예약</strong>${previewReservationFilter('month')}</div>${adminReservationTable(rows.filter(({r})=>reservationDay(r).startsWith(adminMonth)),'month')}<div class="manage-downloads"><button class="site-control" data-preview-backup>월별 백업 받기</button></div>`)}${section('schedule','일정·정원·물품 수량',previewSessionSettings())}${section('content','사이트 설정 · 신청 전·중·후',adminSiteSettings())}${section('add','추가 운영일 만들기',`<form data-admin-form="add-day">${adminInput('날짜','date','','date','required')}<button class="site-control">동일한 시간표로 운영일 추가</button></form>`)}`;
}
function previewSessionSettings(){
  return config.slots.map((slot,i)=>({slot,i})).filter(({slot})=>slot.date===adminDay).map(({slot,i})=>{
    const reserved=demoReservations.filter(r=>activeReservation(r)&&reservationSlot(r)===slot);
    const items=config.kind==='rental'?config.items:[''];
    return items.map(item=>{
      const used=item?reserved.filter(r=>r.rental?.item===item).reduce((n,r)=>n+r.rental.quantity,0):reserved.length;
      const capacity=item?(slot.previewStock?.[item]??config.itemStock[item]):slot.capacity;
      return `<form class="manage-session" data-admin-form="slot" data-slot-index="${i}" data-stock-item="${esc(item)}"><div class="manage-session-title"><strong>${esc(slotText(slot))}${item?' · '+esc(item):''}</strong><small>예약 ${used}${item?'대':capacityUnit()}</small></div><label class="field manage-capacity">${item?'보유 수량':'정원'}<input type="number" name="capacity" min="${Math.max(1,used)}" max="9999" value="${capacity}" required></label><label class="manage-session-toggle"><input type="checkbox" name="closed" ${(item?(slot.previewClosed?.[item]??slot.closed):slot.closed)?'checked':''}>신청 중지</label><button class="site-control" type="submit">저장</button></form>`;
    }).join('');
  }).join('');
}
function previewOperationDialog(title,body){
  const modal=document.querySelector('#modal');
  modal.setAttribute('aria-labelledby','operation-title');
  document.querySelector('#modal-body').innerHTML=`<h3 id="operation-title">${esc(title)}</h3>${body}`;
  modal.showModal();
}
function previewOperationActions(label,danger=false){
  return `<div class="operation-actions"><button type="button" data-preview-dialog-close>돌아가기</button><button class="${danger?'operation-danger':'operation-primary'}" type="submit">${label}</button></div>`;
}
document.addEventListener('submit',e=>{const form=e.target;if(!form.dataset.adminForm)return;e.preventDefault();e.stopImmediatePropagation();const data=new FormData(form),type=form.dataset.adminForm;try{if(type==='cancel'){const r=demoReservations[Number(form.dataset.reservation)];if(!activeReservation(r))throw Error('이미 종료된 예약입니다.');r.status='취소';document.querySelector('#modal').close();renderPreview();toast('예약을 취소했습니다.')}
else if(type==='add-day'){const date=String(data.get('date'));if(!date||config.slots.some(slot=>slot.date===date))throw Error('이미 등록된 운영일입니다.');const sample=config.slots[0]?.date;if(!sample)throw Error('먼저 기준 회차를 만드세요.');adminCommit(next=>next.slots.push(...next.slots.filter(slot=>slot.date===sample).map(slot=>({...slot,date}))),'운영일을 추가했습니다.')}
else if(type==='site'){adminCommit(next=>{for(const k of ['organization','title','beforeTitle','beforeMessage','description','privacy','policy','afterTitle','afterMessage'])next[k]=String(data.get(k)||'').trim();next.open=String(data.get('open'));next.close=String(data.get('close'));next.paused=data.has('paused')},'사이트 설정을 저장했어요.')}else if(type==='period'){adminCommit(next=>{next.open=String(data.get('open'));next.close=String(data.get('close'));next.cancelHours=Number(data.get('cancelHours'));if(!Number.isInteger(next.cancelHours)||next.cancelHours<0||next.cancelHours>8760)throw Error('취소 기한을 확인하세요.');next.paused=data.has('paused')},'신청 운영 설정을 저장했어요.')}else if(type==='slot'){adminCommit(next=>{const slot=next.slots[Number(form.dataset.slotIndex)];const count=Number(data.get('capacity'));if(!Number.isInteger(count)||count<1||count>9999)throw Error('수량은 1~9999로 입력하세요.');if(next.kind==='rental'){const item=form.dataset.stockItem;const used=demoReservations.filter(r=>activeReservation(r)&&r.rental?.item===item&&reservationSlot(r,next)===slot).reduce((n,r)=>n+r.rental.quantity,0);if(count<used)throw Error('현재 예약 수량보다 줄일 수 없습니다.');(slot.previewStock??={})[item]=count;(slot.previewClosed??={})[item]=data.has('closed')}else{slot.capacity=count;slot.closed=data.has('closed')}},'회차 설정을 저장했어요.')}else if(type==='day'){adminDay=String(data.get('day'));renderPreview()}else if(type==='stock'){adminCommit(next=>{next.itemStock[next.items[Number(form.dataset.itemIndex)]]=Number(data.get('stock'))},'물품 수량을 저장했어요.')}else if(type==='add-item'){adminCommit(next=>{const name=String(data.get('item')).trim();if(!name||next.items.includes(name))throw Error('새로운 물품 이름을 입력하세요.');next.items.push(name);next.itemStock[name]=Number(data.get('stock'))},'새 물품을 추가했어요.')}else if(type==='filter'){for(const k of Object.keys(adminFilter))adminFilter[k]=String(data.get(k)||'').trim();renderPreview()}else if(type==='move'){const index=Number(form.dataset.reservation),r=demoReservations[index],target=config.slots[Number(data.get('target'))];if(!activeReservation(r)||!target||slotState(target).kind!=='available')throw Error('신청 가능한 회차를 선택하세요.');const old=JSON.parse(JSON.stringify(r));r.slotKey=slotKey(target);r.slot=slotText(target);r.slotSnapshot=JSON.parse(JSON.stringify(target));if(r.rental)Object.assign(r.rental,{date:target.date,start:target.start,end:target.end});try{guardedConfig(config)}catch(err){Object.assign(r,old);throw err}document.querySelector('#modal').close();adminLog.unshift({at:new Date().toLocaleString('ko-KR'),message:'예약 일정을 변경했어요.'});renderPreview();toast('예약 일정을 변경했어요.')}}catch(err){toast(err.message)}},true);
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;try{if(b.hasAttribute('data-preview-dialog-close')){document.querySelector('#modal').close()}
else if(b.dataset.previewFilter){previewConfirmedOnly[b.dataset.previewFilter]=b.dataset.filterValue==='confirmed';renderPreview()}
else if(b.dataset.previewCancel!==undefined){const r=demoReservations[Number(b.dataset.previewCancel)];if(!activeReservation(r))throw Error('이미 종료된 예약입니다.');previewOperationDialog('이 예약을 취소할까요?',`<p class="operation-summary">${esc(r.slot)}</p><p>취소하면 이 회차의 자리가 다시 열립니다.</p><form data-admin-form="cancel" data-reservation="${b.dataset.previewCancel}">${previewOperationActions('예약 취소하기',true)}</form>`)}
else if(b.hasAttribute('data-preview-logout')){previewMode='applicant';renderPreview()}
else if(b.hasAttribute('data-preview-backup')){download(adminMonth+'-예약백업.json',JSON.stringify(demoReservations.filter(r=>reservationDay(r).startsWith(adminMonth)),null,2),'application/json')}
else if(b.dataset.adminDay){adminDay=b.dataset.adminDay;renderPreview()}else if(b.dataset.adminMonth){const months=[...new Set([...config.slots.map(s=>s.date.slice(0,7)),...demoReservations.map(r=>reservationDay(r).slice(0,7))])].sort();adminMonth=months[Math.max(0,Math.min(months.length-1,months.indexOf(adminMonth)+Number(b.dataset.adminMonth)))];adminDay='';renderPreview()}else if(b.dataset.adminDeleteSlot!==undefined){adminCommit(next=>next.slots.splice(Number(b.dataset.adminDeleteSlot),1),'예약이 없는 회차를 삭제했어요.')}else if(b.dataset.adminDeleteItem!==undefined){adminCommit(next=>{const [item]=next.items.splice(Number(b.dataset.adminDeleteItem),1);delete next.itemStock[item]},'예약이 없는 물품을 삭제했어요.')}else if(b.dataset.adminStatus){const r=demoReservations[Number(b.dataset.reservation)],next=b.dataset.adminStatus,allowed={대기:['확정','거절','취소'],확정:['취소','대여중'],대여중:['반납']};if(!allowed[r.status]?.includes(next))throw Error('현재 상태에서는 해당 처리로 변경할 수 없습니다.');r.status=next;adminLog.unshift({at:new Date().toLocaleString('ko-KR'),message:'예약 상태를 '+next+' 처리했어요.'});renderPreview()}
else if(b.dataset.adminDetail!==undefined){
  const r=demoReservations[Number(b.dataset.adminDetail)];
  previewOperationDialog('예약 상세',`<div class="operation-summary"><strong>${esc(r.slot)}</strong><span>${esc(r.status)}</span></div><dl class="operation-details">${(r.answers||[]).map(a=>`<dt>${esc(a.label)}</dt><dd>${esc(a.value||'—')}</dd>`).join('')}<dt>확인 코드</dt><dd><code>${esc(r.code)}</code></dd></dl><div class="operation-actions"><button type="button" data-preview-dialog-close>닫기</button></div>`);
}else if(b.dataset.adminMove!==undefined){
  const index=Number(b.dataset.adminMove),r=demoReservations[index];
  const targets=config.slots.map((slot,i)=>({slot,i})).filter(({slot})=>slot.date.startsWith(adminMonth)&&slot!==reservationSlot(r)&&slotState(slot).kind==='available'&&(!r.rental||rentalRemaining(r.rental.item,slot)>=r.rental.quantity));
  previewOperationDialog('예약 일정 변경',`<p class="operation-summary"><strong>현재 일정</strong>${esc(r.slot)}</p><form data-admin-form="move" data-reservation="${index}"><label class="operation-field">새 일정<select name="target" required ${targets.length?'':'disabled'}><option value="">${targets.length?'변경할 회차를 선택하세요':'이 달에 변경 가능한 회차가 없습니다'}</option>${targets.map(({slot,i})=>`<option value="${i}">${esc(slotText(slot))}</option>`).join('')}</select></label>${previewOperationActions('일정 변경하기')}</form>`);
}else if(b.hasAttribute('data-admin-export')){
  const rows=demoReservations.map(r=>({snapshot:{...r.slotSnapshot,date:reservationDay(r),item:r.rental?.item},status:r.status==='대기'?'승인 대기':r.status,quantity:r.rental?.quantity||1,answers:r.answers}));
  const title=String(config.title||'예약').replace(/[<>:"/\\|?*]/g,' ').trim()||'예약';
  download(title+' 내역.csv',previewBookingCsv(rows),'text/csv;charset=utf-8');
}}catch(err){toast(err.message)}});

function previewBookingCsv(rows){
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
  const header=['예약일',...(showTime?['회차','시작 시간','종료 시간']:[]),...(showItem?['물품']:[]),'상태','수량 ('+capacityUnit()+')',...columns.values()];
  const records=sorted.map((b,i)=>{
    const p=b.snapshot;
    return [p.date,...(showTime?[p.label,p.start,p.end]:[]),...(showItem?[p.item]:[]),b.status,b.quantity,...[...columns.keys()].map(key=>answers[i].get(key)??'')];
  });
  const quote=value=>'"'+String(value??'').replace(/^(?:[\t\r\n]|\s*[=+@-])/,match=>"'"+match).replace(/"/g,'""')+'"';
  return '\ufeff'+[header,...records].map(row=>row.map(quote).join(',')).join('\r\n');
}

