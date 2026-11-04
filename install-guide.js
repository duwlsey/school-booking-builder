/* Manual installation checklist. Ticks never claim a verified connection. */
let installStep=0,installChecks={};
const INSTALL_GUIDE=[
{title:'코드 받고 압축 풀기',where:'도우미 → Firebase 설치 패키지',text:'선택한 세트·디자인·일정·신청 항목과 실행 코드를 ZIP으로 받습니다. 압축을 풀고 시작하기.html을 엽니다.',checks:['Firebase 설치 패키지를 내려받았어요','압축을 풀고 시작하기.html을 열었어요'],action:'download'},
{title:'Google 계정 준비·로그인',where:'Firebase 콘솔 → Google 로그인',text:'기존 Google 계정이 있으면 새로 가입할 필요가 없습니다. 없으면 Google 계정을 만들고 로그인합니다. 비밀번호는 Google 화면에만 입력하세요.',checks:['사용할 Google 계정을 준비했어요','Firebase 콘솔에 로그인했어요'],link:'https://console.firebase.google.com/',image:'01-console-start.jpg',caption:'로그인 후 Firebase 프로젝트 시작 화면 · 2026-11-02 직접 캡처'},
{title:'새 Firebase 프로젝트 만들기',where:'Firebase 프로젝트를 설정하여 시작하기',text:'새 프로젝트 이름을 입력합니다. 예: school-booking-guide-demo. 기존 운영 프로젝트는 선택하지 않습니다. 약관은 직접 읽고 선택하세요. Google 개발자 프로그램 가입은 선택 사항입니다.',checks:['새 프로젝트 이름을 입력했어요','프로젝트 ID를 확인했어요','약관과 선택 가입 항목을 직접 확인했어요'],link:'https://console.firebase.google.com/',image:'03-project-name-filled.jpg',caption:'프로젝트 이름·약관·선택 가입 항목 · 2026-11-02 직접 캡처'},
{title:'선택 기능 확인·프로젝트 생성',where:'Gemini 설정 → Google Analytics 설정',text:'예약 사이트에는 Gemini와 Google Analytics가 필수는 아닙니다. 무료 기본 안내에서는 두 선택 기능을 끄는 구성을 사용합니다. 마지막 생성 버튼을 누른 후 프로젝트 대시보드가 나오는지 확인하세요.',checks:['Gemini 선택을 확인했어요','Google Analytics 선택을 확인했어요','프로젝트 대시보드가 열렸어요'],image:'04-gemini-option.jpg',secondaryImage:'05-analytics-off.jpg',caption:'Gemini 선택 화면 · 2026-11-02 직접 캡처'},
{title:'웹 앱 등록하기',where:'프로젝트 개요 → 앱 추가 → 웹 아이콘 </>',text:'웹 앱 닉네임(예: school-booking-site)을 입력하고 앱 등록을 누릅니다. 이 단계의 Hosting 체크는 비워 둡니다. SDK 코드는 이미 패키지에 있으므로 npm install firebase 명령을 따로 실행하지 않습니다. 설정 값의 위치를 확인하고 콘솔로 이동을 누릅니다. 서비스 계정 키를 만드는 단계가 아닙니다.',checks:['웹 앱을 등록했어요','웹 앱 공개 설정의 위치를 확인했어요'],link:'https://firebase.google.com/docs/web/setup',image:'08-web-app-register.jpg',caption:'웹 앱 닉네임 입력 · Hosting 체크 해제 · 직접 캡처'},
{title:'예약 저장소 만들기',where:'데이터베이스 및 스토리지 → Firestore → 데이터베이스 만들기',text:'Standard 버전 → 다음 → 데이터베이스 ID (default) → 위치 asia-northeast3 (Seoul) → 다음 → 프로덕션 모드에서 시작 → 다음 순서로 진행합니다. 위치는 생성 후 변경할 수 없습니다. 예약된 백업은 유료 Blaze 기능이므로 업그레이드하지 않고 만들기를 누릅니다. 뒤의 배포 단계에서 패키지의 보안 규칙을 함께 적용합니다.',checks:['Cloud Firestore 데이터베이스를 만들었어요','데이터베이스 위치를 확인했어요'],link:'https://firebase.google.com/docs/firestore/quickstart',image:'10-firestore-standard.jpg',caption:'Firestore Standard 버전 선택 · 직접 캡처',screens:[{file:'11-firestore-location.jpg',caption:'기본 데이터베이스 · 서울 위치 선택'},{file:'12-firestore-production.jpg',caption:'프로덕션 모드 · 기본 읽기/쓰기 차단'},{file:'13-firestore-no-backup.jpg',caption:'유료 예약 백업 건너뛰고 만들기'}]},
{title:'신청자·관리자 로그인 방식 켜기',where:'보안 → Authentication → 로그인 방법',text:'익명(Anonymous)과 이메일/비밀번호(Email/Password)를 각각 활성화하고 저장합니다. 익명 인증은 신청자에게 로그인 화면을 요구하지 않고 요청을 처리할 때 사용합니다.',checks:['익명 로그인을 사용 설정하고 저장했어요','이메일/비밀번호를 사용 설정하고 저장했어요'],link:'https://firebase.google.com/docs/auth/web/anonymous-auth',image:'15-anonymous-auth.jpg',caption:'익명 로그인 사용 설정 위치 · 직접 캡처',screens:[{file:'16-email-auth.jpg',caption:'이메일/비밀번호만 켜기 · 이메일 링크는 끄기'},{file:'17-auth-ready.jpg',caption:'두 제공업체가 사용 설정됨인지 확인'}]},
{title:'관리자 계정·권한 지정하기',where:'Authentication → 사용자 / Firestore → 데이터',text:'사용자 추가에서 관리자 이메일과 비밀번호를 직접 정합니다. 생성된 UID를 복사합니다. Firestore에서 admins 컬렉션을 만들고 문서 ID에 관리자 UID를 넣습니다. enabled 필드를 추가하고 유형은 boolean, 값은 참(true)으로 저장합니다. 자동 ID는 사용하지 않습니다. 화면의 예시 UID를 따라 쓰지 말고 방금 만든 본인 계정의 UID를 사용합니다. 비밀번호를 도우미나 코드에 넣지 않습니다.',checks:['관리자 이메일 계정을 만들었어요','관리자 UID를 확인했어요','admins / 관리자 UID / enabled: true를 저장했어요'],image:'18-admin-create.jpg',caption:'관리자 이메일·비밀번호 직접 입력 화면 · 직접 캡처',screens:[{file:'19-admin-collection.jpg',caption:'Firestore 데이터 → 컬렉션 시작 → admins 입력'},{file:'20-admin-permission.jpg',caption:'문서 ID는 본인 관리자 UID · enabled의 유형 boolean · 값 참(true)'}]},
{title:'내 컴퓨터의 배포 도구 준비',where:'내려받은 폴더 → 터미널',text:'Node.js LTS를 설치합니다. 압축을 푼 폴더에서 터미널을 열어 아래 명령을 실행합니다. 터미널은 명령을 입력하는 창입니다.',commands:['npm install -g firebase-tools','firebase --version'],checks:['Node.js LTS를 설치했어요','Firebase CLI 버전이 표시돼요'],link:'https://nodejs.org/',screenPending:true},
{title:'내 프로젝트 공개 설정 입력',where:'프로젝트 설정 → 내 앱 → SDK 설정 및 구성',text:'웹 앱의 firebaseConfig 공개 값을 JSON 한 줄로 준비합니다. 아래 설정 도구를 실행해 입력합니다. 도구가 표시한 프로젝트 ID가 본인 새 프로젝트인지 확인합니다. 입력 예시는 ZIP 안 시작하기.html에 있습니다.',commands:['npm run configure'],checks:['웹 앱 공개 설정을 입력했어요','저장된 대상 프로젝트 ID를 확인했어요'],screenPending:true},
{title:'로그인하고 사이트 배포',where:'내려받은 폴더 → 터미널',text:'Firebase 프로젝트를 소유한 Google 계정으로 로그인합니다. 배포 명령은 Hosting과 Firestore 규칙을 함께 적용합니다. 성공 문구와 Hosting URL을 본인이 확인해야 합니다.',commands:['firebase login','npm run deploy'],checks:['올바른 Google 계정으로 로그인했어요','배포 명령이 오류 없이 끝났어요','출력된 Hosting URL을 열었어요'],link:'https://firebase.google.com/docs/hosting/quickstart',screenPending:true},
{title:'첫 관리자 설정·운영 전 점검',where:'배포한 사이트 → 관리자',text:'관리자 로그인 후 선택한 구성으로 초기 자료 만들기를 실행합니다. 본인이 선택한 일정·항목·물품 수량이 맞는지 확인하세요. 실제 접수 전 빈 테스트 데이터로 예약 저장·취소·권한·동시 신청을 검증합니다.',checks:['관리자 로그인과 초기 자료 생성을 확인했어요','신청 전·중·후 문구와 일정·항목을 확인했어요','마지막 자리 동시 신청과 물품 잔여 수량을 시험했어요','관리자가 아닌 계정의 접근 차단을 확인했어요','예약 조회·취소·재고 복구·백업을 확인했어요'],screenPending:true}
];
for(const step of INSTALL_GUIDE){delete step.image;delete step.secondaryImage;delete step.screens;step.screenPending=true;}
INSTALL_GUIDE[0].screenPending=false;
INSTALL_GUIDE[1].screenPending=false;
const projectNameStep=INSTALL_GUIDE.find(s=>s.title==='새 Firebase 프로젝트 만들기');
Object.assign(projectNameStep,{
 where:'Firebase 콘솔 → 새 프로젝트 시작 → 프로젝트 만들기',
 text:'학교 예약 사이트를 위한 새 프로젝트를 만듭니다. 사진의 이름은 예시이므로, 본인이 알아보기 쉬운 이름을 입력하세요.',
 directions:[
 '이전 단계에서 로그인한 Firebase 콘솔에서 Firebase 프로젝트를 설정하여 시작하기 또는 새 프로젝트 만들기를 누릅니다.',
 '프로젝트 이름 칸에 원하는 이름을 입력합니다. 예: school-booking-2026. 기존에 운영 중인 프로젝트는 선택하지 않습니다.',
 '이름 아래의 프로젝트 ID를 확인합니다. 같은 ID가 있으면 숫자 등이 자동으로 붙을 수 있습니다. 사진 속 ID와 같을 필요가 없습니다.',
 'Firebase 약관 링크를 열어 직접 읽고, 동의하는 경우 약관 동의 항목을 선택합니다.',
 'Google 개발자 프로그램 가입은 선택 사항입니다. 이 설치 안내에서는 가입 선택을 끈 상태로 진행합니다.',
 '계속을 눌러 다음 선택 기능 화면으로 이동합니다. 아직 이 단계에서는 프로젝트 생성이 끝난 것이 아닙니다.'
 ],
 image:'02-project-create.jpg',caption:'1. 프로젝트 이름을 입력하는 첫 화면 · 개발자 프로그램 가입은 선택 사항입니다.',screens:[{file:'03-project-name-filled.jpg',caption:'2. 이름 입력 후 프로젝트 ID 확인 → 약관·선택 가입 확인 → 계속'}],screenPending:false,
 tip:'계속 버튼이 비활성화되어 있으면 프로젝트 이름과 약관 동의 여부를 확인하세요. 화면 이름이 조금 달라도 새 프로젝트를 만드는 항목을 선택하면 됩니다. 비밀번호는 Google 로그인 화면에만 입력하세요.',
 checks:['새 프로젝트 이름을 입력했어요','자동으로 정해진 프로젝트 ID를 확인했어요','약관과 선택 가입 항목을 확인하고 계속을 눌렀어요']
});
const projectOptionsStep=INSTALL_GUIDE.find(s=>s.title==='선택 기능 확인·프로젝트 생성');
Object.assign(projectOptionsStep,{
 text:'Gemini와 Google 애널리틱스는 선택 사항입니다. 두 기능을 켜거나 꺼도 예약 사이트를 만들 수 있습니다. 아래 캡처는 두 기능을 끄고 진행한 예시입니다.',
 directions:[
 'Firebase 프로젝트를 위한 AI 지원 화면에서 Gemini 사용 여부를 선택하고 계속을 누릅니다. Firebase 설정·개발을 돕는 AI 기능이며 예약 사이트의 필수 기능은 아닙니다.',
 'Google 애널리틱스는 방문·이용 통계를 보는 선택 기능입니다. 사용 여부를 선택합니다. 켠 경우에는 이어지는 안내에서 애널리틱스 계정을 선택하거나 생성합니다.',
 '프로젝트 만들기를 누릅니다. 생성 중에는 기다리고, 같은 프로젝트를 중복해서 만들지 않습니다.',
 '준비 완료 화면이 나오면 계속 또는 콘솔로 이동을 눌러 프로젝트 대시보드를 엽니다.',
 '대시보드에서 본인이 입력한 프로젝트 이름과 요금제 Spark 또는 무료($0/월) 표시를 확인합니다. 업그레이드는 누르지 않습니다.',
 '이제 다음 웹 앱 등록하기 단계로 이동합니다. 저장소와 관리자 계정은 뒤 단계에서 따로 설정합니다.'
 ],
 image:'04-gemini-option.jpg',caption:'1. Firebase의 Gemini 사용 설정을 끄고 계속 · 실제 캡처',secondaryImage:'05-analytics-off.jpg',screenPending:false,
 tip:'두 기능의 선택은 예약 기능 사용 여부와 별개입니다. 애널리틱스를 켜면 계정 선택 등 추가 화면이 나올 수 있으며 정상적인 과정입니다. 아래 사진과 같은 경로로 따라가려면 두 기능을 끄면 됩니다. 캡처는 2026년 11월 기준입니다.',
 checks:['Gemini 설명을 읽고 사용 여부를 선택했어요','Google 애널리틱스 설명을 읽고 사용 여부를 선택했어요','프로젝트 생성 후 대시보드가 열렸어요','프로젝트 이름과 무료 Spark 요금제를 확인했어요']
});
const webAppStep=INSTALL_GUIDE.find(s=>s.title==='웹 앱 등록하기');
Object.assign(webAppStep,{
 where:'프로젝트 개요 → 앱 추가 → 웹 아이콘 </>',
 text:'Firebase에 이 예약 사이트를 웹 앱으로 등록합니다. 등록만으로 사이트가 공개되거나 예약 접수가 시작되지는 않습니다.',
 directions:[
 'Firebase 콘솔 왼쪽의 프로젝트 개요를 엽니다. 앞에서 만든 본인 프로젝트 이름이 맞는지 확인합니다.',
 '앱 추가를 누르고 웹을 뜻하는 </> 아이콘을 선택합니다. 아직 등록한 앱이 없으면 웹 아이콘이 개요 화면에 바로 보일 수도 있습니다.',
 '웹 앱에 Firebase 추가 화면에서 앱 닉네임을 입력합니다. 예: school-booking-site. 닉네임은 Firebase 콘솔에서 구분하는 이름이며, 신청자에게 보이는 예약 제목은 도우미에서 정한 제목을 사용합니다.',
 '또한 이 앱의 Firebase 호스팅을 설정하세요 체크는 이 안내에서는 비워 둡니다. Hosting 배포는 뒤 단계에서 내려받은 파일로 진행합니다.',
 '앱 등록을 누르고 완료될 때까지 기다립니다. 같은 웹 앱을 여러 번 등록할 필요는 없습니다.',
 'Firebase SDK 추가 화면이 나오면 앱 등록이 완료된 상태입니다. SDK는 내려받은 패키지에 이미 포함되어 있으므로 여기의 npm install firebase 명령이나 코드 예제를 따로 실행·편집하지 않습니다.',
 '아래로 내려 콘솔로 이동을 누릅니다. 프로젝트 개요에 등록한 앱이 표시되는지 확인합니다.',
 '이후 공개 설정 입력 단계에서 설정 → 일반 → 내 앱 → SDK 설정 및 구성 → 구성의 복사 버튼을 사용합니다. 지금 서비스 계정 키를 만들거나 비밀번호를 도우미에 입력할 필요는 없습니다.'
 ],
 image:'08-web-app-register.jpg',caption:'1. 웹 앱 닉네임 입력 → 이 안내에서는 Hosting 체크를 비워 두고 앱 등록',screenPending:false,
 screens:[{file:'09-web-sdk.jpg',caption:'2. Firebase SDK 추가 화면이 나오면 등록 완료. 이 화면의 설치 명령은 따로 실행하지 않고, 아래의 콘솔로 이동을 누릅니다.'}],
 tip:'이미 등록한 웹 앱이 있으면 설정 → 일반 → 내 앱에서 닉네임을 확인하고 재사용하세요. Android·Apple 앱이 아니라 웹 앱을 선택해야 합니다. SDK는 사이트 실행에 필요한 Firebase 연결 도구를 뜻하며, 패키지에 포함되어 있습니다.',
 checks:['본인 프로젝트에서 웹 앱을 선택했어요','웹 앱 닉네임을 입력하고 앱 등록을 마쳤어요','콘솔로 돌아와 등록한 웹 앱을 확인했어요']
});
const firestoreStep=INSTALL_GUIDE.find(s=>s.title==='예약 저장소 만들기');
Object.assign(firestoreStep,{
 text:'예약 일정과 신청 내역을 저장할 Cloud Firestore 데이터베이스를 만듭니다. 이 단계에서는 저장소만 준비하며, 실제 일정은 사이트 배포 후 초기 설정에서 넣습니다.',
 directions:[
 '본인 Firebase 프로젝트에서 데이터베이스 및 스토리지 → Firestore를 열고 데이터베이스 만들기를 누릅니다. Realtime Database와는 다른 항목입니다.',
 '버전 선택에서 Standard 버전을 선택하고 다음을 누릅니다. 이 패키지는 Standard 버전으로 설치·시험한 구성입니다.',
 '데이터베이스 ID는 (default)를 그대로 사용합니다. 패키지가 이 기본 저장소에 연결하도록 되어 있습니다.',
 '위치에서 asia-northeast3 (Seoul)을 선택하고 다음을 누릅니다. 이는 이 안내의 서울 위치 예시이며, 학교에서 정한 데이터 저장 위치가 있으면 그 기준을 먼저 따르세요. 생성 후에는 같은 데이터베이스의 위치를 변경할 수 없습니다.',
 '구성 화면에서 프로덕션 모드에서 시작을 선택하고 다음을 누릅니다. 화면의 읽기·쓰기 거부 문구는 초기 자료를 비공개로 두기 위한 정상적인 표시입니다.',
 '예약된 백업은 선택 기능입니다. 무료 기본 안내에서는 매일·매주를 선택하거나 프로젝트를 업그레이드하지 않고 만들기를 누릅니다. 이 선택은 예약 기능 설치와 별개입니다.',
 '데이터베이스 생성이 끝날 때까지 기다립니다. 데이터 탭이 열리고 (default)와 컬렉션 시작이 보이면 기본 저장소가 준비된 것입니다. 표시된 데이터베이스 위치도 확인합니다.',
 '지금은 예약 자료가 없는 것이 정상입니다. 임의의 예약 데이터를 직접 추가하거나 보안 규칙을 공개로 바꿀 필요는 없습니다. 패키지의 규칙은 뒤의 배포 명령이 적용하며, 관리자 계정·권한은 다음 안내에서 따로 준비합니다.'
 ],
 image:'10-firestore-standard.jpg',caption:'1. Standard 버전 선택 → 다음 · 실제 캡처',screenPending:false,
 screens:[
 {file:'11-firestore-location.jpg',caption:'2. 데이터베이스 ID (default) 유지 → 저장 위치 확인 → 다음'},
 {file:'12-firestore-production.jpg',caption:'3. 프로덕션 모드에서 시작 → 다음. 초기 읽기·쓰기 차단은 정상입니다.'},
 {file:'13-firestore-no-backup.jpg',caption:'4. 예약된 백업은 선택 사항. 이 무료 안내에서는 업그레이드하지 않고 만들기'},
 {file:'14-firestore-ready.jpg',caption:'5. 데이터 탭에 (default)와 컬렉션 시작이 보이면 생성 완료. 아직 예약 자료가 없어도 정상입니다.'}
 ],
 tip:'Firestore 데이터 화면이 이미 열리면 새 데이터베이스를 중복으로 만들지 말고 (default)가 있는지 확인하세요. 배포 전에는 사이트에서 읽기·쓰기가 막혀 있어도 정상입니다. 배포 후 권한 오류가 나면 패키지의 Firestore 규칙 배포가 성공했는지 확인하세요. 캡처는 2026년 11월 기준이며 화면 구성은 달라질 수 있습니다.',
 checks:['Firestore Standard 버전의 기본 데이터베이스 (default)를 준비했어요','저장 위치를 확인하고 선택했어요','프로덕션 모드로 생성했어요','생성 후 데이터 탭과 데이터베이스 위치를 확인했어요']
});
const authProviderStep=INSTALL_GUIDE.find(s=>s.title==='신청자·관리자 로그인 방식 켜기');
Object.assign(authProviderStep,{
 text:'신청자에게 로그인 화면을 띄우지 않으면서 예약을 처리할 익명 인증과, 관리자용 이메일·비밀번호 로그인을 준비합니다. 이 단계는 로그인 방식을 켜는 작업이며, 관리자 계정은 다음 단계에서 만듭니다.',
 directions:[
 '본인 프로젝트에서 보안 → Authentication을 엽니다. 처음 사용하는 경우 시작하기를 누르고 로그인 방법 탭으로 이동합니다.',
 '새 제공업체 추가 또는 제공업체 목록에서 익명(Anonymous)을 선택합니다.',
 '익명의 사용 설정 스위치를 켜고 저장을 누릅니다. 신청자가 이메일이나 비밀번호를 입력하지 않아도 사이트가 내부적으로 인증을 처리하는 방식입니다. 캡처는 켜기 전 위치를 보여주며, 저장 버튼이 안 보이면 화면 아래쪽까지 확인하세요.',
 '자동 정리는 이 설치 안내에서 사용하는 기능이 아니므로 기존 설정을 그대로 둡니다.',
 '로그인 방법 목록으로 돌아와 새 제공업체 추가 → 이메일/비밀번호(Email/Password)를 선택합니다.',
 '위쪽 이메일/비밀번호의 사용 설정을 켭니다. 아래쪽 이메일 링크(비밀번호가 없는 로그인)는 이 사이트에서 사용하지 않으므로 켜지 않고 저장을 누릅니다.',
 '로그인 방법 목록에 이메일/비밀번호와 익명이 모두 나타나고, 각각 사용 설정됨으로 표시되는지 확인합니다.',
 '두 방식이 이미 사용 설정되어 있다면 다시 추가할 필요가 없습니다. 다음 단계로 넘어가 사이트 관리자용 계정을 만듭니다.'
 ],
 image:'15-anonymous-auth.jpg',caption:'1. 익명 선택 → 오른쪽 사용 설정 켜기 → 저장. 캡처는 켜기 전 화면입니다.',screenPending:false,
 screens:[
 {file:'16-email-auth.jpg',caption:'2. 위쪽 이메일/비밀번호만 켜기 → 저장. 아래 이메일 링크는 사용하지 않습니다.'},
 {file:'17-auth-ready.jpg',caption:'3. 목록에서 이메일/비밀번호와 익명이 모두 사용 설정됨인지 확인'}
 ],
 tip:'목록에 이메일/비밀번호가 있어도 사이트 관리자 계정이 저절로 만들어지지는 않습니다. 다음 단계의 계정 생성과 권한 지정까지 마쳐야 관리자 메뉴를 사용할 수 있습니다. 캡처의 프로젝트 이름은 예시이며 본인 프로젝트에서 진행하세요.',
 checks:['익명 로그인 사용 설정을 켜고 저장했어요','이메일/비밀번호 사용 설정을 켜고 저장했어요','목록에서 두 방식 모두 사용 설정됨인지 확인했어요']
});
const adminAccountStep=INSTALL_GUIDE.find(s=>s.title==='관리자 계정·권한 지정하기');
Object.assign(adminAccountStep,{
 text:'사이트 관리자용 계정을 만든 뒤, 그 계정에만 운영 권한을 지정합니다. 계정 만들기와 권한 지정은 서로 다른 작업이므로 둘 다 완료해 주세요.',
 directions:[
 'Firebase 콘솔에서 앞서 만든 본인 프로젝트를 선택합니다. 보안 → Authentication → 사용자 탭을 엽니다.',
 '사용자 추가를 누릅니다. 관리자 이메일과 사이트에서 사용할 비밀번호를 직접 정하고 사용자 추가를 누릅니다. Google 계정 비밀번호와 같을 필요는 없습니다.',
 '사용자 목록에 방금 만든 이메일이 나타나는지 확인합니다. 그 행의 사용자 UID 옆 복사 아이콘을 누릅니다. UID는 계정마다 붙는 고유번호이며 이메일 주소와는 다릅니다.',
 '데이터베이스 및 스토리지 → Firestore → 데이터 탭을 엽니다. 컬렉션 시작을 누르고 컬렉션 ID에 admins를 소문자로 입력한 뒤 다음을 누릅니다.',
 '첫 번째 문서 추가 화면의 문서 ID 칸에 방금 복사한 UID를 붙여넣습니다. 자동 ID 버튼은 누르지 않습니다.',
 '필드에는 enabled를 소문자로 입력합니다. 유형을 string에서 boolean으로 바꾸고, 값은 참(true)을 선택합니다. 문자열로 true를 적는 방식이 아닙니다.',
 '저장을 누릅니다. 데이터 화면에서 admins → 본인 UID 문서를 열어 enabled: true와 (boolean)이 보이는지 확인합니다.',
 '이 단계에서는 사이트에 로그인하지 않습니다. 뒤의 배포 단계가 끝난 후, 여기서 정한 관리자 이메일·비밀번호로 사이트에 로그인합니다.'
 ],
 image:'18-admin-create.jpg',caption:'1. Authentication → 사용자 추가 · 관리자 이메일·비밀번호는 직접 입력',screenPending:false,
 screens:[{file:'19-admin-collection.jpg',caption:'2. Firestore → 컬렉션 시작 · admins 입력 후 다음'},{file:'20-admin-permission.jpg',caption:'3. 본인 UID 붙여넣기 → enabled / boolean / 참 → 저장. 사진의 UID는 예시이므로 따라 쓰지 마세요.'}],
 tip:'사용자 추가가 비활성화되어 있으면 이전 단계에서 이메일/비밀번호 로그인을 켰는지 확인하세요. 배포 후 관리자 권한이 없다고 나오면 문서 ID가 본인 UID와 정확히 같은지, enabled의 유형이 boolean이고 값이 참인지 확인하세요. 비밀번호와 UID는 도우미에 입력하거나 채팅으로 보낼 필요가 없습니다.',
 checks:['사이트 관리자용 이메일·비밀번호 계정을 만들었어요','만든 계정 행에서 UID를 복사했어요','admins 문서 ID에 본인 UID를 붙여넣었어요','enabled의 유형 boolean과 값 참(true)을 확인하고 저장했어요']
});
const deployToolsStep=INSTALL_GUIDE.find(s=>s.title==='내 컴퓨터의 배포 도구 준비');
Object.assign(deployToolsStep,{
 where:'내 컴퓨터 → Node.js 설치 → 압축을 푼 폴더 → 명령 입력 창',
 text:'사이트 파일을 Firebase에 보내는 도구를 내 컴퓨터에 한 번 설치합니다. 아래는 Windows 기준이며, 코드를 직접 작성할 필요 없이 명령을 한 줄씩 복사해 실행하면 됩니다.',
 directions:[
 '아래 공식 사이트에서 LTS 표시와 Windows 선택을 확인합니다. 위쪽 fnm·PowerShell 명령은 복사하지 말고 아래쪽 Or get a prebuilt Node.js의 Windows Installer(.msi) 버튼으로 설치 파일을 받습니다. Standalone Binary(.zip)와는 다른 버튼입니다. Node.js와 명령 실행 도구 npm이 함께 설치됩니다.',
 '설치 화면의 안내에 따라 설치를 마칩니다. 설치가 끝나면 기존에 열려 있던 명령 입력 창을 닫고 새로 엽니다.',
 '파일 탐색기에서 내려받은 ZIP의 압축을 풉니다. ZIP 안을 바로 열어 작업하지 말고, 압축을 푼 폴더에서 package.json과 setup.cjs가 보이는 위치로 들어갑니다. public 폴더 안으로 들어가는 것이 아닙니다.',
 '파일 탐색기 위쪽 주소 표시줄을 클릭하고 cmd를 입력한 뒤 Enter를 누릅니다. 이 폴더에서 명령 프롬프트라는 입력 창이 열립니다. macOS에서는 같은 폴더 위치에서 터미널을 엽니다.',
 '아래 node --version을 복사해 실행합니다. v로 시작하는 버전 숫자가 나오면 Node.js가 준비된 것입니다.',
 '다음 명령 npm install -g firebase-tools를 복사해 실행하고, 입력할 수 있는 줄이 다시 나타날 때까지 기다립니다. Firebase CLI라는 배포 도구를 설치하는 명령입니다. 이 명령만으로 사이트가 공개되거나 계정에 로그인되지는 않습니다.',
 '마지막으로 firebase --version을 실행합니다. 버전 숫자가 표시되면 설치 완료입니다. 이미 두 도구의 버전이 정상 표시되면 다시 설치하지 않아도 됩니다.',
 '이 창을 그대로 두고 다음 단계에서 본인 프로젝트의 공개 설정을 입력합니다. firebase init 명령은 실행하지 않습니다. 필요한 배포 설정 파일은 패키지에 이미 들어 있습니다.'
 ],
 image:'31-node-download.jpg',caption:'Node.js 공식 다운로드 실제 화면 · LTS / Windows 확인 → 아래쪽 Windows Installer (.msi). 버전 숫자는 달라질 수 있습니다.',screenPending:false,
 commands:['node --version','npm install -g firebase-tools','firebase --version'],
 tip:'node 또는 npm을 찾을 수 없으면 Node.js 설치 후 창을 닫고 다시 여세요. PowerShell에서 스크립트 실행 정책 오류가 나면 정책을 변경하지 말고 위 안내대로 cmd 창에서 실행하세요. package.json을 찾을 수 없다는 오류는 압축을 푼 폴더 위치를 확인하세요. 설치가 오류로 끝나거나 학교 컴퓨터에서 설치가 제한되면 오류 내용을 확인한 뒤 진행하세요. 경고(warn)만으로 실패를 판단하지 말고 마지막 버전 확인까지 해 주세요.',
 checks:['Node.js LTS를 설치하고 버전 숫자를 확인했어요','압축을 푼 폴더에서 package.json과 setup.cjs를 확인했어요','그 폴더에서 명령 입력 창을 열었어요','Firebase CLI 설치 후 버전 숫자를 확인했어요']
});
const deploySiteStep=INSTALL_GUIDE.find(s=>s.title==='로그인하고 사이트 배포');
Object.assign(deploySiteStep,{
 where:'압축을 푼 폴더의 명령 입력 창 → Google 로그인 → 배포된 사이트',
 text:'본인 Firebase 프로젝트를 만든 Google 계정으로 로그인하고, 준비된 파일과 보안 규칙을 함께 배포합니다. 도우미의 미리보기와 달리 이 단계가 끝나면 접속할 수 있는 사이트 주소가 생깁니다.',
 directions:[
 '공개 설정 저장 완료와 배포 대상 프로젝트 ID를 확인한 뒤, 같은 폴더의 명령 입력 창에서 firebase login을 실행합니다. 이 로그인은 사이트 관리자용 이메일·비밀번호 로그인과 다릅니다.',
 '브라우저가 열리면 Firebase 프로젝트를 만든 Google 계정을 선택합니다. Firebase CLI 접근 권한 안내를 직접 확인하고 로그인을 완료합니다. 부가 기능이나 사용 정보 수집 질문은 원하는 대로 선택하세요. --no-localhost 방식에서 아래 확인 화면이 나오면 본인이 방금 해당 명령을 실행한 경우에만 Yes, I just ran this command를 누릅니다. 이후 표시되는 인증 코드는 본인 명령 입력 창에서만 사용합니다.',
 '명령 입력 창으로 돌아와 로그인 성공과 계정 이메일을 확인합니다. 이미 로그인되어 있다는 메시지가 나와도 본인 프로젝트를 사용할 계정이 맞는지 확인하세요. 다른 계정이면 firebase login --reauth를 실행해 다시 로그인합니다.',
 '이제 npm run deploy를 실행합니다. 처음 표시되는 배포 대상이 본인 프로젝트 ID인지 확인하세요. 다른 프로젝트라면 진행을 중단하고 이전 공개 설정 입력 단계에서 본인 프로젝트의 구성을 다시 저장합니다.',
 '명령이 끝날 때까지 창을 닫지 않습니다. 이 패키지는 사이트 화면(Hosting)과 예약 데이터 접근 규칙(Firestore rules)을 함께 배포합니다. Hosting만 따로 배포하는 명령으로 바꾸지 마세요.',
 '마지막에 Deploy complete!와 Hosting URL이 표시되는지 확인합니다. 중간에 화면 업로드 성공이 보여도 마지막에 Error가 있으면 전체 설치가 완료된 것으로 체크하지 않습니다.',
 '출력된 Hosting URL을 브라우저에서 엽니다. 주소는 본인 프로젝트에 해당하는 web.app 주소이며 사진이나 예시의 프로젝트 주소를 그대로 쓰지 않습니다.',
 '사이트가 열리면 다음 단계에서 관리자 계정으로 로그인해 초기 자료를 만듭니다. 아직 자료가 없다는 안내가 나와도 초기 설정 전이라면 정상입니다. 실제 신청자에게 주소를 공유하는 것은 다음 운영 점검을 마친 뒤에 합니다.'
 ],
 image:'23-cli-confirm-command.jpg',caption:'브라우저가 열리지 않아 firebase login --no-localhost를 사용했을 때의 추가 확인 화면입니다. 일반 로그인에서는 나오지 않을 수 있습니다.',screenPending:false,
 commands:['firebase login','npm run deploy'],
 tip:'로그인 브라우저가 자동으로 열리지 않으면 firebase login --no-localhost를 사용할 수 있습니다. 이때 나오는 인증 코드·승인 링크는 본인 로그인에만 사용하세요. 권한 오류는 Google 계정과 프로젝트 ID, Firestore 관련 오류는 기본 데이터베이스 생성 여부를 먼저 확인하세요. npm이 package.json을 찾지 못하면 압축을 푼 폴더 위치를 확인하세요. 오류가 나면 끝부분의 오류 내용을 확인한 뒤 다시 실행하고, 보안 규칙을 공개로 바꾸어 해결하지 마세요.',
 checks:['프로젝트를 만든 Google 계정으로 CLI에 로그인했어요','표시된 배포 대상이 본인 프로젝트 ID인지 확인했어요','Deploy complete!를 확인했고 마지막 오류가 없어요','출력된 본인 Hosting URL을 열었어요']
});
const firstAdminStep=INSTALL_GUIDE.find(s=>s.title==='첫 관리자 설정·운영 전 점검');
Object.assign(firstAdminStep,{
 text:'배포한 사이트에 선택한 구성을 처음 한 번 저장한 뒤, 시험 예약으로 동작을 확인합니다. 아래 체크는 직접 시험한 결과만 표시하세요.',
 directions:[
 '배포 명령에 표시된 본인 Hosting URL을 엽니다. 초기 자료가 없으면 관리자 로그인 화면이 먼저 나옵니다. 기존 자료가 있으면 화면 아래 관리자를 누릅니다.',
 'Authentication에서 직접 만든 사이트 관리자 이메일·비밀번호로 로그인합니다. Firebase 콘솔에 들어갈 때 쓰는 Google 로그인과는 별개입니다.',
 '최초 자료 설정이 나오면 선택한 구성으로 초기 자료 만들기를 한 번 누르고 완료될 때까지 기다립니다. 내려받은 패키지에 담긴 일정·신청 항목·물품 수량을 본인 프로젝트에 저장합니다.',
 '운영 관리 화면에서 달력의 월과 날짜를 눌러 운영일이 맞는지 확인합니다. 아직 신청이 없다면 예약이 없습니다와 0건 표시는 정상입니다. 사진의 날짜·디자인은 특별실 예시이며 본인 구성에 따라 달라집니다.',
 '일정·정원·물품 수량을 펼쳐 선택한 날짜의 각 회차를 확인합니다. 물품 대여는 회차별 보유 수량을 확인하세요. 이미 확보된 예약 수량보다 적게 줄일 수 없으며, 신규 신청 중지는 기존 예약을 취소하는 기능이 아닙니다.',
 '사이트 설정 · 신청 전·중·후를 펼쳐 학교·제목·신청 전 안내·신청 중 안내·마감 후 안내와 신청 시작·마감 시간을 확인합니다. 바꾼 뒤 사이트 설정 저장을 누릅니다.',
 '관리자 로그아웃 후 신청자 화면에서 실제 개인정보 대신 시험용 정보를 넣어 예약합니다. 신청 항목, 날짜·시간·교시, 확정 또는 승인 대기 표시를 확인하고 예약 확인 링크를 보관합니다.',
 '예약 확인·취소에서 시험 예약을 조회하고 기한 내 취소해 봅니다. 관리자 화면에서 예약 상태와 잔여 정원·물품 수량이 함께 복구되는지 확인합니다. 승인 방식이면 승인·거절도 각각 시험합니다.',
 '같은 회차의 마지막 자리 또는 남은 물품을 서로 다른 브라우저에서 동시에 신청해 초과 확정되지 않는지 확인합니다. 관리자 로그아웃 상태에서는 전체 예약 목록 조회나 관리자 저장이 허용되지 않는지도 시험합니다. 동작이 확인되지 않으면 체크하지 않습니다.',
 '이 달의 전체 예약 · 검색·내려받기를 열어 검색 결과 CSV와 이 달의 예약 백업 JSON을 내려받아 확인합니다. 시험 예약을 취소하고 실제 신청 기간·수량·문구를 다시 확인한 뒤 주소를 공유합니다.'
 ],
 image:'27-admin-ready.jpg',caption:'1. 초기 자료 생성 후 운영 관리 화면 · 달력에서 날짜 선택 → 해당 날짜 예약과 운영 설정 확인',screenPending:false,
 screens:[{file:'28-admin-text-settings.jpg',caption:'2. 사이트 설정 · 신청 전·중·후 펼치기 → 문구·기간 수정 → 아래쪽 사이트 설정 저장'}],
 tip:'로그인은 되지만 관리자 권한이 없다고 나오면 admins 문서 ID가 그 계정의 UID인지, enabled가 boolean 참인지 확인하세요. 이미 초기화된 프로젝트는 자료를 덮어쓰려고 다시 초기화하지 말고 운영 관리에서 수정하세요. 백업 JSON은 보관용 파일이며 자동 복원 기능을 뜻하지 않습니다. 이 안내의 체크는 자동 검증이나 무장애 보장이 아닙니다.',
 checks:['관리자 로그인 후 초기 자료 생성과 운영일을 확인했어요','신청 전·중·후 문구, 기간, 항목과 회차별 수량을 확인했어요','시험 예약 조회·취소와 승인·거절(사용 시), 잔여 수량 복구를 확인했어요','마지막 자리·남은 물품의 동시 신청에서 초과 확정되지 않음을 시험했어요','관리자가 아닌 상태의 전체 예약 조회·관리자 저장 차단을 확인했어요','CSV·월별 백업을 확인하고 시험 예약 취소 및 최종 설정 점검을 마쳤어요']
});
const webConfigStep=INSTALL_GUIDE.find(s=>s.title==='내 프로젝트 공개 설정 입력');
Object.assign(webConfigStep,{
 where:'Firebase 콘솔 → 설정 → 일반 → 내 앱 → SDK 설정 및 구성 → 구성',
 text:'복사한 코드를 고치지 않고 그대로 붙여넣습니다. 이 작업은 내 컴퓨터의 파일을 준비하는 단계이며, 아직 배포한 것은 아닙니다.',
 directions:[
 'Firebase 콘솔 왼쪽 설정 메뉴에서 일반을 엽니다.',
 '아래로 내려 내 앱에서 앞서 등록한 웹 앱을 선택합니다.',
 'SDK 설정 및 구성 아래의 구성을 선택합니다. npm이나 CDN은 선택하지 않습니다.',
 '회색 코드 상자 오른쪽 아래의 복사 아이콘을 누릅니다. const firebaseConfig부터 마지막 중괄호까지 통째로 복사됩니다.',
 '압축을 푼 설치 폴더에서 터미널을 열고 아래 npm run configure 명령을 실행합니다. package.json과 setup.cjs가 있는 폴더여야 합니다.',
 '붙여넣으라는 안내가 나오면 Ctrl+V(macOS는 Command+V)로 코드를 붙여넣습니다. 줄바꿈과 따옴표를 직접 고치지 않습니다.',
 '마지막 빈 줄에서 Enter를 한 번 더 누릅니다. 공개 설정 저장 완료와 배포 대상이 표시되면, 대상 이름이 내 프로젝트 ID인지 확인합니다.'
 ],
 image:'30-copy-web-config.jpg',caption:'실제 Firebase 콘솔 · 구성 선택과 코드 상자 오른쪽 아래 복사 아이콘 · 2026-11-02',screenPending:false,
 tip:'사진 속 설정 값은 예시입니다. 반드시 본인 콘솔의 복사 버튼을 사용하세요. 비밀번호·서비스 계정 키를 입력하는 단계가 아닙니다. npm을 찾을 수 없다고 나오면 Node.js 설치 후 터미널을 새로 열고, package.json을 찾을 수 없다고 나오면 압축을 푼 폴더 위치를 확인하세요.',
 checks:['본인 웹 앱의 구성 코드를 복사했어요','코드를 그대로 붙여넣고 공개 설정 저장 완료를 확인했어요','표시된 배포 대상이 본인 프로젝트 ID와 같아요']
});
function installationChecklist(){const step=INSTALL_GUIDE[installStep],total=INSTALL_GUIDE.reduce((n,s)=>n+s.checks.length,0),checked=Object.values(installChecks).filter(Boolean).length,done=step.checks.every((_,i)=>installChecks[installStep+':'+i]);return `<div class="install-checklist-shell"><div class="install-package-summary"><div><p class="eyebrow">YOUR SITE / INSTALL</p><h3>내 사이트를 Firebase에 설치해요.</h3><p>${esc(presets[config.kind]?.name||config.kind)} · ${esc(config.title)} · ${config.slots.length}회차 · ${config.fields.length}개 신청 항목</p></div><button class="primary" data-action="export">↓ 설치 ZIP 받기</button></div><p class="install-check-note">체크는 직접 수행한 항목의 기록입니다. 도우미가 Firebase 연결이나 배포 성공을 확인하지 않습니다.</p><div class="install-progress"><span>직접 확인 ${checked} / ${total}</span><progress value="${checked}" max="${total}"></progress></div><div class="install-guide-layout"><nav class="install-guide-nav" aria-label="설치 순서">${INSTALL_GUIDE.map((s,i)=>`<button type="button" data-install-step="${i}" class="${i===installStep?'active':''}"><b>${String(i+1).padStart(2,'0')}</b><span>${s.title}</span></button>`).join('')}</nav><section class="install-step-panel"><p class="eyebrow">STEP ${String(installStep+1).padStart(2,'0')} / ${INSTALL_GUIDE.length}</p><h3>${step.title}</h3><p class="install-location">${esc(step.where)}</p><p class="install-instructions">${esc(step.text)}</p>${step.directions?`<ol class="install-directions">${step.directions.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>`:''}${step.tip?`<p class="install-check-note">${esc(step.tip)}</p>`:''}${step.image?`<figure class="install-real-screen"><a href="install-screens/${step.image}" target="_blank" rel="noopener"><img src="install-screens/${step.image}" alt="${esc(step.caption)}" loading="lazy"></a><figcaption>${esc(step.caption)} · 눌러 크게 보기</figcaption></figure>`:step.screenPending?'<div class="install-screen-pending">실제 설치 과정을 확인한 뒤 화면 안내를 추가할 예정입니다. 아래 절차와 공식 안내를 따라 주세요.</div>':''}${step.secondaryImage?`<figure class="install-real-screen"><a href="install-screens/${step.secondaryImage}" target="_blank" rel="noopener"><img src="install-screens/${step.secondaryImage}" alt="Google Analytics를 끈 실제 프로젝트 생성 화면" loading="lazy"></a><figcaption>Google Analytics 사용 안 함 · 2026-11-02 직접 캡처</figcaption></figure>`:''}${step.screens?step.screens.map(screen=>`<figure class="install-real-screen"><a href="install-screens/${screen.file}" target="_blank" rel="noopener"><img src="install-screens/${screen.file}" alt="${esc(screen.caption)}" loading="lazy"></a><figcaption>${esc(screen.caption)} · 눌러 크게 보기</figcaption></figure>`).join(''):''}${step.commands?step.commands.map(command=>`<pre class="install-command"><code>${esc(command)}</code><button type="button" data-install-copy="${esc(command)}">복사</button></pre>`).join(''):''}${step.link?`<a class="install-external" href="${step.link}" target="_blank" rel="noopener">해당 서비스·공식 안내 열기 ↗</a>`:''}<fieldset class="install-manual-checks"><legend>직접 확인하고 체크해 주세요.</legend>${step.checks.map((text,i)=>`<label><input type="checkbox" data-install-check="${installStep}:${i}" ${installChecks[installStep+':'+i]?'checked':''}><span>${esc(text)}</span></label>`).join('')}</fieldset><div class="install-step-actions"><button class="outline" type="button" data-install-step="${installStep-1}" ${installStep===0?'disabled':''}>이전</button>${installStep<INSTALL_GUIDE.length-1?`<button class="primary" type="button" data-install-step="${installStep+1}" ${done?'':'disabled'}>확인하고 다음 단계 →</button>`:`<p>${done?'모든 항목을 직접 확인했습니다. 도우미의 자동 검증 결과는 아닙니다.':'마지막 운영 점검을 진행해 주세요.'}</p>`}</div></section></div></div>`}
function refreshInstallGuide(){const el=document.querySelector('#install-checklist');if(el)el.innerHTML=installationChecklist()}
document.addEventListener('change',e=>{if(e.target.dataset.installCheck){installChecks[e.target.dataset.installCheck]=e.target.checked;refreshInstallGuide()}});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.installStep!==undefined){const next=Number(b.dataset.installStep);if(next>=0&&next<INSTALL_GUIDE.length){installStep=next;refreshInstallGuide()}}else if(b.dataset.installCopy){try{await navigator.clipboard.writeText(b.dataset.installCopy);toast('명령을 복사했어요.')}catch{toast('명령을 직접 선택해 복사해 주세요.')}}});
