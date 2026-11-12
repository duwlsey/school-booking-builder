const fs=require('node:fs'),path=require('node:path'),readline=require('node:readline');
function parseWebConfig(raw){
 let source=raw.trim();if(/private_key|service_account|client_email/.test(source))throw Error('서비스 계정 키는 사용할 수 없습니다. 웹 앱의 공개 구성만 복사해 주세요.');
 const declaration=source.match(/\b(?:const|let|var)\s+firebaseConfig\s*=\s*(\{(?:[^"{}]|"(?:\\.|[^"\\])*")*\})/);
 if(declaration)source=declaration[1];
 else if(!source.startsWith('{'))throw Error('Firebase 콘솔에서 구성 탭을 선택하고 firebaseConfig 코드 전체를 복사해 주세요.');
 source=source.replace(/;\s*$/,'').replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g,'$1"$2"$3').replace(/,\s*([}\]])/g,'$1');
 const value=JSON.parse(source),keys=['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'];const config=Object.fromEntries(keys.filter(k=>typeof value[k]==='string').map(k=>[k,value[k]]));
 if(!config.apiKey||!config.appId||!config.authDomain||!/^[-a-z0-9]{4,64}$/.test(config.projectId))throw Error('구성을 끝까지 복사했는지 확인해 주세요.');return config;
}
if(require.main===module){
 console.log('Firebase 콘솔 → 설정 → 일반 → 내 앱 → SDK 설정 및 구성 → 구성을 선택하세요.\n코드 상자의 복사 버튼을 누르고 아래에 그대로 붙여넣으세요. JSON으로 고칠 필요가 없습니다.\n붙여넣은 뒤 빈 줄에서 Enter를 한 번 더 누르면 저장합니다.\n비밀번호나 서비스 계정 비밀 키는 넣지 마세요.\n');
 const input=readline.createInterface({input:process.stdin,output:process.stdout});
 const lines=[];
 let closed=false;
 input.on('line',line=>{
  if(closed)return;
  if(!line.trim()&&lines.length){
   try{parseWebConfig(lines.join('\n'));input.close();return}
   catch{ /* A pasted SDK example may contain blank lines before firebaseConfig. */ }
  }
  lines.push(line);
 });
 input.on('close',()=>{
  closed=true;
  try{
   const config=parseWebConfig(lines.join('\n'));
   fs.writeFileSync(path.join(__dirname,'public','firebase-config.json'),JSON.stringify(config,null,2));
   fs.writeFileSync(path.join(__dirname,'.firebaserc'),JSON.stringify({projects:{default:config.projectId}},null,2));
   console.log('공개 설정 저장 완료\n배포 대상: '+config.projectId+'\n다음: firebase login → npm run deploy');
  }catch(err){
   console.error('설정을 저장하지 않았습니다. '+err.message);
   process.exitCode=1;
  }
 });
}
module.exports={parseWebConfig};
