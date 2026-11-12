// 예약 사이트의 Firebase 프로젝트 ID와 알림을 받을 관리자 이메일을 입력하세요.
const FIREBASE_PROJECT_ID = '여기에-프로젝트-ID';
const ADMIN_EMAIL = '여기에-관리자-이메일';
const CURSOR_KEY = 'bookingNotificationCursor';
const HANDLER = 'checkBookingNotifications';

function setupBookingNotifications() {
  const settings = notificationSettings();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const cursor = loadCursor(properties, settings.project);
    const startedAt = new Date().toISOString();
    fetchBookings(settings.project, cursor || {time:startedAt}, 1);
    if (!MailApp.getRemainingDailyQuota()) throw new Error('오늘의 Gmail 발송 한도를 사용했습니다.');
    MailApp.sendEmail(settings.email, '[예약 알림] 연결 확인', '이 주소로 새 예약과 예약 상태 변경을 알려드립니다.');
    if (!cursor) saveCursor(properties, settings.project, {time:startedAt});
    if (!ScriptApp.getProjectTriggers().some(trigger => trigger.getHandlerFunction() === HANDLER)) {
      ScriptApp.newTrigger(HANDLER).timeBased().everyMinutes(5).create();
    }
  } finally {
    lock.releaseLock();
  }
}

function stopBookingNotifications() {
  for (const trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getHandlerFunction() === HANDLER) ScriptApp.deleteTrigger(trigger);
  }
}

function checkBookingNotifications() {
  const settings = notificationSettings();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const properties = PropertiesService.getScriptProperties();
    const cursor = loadCursor(properties, settings.project);
    if (!cursor || !MailApp.getRemainingDailyQuota()) return;
    const documents = fetchBookings(settings.project, cursor, 100);
    if (!documents.length) return;
    const lines = documents.map(bookingLine);
    MailApp.sendEmail(settings.email, '[예약 알림] ' + documents.length + '건',
      '최근 확인한 예약 내역입니다. 상세 내용은 예약 사이트의 관리자 화면에서 확인하세요.\n\n' + lines.join('\n'));
    const last = documents[documents.length - 1];
    saveCursor(properties, settings.project, {time:last.fields.updatedAt.timestampValue, name:last.name});
  } finally {
    lock.releaseLock();
  }
}

function notificationSettings() {
  const project = FIREBASE_PROJECT_ID.trim();
  const email = ADMIN_EMAIL.trim();
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)) throw new Error('Firebase 프로젝트 ID를 입력하세요.');
  if (!/^[^\s,@;]+@[^\s,@;]+\.[^\s,@;]+$/.test(email)) throw new Error('관리자 이메일 한 개를 입력하세요.');
  return {project,email};
}

function loadCursor(properties, project) {
  const saved = JSON.parse(properties.getProperty(CURSOR_KEY) || 'null');
  return saved && saved.project === project ? saved.cursor : null;
}

function saveCursor(properties, project, cursor) {
  properties.setProperty(CURSOR_KEY, JSON.stringify({project,cursor}));
}

function fetchBookings(project, cursor, limit) {
  const structuredQuery = {
    from:[{collectionId:'bookings'}],
    select:{fields:['updatedAt','createdAt','status','snapshot.date','snapshot.start','snapshot.end'].map(fieldPath=>({fieldPath}))},
    where:{fieldFilter:{field:{fieldPath:'updatedAt'},op:cursor.name?'GREATER_THAN_OR_EQUAL':'GREATER_THAN',value:{timestampValue:cursor.time}}},
    orderBy:[{field:{fieldPath:'updatedAt'},direction:'ASCENDING'},{field:{fieldPath:'__name__'},direction:'ASCENDING'}],
    limit
  };
  if (cursor.name) structuredQuery.startAt = {values:[{timestampValue:cursor.time},{referenceValue:cursor.name}],before:false};
  const url = 'https://firestore.googleapis.com/v1/projects/'+project+'/databases/(default)/documents:runQuery';
  const response = UrlFetchApp.fetch(url, {
    method:'post',contentType:'application/json',payload:JSON.stringify({structuredQuery}),
    headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true
  });
  const status = response.getResponseCode();
  if (status !== 200) throw new Error('Firestore 조회 실패 ('+status+'). 프로젝트 ID와 Google 계정의 Firebase 접근 권한을 확인하세요.');
  return JSON.parse(response.getContentText()).flatMap(row=>row.document?[row.document]:[]);
}

function bookingLine(document) {
  const fields = document.fields;
  const slot = fields.snapshot?.mapValue?.fields || {};
  const statuses = {pending:'승인 대기',confirmed:'확정',cancelled:'취소',rejected:'거절',loaned:'대여 중',returned:'반납'};
  const date = slot.date?.stringValue || '일정 미상';
  const time = [slot.start?.stringValue,slot.end?.stringValue].filter(Boolean).join('~');
  const label = fields.createdAt?.timestampValue === fields.updatedAt?.timestampValue ? '새 예약' : '변경';
  return [label,date,time,statuses[fields.status?.stringValue] || '상태 확인 필요'].filter(Boolean).join(' · ');
}
