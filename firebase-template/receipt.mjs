export function receiptCode(value){
  const text=String(value||'').trim();
  if(/^[a-f0-9]{48}$/.test(text))return text;
  try{const hash=text.startsWith('#')?text:new URL(text).hash;const code=new URLSearchParams(hash.slice(1)).get('reservation')||'';return /^[a-f0-9]{48}$/.test(code)?code:''}catch{return ''}
}
export function receiptLink(code,url){
  code=receiptCode(code);if(!code)throw Error('예약 확인 정보를 확인해 주세요.');
  const link=new URL(url);link.search='';link.hash='reservation='+code;return link.href;
}
export function completionTitle(status){return status==='pending'?'신청이 접수되었습니다.':'예약이 확정되었습니다.'}
