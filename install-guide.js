/* Installation guide progress follows the displayed step. */
let installStep=0;
const INSTALL_GUIDE=[
  {
    "title": "설치 파일 준비",
    "where": "도우미 → Firebase 설치 패키지",
    "text": "",
    "action": "download",
    "tasks": [
      {
        "where": "이 화면 위쪽",
        "action": "설치 ZIP 받기 → 다운로드한 파일 우클릭 → 압축 풀기",
        "done": "압축을 푼 폴더가 열림"
      },
      {
        "where": "압축을 푼 폴더",
        "action": "package.json과 setup.cjs가 보이는 폴더를 찾습니다.",
        "done": "두 파일이 보이면 준비 완료",
        "locator": "folder"
      }
    ],
    "more": ""
  },
  {
    "title": "Google 로그인",
    "where": "Firebase 콘솔 → Google 로그인",
    "text": "",
    "link": "https://console.firebase.google.com/",
    "caption": "로그인 후 Firebase 프로젝트 시작 화면 · 2026-11-02 직접 캡처",
    "tasks": [
      {
        "where": "아래 Firebase 콘솔 링크",
        "action": "Google 계정으로 로그인합니다.",
        "done": "프로젝트 목록 또는 시작 화면이 열림"
      }
    ],
    "more": ""
  },
  {
    "title": "새 프로젝트",
    "where": "Firebase 콘솔 → 새 프로젝트 시작 → 프로젝트 만들기",
    "text": "",
    "link": "https://console.firebase.google.com/",
    "caption": "1. 프로젝트 이름을 입력하는 첫 화면 · 개발자 프로그램 가입은 선택 사항입니다.",
    "tasks": [
      {
        "where": "Firebase 콘솔 첫 화면",
        "action": "프로젝트 만들기 → 프로젝트 이름 입력",
        "done": "이름 아래 프로젝트 ID가 표시됨",
        "image": "02-project-create.jpg"
      },
      {
        "where": "이름 입력란 아래",
        "action": "약관 확인·동의 → 개발자 프로그램 가입 여부 선택 → 계속",
        "done": "Gemini 선택 화면이 열림",
        "image": "03-project-name-filled.jpg"
      }
    ],
    "more": "계속 버튼이 비활성화되어 있으면 프로젝트 이름과 약관 동의 여부를 확인하세요. 화면 이름이 조금 달라도 새 프로젝트를 만드는 항목을 선택하면 됩니다. 비밀번호는 Google 로그인 화면에만 입력하세요."
  },
  {
    "title": "선택 기능과 생성",
    "where": "Gemini 설정 → Google Analytics 설정",
    "text": "",
    "caption": "1. Firebase의 Gemini 사용 설정을 끄고 계속 · 실제 캡처",
    "tasks": [
      {
        "where": "Gemini 화면",
        "action": "사용 여부 선택 → 계속",
        "done": "Analytics 선택 화면이 열림",
        "image": "04-gemini-option.jpg"
      },
      {
        "where": "Google Analytics 화면",
        "action": "사용 여부 선택 → 프로젝트 만들기",
        "done": "켰다면 Analytics 계정 선택도 진행",
        "image": "05-analytics-off.jpg"
      },
      {
        "where": "생성이 끝난 화면",
        "action": "계속 → 프로젝트 대시보드에서 Spark 요금제 확인",
        "done": "내 프로젝트 대시보드가 열림"
      }
    ],
    "more": "두 기능의 선택은 예약 기능 사용 여부와 별개입니다. 애널리틱스를 켜면 계정 선택 등 추가 화면이 나올 수 있으며 정상적인 과정입니다. 아래 사진과 같은 경로로 따라가려면 두 기능을 끄면 됩니다. 캡처는 2026년 11월 기준입니다."
  },
  {
    "title": "웹 앱 등록",
    "where": "프로젝트 개요 → 앱 추가 → 웹 아이콘 </>",
    "text": "",
    "link": "https://firebase.google.com/docs/web/setup",
    "caption": "1. 웹 앱 닉네임 입력 → 이 안내에서는 Hosting 체크를 비워 두고 앱 등록",
    "tasks": [
      {
        "where": "프로젝트 개요",
        "action": "앱 추가 → 웹 아이콘 </> 선택",
        "done": "웹 앱 등록 화면이 열림"
      },
      {
        "where": "앱 닉네임 입력란",
        "action": "알아보기 쉬운 이름 입력 → Hosting 체크는 비워 두고 앱 등록",
        "done": "Firebase SDK 추가 화면이 열림",
        "image": "08-web-app-register.jpg"
      },
      {
        "where": "SDK 화면 맨 아래",
        "action": "콘솔로 이동",
        "done": "프로젝트 개요로 돌아옴",
        "image": "09-web-sdk.jpg"
      }
    ],
    "more": "이미 등록한 웹 앱이 있으면 설정 → 일반 → 내 앱에서 닉네임을 확인하고 재사용하세요. Android·Apple 앱이 아니라 웹 앱을 선택해야 합니다. SDK는 사이트 실행에 필요한 Firebase 연결 도구를 뜻하며, 패키지에 포함되어 있습니다."
  },
  {
    "title": "예약 저장소",
    "where": "데이터베이스 및 스토리지 → Firestore → 데이터베이스 만들기",
    "text": "",
    "link": "https://firebase.google.com/docs/firestore/quickstart",
    "caption": "1. Standard 버전 선택 → 다음 · 실제 캡처",
    "tasks": [
      {
        "where": "콘솔 왼쪽 메뉴",
        "action": "데이터베이스 및 스토리지 → Firestore → 데이터베이스 만들기",
        "done": "버전 선택 화면이 열림"
      },
      {
        "where": "버전 선택",
        "action": "Standard → 다음",
        "done": "데이터베이스 ID·위치 화면이 열림",
        "image": "10-firestore-standard.jpg"
      },
      {
        "where": "ID·위치",
        "action": "ID는 (default) 유지 → 학교의 저장 위치 기준에 맞게 선택 → 다음",
        "done": "위치는 생성 후 변경 불가. 사진은 Seoul 예시",
        "image": "11-firestore-location.jpg"
      },
      {
        "where": "보안 설정",
        "action": "프로덕션 모드에서 시작 → 다음",
        "done": "예약된 백업 선택 화면이 열림",
        "image": "12-firestore-production.jpg"
      },
      {
        "where": "예약된 백업",
        "action": "무료 기본 경로는 백업 선택 없이 만들기",
        "done": "데이터 탭에 (default)가 보이면 완료",
        "image": "13-firestore-no-backup.jpg"
      }
    ],
    "more": "Firestore 데이터 화면이 이미 열리면 새 데이터베이스를 중복으로 만들지 말고 (default)가 있는지 확인하세요. 배포 전에는 사이트에서 읽기·쓰기가 막혀 있어도 정상입니다. 배포 후 권한 오류가 나면 패키지의 Firestore 규칙 배포가 성공했는지 확인하세요. 캡처는 2026년 11월 기준이며 화면 구성은 달라질 수 있습니다."
  },
  {
    "title": "로그인 방식",
    "where": "보안 → Authentication → 로그인 방법",
    "text": "",
    "link": "https://firebase.google.com/docs/auth/web/anonymous-auth",
    "caption": "1. 익명 선택 → 오른쪽 사용 설정 켜기 → 저장. 캡처는 켜기 전 화면입니다.",
    "tasks": [
      {
        "where": "콘솔 왼쪽 메뉴",
        "action": "보안 → Authentication → 시작하기 → 로그인 방법",
        "done": "제공업체를 고르는 목록이 열림"
      },
      {
        "where": "제공업체 목록",
        "action": "익명 → 사용 설정 켜기 → 저장",
        "done": "목록에 익명이 추가됨",
        "image": "15-anonymous-auth.jpg"
      },
      {
        "where": "새 제공업체 추가",
        "action": "이메일/비밀번호 → 위쪽 사용 설정만 켜기 → 저장",
        "done": "이메일 링크는 꺼 둠",
        "image": "16-email-auth.jpg"
      },
      {
        "where": "로그인 방법 목록",
        "action": "익명과 이메일/비밀번호의 상태 확인",
        "done": "둘 다 사용 설정됨",
        "image": "17-auth-ready.jpg"
      }
    ],
    "more": "목록에 이메일/비밀번호가 있어도 사이트 관리자 계정이 저절로 만들어지지는 않습니다. 다음 단계의 계정 생성과 권한 지정까지 마쳐야 관리자 메뉴를 사용할 수 있습니다. 캡처의 프로젝트 이름은 예시이며 본인 프로젝트에서 진행하세요."
  },
  {
    "title": "관리자 지정",
    "where": "Authentication → 사용자 / Firestore → 데이터",
    "text": "",
    "caption": "1. Authentication → 사용자 추가 · 관리자 이메일·비밀번호는 직접 입력",
    "tasks": [
      {
        "where": "Authentication → 사용자",
        "action": "사용자 추가 → 관리자 이메일·비밀번호 입력 → 추가",
        "done": "사용자 목록에 내 이메일이 나타남",
        "image": "18-admin-create.jpg"
      },
      {
        "where": "방금 추가한 사용자 행",
        "action": "사용자 UID 옆 복사 버튼 클릭",
        "done": "이 UID를 다음 문서 ID에 붙여넣음"
      },
      {
        "where": "Firestore → 데이터",
        "action": "컬렉션 시작 → admins 입력 → 다음",
        "done": "첫 문서 추가 화면이 열림",
        "image": "19-admin-collection.jpg"
      },
      {
        "where": "첫 문서 추가",
        "action": "문서 ID에 UID 붙여넣기 → enabled / boolean / 참(true) → 저장",
        "done": "admins 아래 내 UID와 enabled: true가 보임",
        "image": "20-admin-permission.jpg"
      }
    ],
    "more": "사용자 추가가 비활성화되어 있으면 이전 단계에서 이메일/비밀번호 로그인을 켰는지 확인하세요. 배포 후 관리자 권한이 없다고 나오면 문서 ID가 본인 UID와 정확히 같은지, enabled의 유형이 boolean이고 값이 참인지 확인하세요. 비밀번호와 UID는 도우미에 입력하거나 채팅으로 보낼 필요가 없습니다."
  },
  {
    "title": "배포 도구 설치",
    "where": "내 컴퓨터 → Node.js 설치 → 압축을 푼 폴더 → 명령 입력 창",
    "text": "",
    "link": "https://nodejs.org/",
    "caption": "Node.js 공식 다운로드 실제 화면 · LTS / Windows 확인 → 아래쪽 Windows Installer (.msi). 버전 숫자는 달라질 수 있습니다.",
    "tasks": [
      {
        "where": "아래 Node.js 공식 링크",
        "action": "LTS / Windows 확인 → 아래쪽 Windows Installer (.msi) → 설치",
        "done": "설치 완료 후 기존 명령 창은 닫음",
        "image": "31-node-download.jpg"
      },
      {
        "where": "파일 탐색기",
        "action": "압축을 푼 폴더에서 package.json·setup.cjs 확인",
        "done": "public 폴더 안으로 들어가지 않음",
        "locator": "folder"
      },
      {
        "where": "폴더 위쪽 주소창",
        "action": "주소창 클릭 → cmd 입력 → Enter",
        "done": "명령을 입력하는 창이 열림",
        "locator": "address"
      },
      {
        "where": "명령 입력 창",
        "action": "아래 명령 복사 → 붙여넣기 → Enter",
        "done": "v로 시작하는 버전 숫자가 보임",
        "command": "node --version"
      },
      {
        "where": "같은 창",
        "action": "아래 설치 명령 실행 후 입력 줄이 다시 나올 때까지 기다리기",
        "done": "설치가 끝나면 다음 명령을 입력할 수 있음",
        "command": "npm install -g firebase-tools"
      },
      {
        "where": "같은 창",
        "action": "버전 확인",
        "done": "버전 숫자가 보이면 완료",
        "command": "firebase --version"
      }
    ],
    "more": "node 또는 npm을 찾을 수 없으면 Node.js 설치 후 창을 닫고 다시 여세요. PowerShell에서 스크립트 실행 정책 오류가 나면 정책을 변경하지 말고 위 안내대로 cmd 창에서 실행하세요. package.json을 찾을 수 없다는 오류는 압축을 푼 폴더 위치를 확인하세요. 설치가 오류로 끝나거나 학교 컴퓨터에서 설치가 제한되면 오류 내용을 확인한 뒤 진행하세요. 경고(warn)만으로 실패를 판단하지 말고 마지막 버전 확인까지 해 주세요."
  },
  {
    "title": "내 프로젝트 연결 설정",
    "where": "Firebase 콘솔 → 설정 → 일반 → 내 앱 → SDK 설정 및 구성 → 구성",
    "text": "",
    "caption": "실제 Firebase 콘솔 · 구성 선택과 코드 상자 오른쪽 아래 복사 아이콘 · 2026-11-02",
    "tasks": [
      {
        "where": "Firebase 콘솔 왼쪽 설정 메뉴",
        "action": "설정 → 일반 → 아래쪽 내 앱 → 등록한 웹 앱 선택",
        "done": "SDK 설정 및 구성이 보임"
      },
      {
        "where": "SDK 설정 및 구성",
        "action": "구성 선택 → 회색 코드 상자 오른쪽 아래 복사 버튼",
        "done": "내 웹 앱 설정 코드가 복사됨",
        "image": "30-copy-web-config.jpg"
      },
      {
        "where": "앞에서 연 명령 입력 창",
        "action": "아래 명령 실행",
        "done": "설정을 붙여넣으라는 안내가 보임",
        "command": "npm run configure"
      },
      {
        "where": "같은 창",
        "action": "Ctrl+V로 붙여넣기 → 마지막 빈 줄에서 Enter 한 번 더",
        "done": "공개 설정 저장 완료 + 내 프로젝트 ID 표시"
      }
    ],
    "more": "사진 속 설정 값은 예시입니다. 반드시 본인 콘솔의 복사 버튼을 사용하세요. 비밀번호·서비스 계정 키를 입력하는 단계가 아닙니다. npm을 찾을 수 없다고 나오면 Node.js 설치 후 터미널을 새로 열고, package.json을 찾을 수 없다고 나오면 압축을 푼 폴더 위치를 확인하세요."
  },
  {
    "title": "로그인과 배포",
    "where": "압축을 푼 폴더의 명령 입력 창 → Google 로그인 → 배포된 사이트",
    "text": "",
    "link": "https://firebase.google.com/docs/hosting/quickstart",
    "caption": "브라우저가 열리지 않아 firebase login --no-localhost를 사용했을 때의 추가 확인 화면입니다. 일반 로그인에서는 나오지 않을 수 있습니다.",
    "tasks": [
      {
        "where": "앞에서 연 명령 입력 창",
        "action": "아래 명령 실행",
        "done": "Google 로그인 창이 열림",
        "command": "firebase login"
      },
      {
        "where": "Google 로그인 창",
        "action": "프로젝트를 만든 Google 계정 선택 → 권한 안내 확인 후 완료",
        "done": "명령 창에 로그인 성공이 보임"
      },
      {
        "where": "명령 입력 창",
        "action": "아래 명령 실행 → 표시된 프로젝트 ID가 내 것인지 확인",
        "done": "Deploy complete!와 Hosting URL이 보임",
        "command": "npm run deploy"
      },
      {
        "where": "Hosting URL",
        "action": "출력된 web.app 주소 열기",
        "done": "내 사이트 또는 최초 관리자 로그인 화면이 열림"
      }
    ],
    "more": "로그인 브라우저가 자동으로 열리지 않으면 firebase login --no-localhost를 사용할 수 있습니다. 이때 나오는 인증 코드·승인 링크는 본인 로그인에만 사용하세요. 권한 오류는 Google 계정과 프로젝트 ID, Firestore 관련 오류는 기본 데이터베이스 생성 여부를 먼저 확인하세요. npm이 package.json을 찾지 못하면 압축을 푼 폴더 위치를 확인하세요. 오류가 나면 끝부분의 오류 내용을 확인한 뒤 다시 실행하고, 보안 규칙을 공개로 바꾸어 해결하지 마세요."
  },
  {
    "title": "첫 실행과 시험 예약",
    "where": "배포한 사이트 → 관리자",
    "text": "",
    "caption": "1. 초기 자료 생성 후 운영 관리 화면 · 달력에서 날짜 선택 → 해당 날짜 예약과 운영 설정 확인",
    "tasks": [
      {
        "where": "배포한 사이트",
        "action": "Authentication에서 만든 관리자 이메일·비밀번호로 로그인",
        "done": "최초 자료 설정 또는 운영 관리 화면이 열림"
      },
      {
        "where": "최초 자료 설정",
        "action": "선택한 구성으로 초기 자료 만들기 클릭",
        "done": "운영 달력에 내 일정이 표시됨"
      },
      {
        "where": "관리자 화면",
        "action": "일정·정원·물품 수량과 사이트 설정 확인",
        "done": "신청 기간·문구·수량이 원하는 값과 같음",
        "image": "27-admin-ready.jpg"
      },
      {
        "where": "신청자 화면",
        "action": "시험 정보로 예약 → 확인 링크 보관 → 취소",
        "done": "취소 상태와 잔여 자리·수량 복구 확인"
      },
      {
        "where": "관리자 화면 위쪽",
        "action": "전체 예약 CSV 받기 → 파일 열기",
        "done": "시험 예약이 항목별 열에 표시됨"
      }
    ],
    "more": "로그인은 되지만 관리자 권한이 없다고 나오면 admins 문서 ID가 그 계정의 UID인지, enabled가 boolean 참인지 확인하세요. 이미 초기화된 프로젝트는 자료를 덮어쓰려고 다시 초기화하지 말고 운영 관리에서 수정하세요. 백업 JSON은 보관용 파일이며 자동 복원 기능을 뜻하지 않습니다."
  }
];

