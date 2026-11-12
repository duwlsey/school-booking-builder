const fs = require('node:fs');
const { resolve } = require('node:path');

const appConfigPath = resolve(__dirname, 'public/app-config.json');
const readJson = path => JSON.parse(fs.readFileSync(resolve(__dirname, path), 'utf8'));

async function preparePriority() {
  const config = readJson(appConfigPath);
  if (!config.priorityUntil) return;

  const { pin, email } = readJson('priority-install.json');
  if (!/^[0-9]{4}$/.test(pin) || !/^priority-[a-f0-9]{32}@example\.com$/.test(email)) {
    throw Error('도우미에서 우선 신청 번호를 확인하고 설치 ZIP을 다시 받아 주세요.');
  }
  const { apiKey } = readJson('public/firebase-config.json');
  async function authRequest(action) {
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:' + action + '?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Booking-' + pin + '!', returnSecureToken: true })
      }
    );
    return response.json();
  }

  let result = await authRequest('signUp');
  if (result.error?.message === 'EMAIL_EXISTS') {
    result = await authRequest('signInWithPassword');
  }
  if (!result.localId) {
    const code = String(result.error?.message || '').split(' : ')[0];
    throw Error('우선 신청 계정을 준비하지 못했습니다. Firebase 이메일/비밀번호 로그인 설정을 확인하세요. (' + code + ')');
  }
  config.priorityUid = result.localId;
  config.priorityEmail = email;
  const temporaryPath = appConfigPath + '.tmp';
  fs.writeFileSync(temporaryPath, JSON.stringify(config, null, 2));
  fs.renameSync(temporaryPath, appConfigPath);
  console.log('우선 신청 연결 준비 완료');
}

preparePriority().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