function installCommand(command){
 return '<pre class="install-command"><code>'+esc(command)+'</code><button type="button" data-install-copy="'+esc(command)+'">복사</button></pre>';
}
function explorerLocator(mode){
 return '<figure class="install-locator"><figcaption>파일 탐색기 위치 안내 · Windows 예시 그림</figcaption><div class="explorer-example"><div class="explorer-title">파일 탐색기</div><div class="explorer-toolbar"><span>←　↑</span><div class="explorer-address '+(mode==='address'?'is-target':'')+'">'+(mode==='address'?'여기를 클릭 → cmd 입력 → Enter':'다운로드　›　압축을 푼 설치 폴더')+'</div><div class="explorer-search">검색</div></div><div class="explorer-files"><span>📁 public</span><strong>package.json</strong><strong>setup.cjs</strong><span>시작하기.html</span></div></div><p>주소창은 창 맨 위에서 폴더 경로가 보이는 긴 칸이에요. 오른쪽 검색창과 구분해 주세요.</p></figure>';
}
function installTask(task,index){
 return '<li class="install-task"><div class="install-task-number">'+(index+1)+'</div><div class="install-task-content"><p class="install-task-where">'+esc(task.where)+'</p><p class="install-task-action">'+esc(task.action)+'</p>'+(task.command?installCommand(task.command):'')+(task.locator?explorerLocator(task.locator):'')+'<p class="install-task-done">확인 · '+esc(task.done)+'</p>'+(task.image?'<details class="install-task-screen"><summary>이 단계의 실제 화면 보기</summary><a href="install-screens/'+task.image+'" target="_blank" rel="noopener"><img src="install-screens/'+task.image+'" alt="'+esc(task.where+' — '+task.action)+'" loading="lazy"></a><p>눌러 크게 보기 · 메뉴 이름과 배치는 바뀔 수 있어요.</p></details>':'')+'</div></li>';
}
function installationChecklist(){
 const step=INSTALL_GUIDE[installStep],total=INSTALL_GUIDE.length,current=installStep+1;
 return '<div class="install-checklist-shell"><div class="install-package-summary"><div><p class="eyebrow">YOUR SITE / INSTALL</p><h3>내 사이트를 Firebase에 설치해요.</h3><p>'+esc(presets[config.kind]?.name||config.kind)+' · '+esc(config.title)+' · '+config.slots.length+'회차</p></div><button class="primary" data-action="export">↓ 설치 ZIP 받기</button></div><aside class="install-scale" aria-label="사용 규모 안내"><strong>확인된 사용 규모</strong><div><span>동시 접속·일정 조회 <b>100명</b></span><span>같은 자리 선착순 경쟁 <b>10~20명</b></span></div><p>시험 사이트에서 확인한 범위이며 최대 인원이나 무장애 보장은 아닙니다. 100명 동시 신청·500명 접속은 아직 검증하지 않았어요. 무료 한도는 일정 수·조회 횟수에 따라 달라집니다.</p><details><summary>시험 조건과 무료 사용 한도</summary><p>2026년 11월 HTTP·Firebase SDK로 100개 독립 접속의 파일 읽기·익명 인증·실시간 일정 조회를 검사했습니다. 실제 휴대폰 100대의 화면 렌더링 검사는 포함하지 않습니다. 같은 회차 동시 신청은 10~20명 조건에서 검증했습니다.</p><p>같은 Wi-Fi 등 동일 IP에서는 신규 익명 계정 생성이 시간당 100개로 제한될 수 있습니다. 무료 사용량과 인증 제한은 Firebase 정책에 따릅니다.</p><a href="https://firebase.google.com/docs/firestore/quotas" target="_blank" rel="noopener">Firestore 무료 한도 ↗</a> · <a href="https://firebase.google.com/docs/auth/limits" target="_blank" rel="noopener">인증 제한 ↗</a></details></aside><div class="install-progress"><span>설치 단계 '+current+' / '+total+'</span><progress value="'+current+'" max="'+total+'"></progress></div><div class="install-guide-layout"><nav class="install-guide-nav" aria-label="설치 순서">'+INSTALL_GUIDE.map((s,i)=>'<button type="button" data-install-step="'+i+'" class="'+(i===installStep?'active':'')+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(s.title)+'</span></button>').join('')+'</nav><section class="install-step-panel"><p class="eyebrow">STEP '+String(installStep+1).padStart(2,'0')+' / '+INSTALL_GUIDE.length+'</p><h3>'+esc(step.title)+'</h3><ol class="install-tasks">'+step.tasks.map(installTask).join('')+'</ol>'+(step.link?'<a class="install-external" href="'+step.link+'" target="_blank" rel="noopener">이 단계의 공식 사이트 열기 ↗</a>':'')+(step.more?'<details class="install-extra"><summary>막혔을 때 · 추가 설명</summary><p>'+esc(step.more)+'</p></details>':'')+'<div class="install-step-actions"><button class="outline" type="button" data-install-step="'+(installStep-1)+'" '+(installStep===0?'disabled':'')+'>이전</button>'+(installStep<INSTALL_GUIDE.length-1?'<button class="primary" type="button" data-install-step="'+(installStep+1)+'" >다음 단계 →</button>':'<p>마지막 시험 예약까지 확인한 뒤 주소를 공유하세요.</p>')+'</div></section></div></div>';
}

function refreshInstallGuide(){const el=document.querySelector('#install-checklist');if(el)el.innerHTML=installationChecklist()}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.installStep!==undefined){const next=Number(b.dataset.installStep);if(next>=0&&next<INSTALL_GUIDE.length){installStep=next;refreshInstallGuide()}}else if(b.dataset.installCopy){try{await navigator.clipboard.writeText(b.dataset.installCopy);toast('명령을 복사했어요.')}catch{toast('명령을 직접 선택해 복사해 주세요.')}}});
