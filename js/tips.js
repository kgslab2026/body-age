const TIPS = {
    hearing: [
        '🔊 이어폰 볼륨은 최대치의 60% 이하로 유지하세요',
        '⏱️ 이어폰 착용은 1시간마다 10분 휴식을 취하세요',
        '🥦 마그네슘·아연이 풍부한 견과류·녹색채소를 자주 드세요',
        '🚭 흡연은 달팽이관의 혈액순환을 방해해 청력을 악화시킵니다',
        '🏃 유산소 운동으로 내이의 혈액순환을 개선할 수 있습니다',
    ],
    neural: [
        '🎮 리듬 게임·탁구 등 반응이 필요한 스포츠를 즐기세요',
        '😴 충분한 수면(7–9시간)이 신경 전달 속도를 높여줍니다',
        '💧 탈수 상태는 반응속도를 10–20% 저하시킵니다. 물을 자주 드세요',
        '🧘 명상과 스트레스 관리로 집중력과 반응속도를 동시에 개선하세요',
        '☕ 과도한 카페인은 오히려 신경을 과부하시켜 반응이 느려질 수 있어요',
    ],
    balance: [
        '🧘 요가·태극권은 균형감각 향상에 탁월합니다',
        '🦵 한 발 서기 훈련: 매일 30초씩 양쪽 각 3세트를 해보세요',
        '👁️ 눈을 감고 서기로 전정기관(내이 균형 기관)을 자극하세요',
        '🏋️ 플랭크·복근 운동으로 코어 근육을 강화하세요',
        '🩺 어지러움이 자주 느껴진다면 이석증 검사를 받아보세요',
    ],
    attention: [
        '🍅 포모도로 기법: 25분 집중 + 5분 휴식을 반복해보세요',
        '📵 작업 중 스마트폰 알림을 끄면 집중력이 크게 향상됩니다',
        '🧩 스도쿠·퍼즐·체스 등 인지 훈련 게임을 즐기세요',
        '🏃 운동 직후 30분은 집중력이 높아지는 황금 타임입니다',
        '🌿 오메가-3가 풍부한 등푸른 생선은 뇌 혈류 개선에 도움이 됩니다',
    ],
    vision: [
        '🥕 당근·블루베리·시금치 등 루테인이 풍부한 음식을 드세요',
        '👀 20-20-20 규칙: 20분마다 6m 거리를 20초간 바라보세요',
        '🌙 어두운 곳에서의 스마트폰 사용은 눈 피로를 급격히 높입니다',
        '🕶️ 야외 활동 시 UV 차단 선글라스로 황반을 보호하세요',
        '🩺 1–2년마다 정기 안과 검진으로 색각 이상을 조기에 발견하세요',
    ],
    memory: [
        '📚 새로운 언어나 악기 배우기는 뇌 가소성을 크게 높입니다',
        '😴 수면 중 해마에서 기억이 장기 저장됩니다. 충분히 주무세요',
        '🏃 유산소 운동은 BDNF 분비를 촉진해 뇌세포를 보호합니다',
        '🍇 레스베라트롤(포도·블루베리)과 오메가-3는 뇌세포 보호에 도움됩니다',
        '✍️ 디지털 기기 대신 손으로 쓰기 — 기억 고정 효과가 더 뛰어납니다',
    ],
};

export function renderTipsCard(key) {
    const tips = TIPS[key];
    if (!tips) return '';
    const items = tips.map(t => `<li class="tips-item">${t}</li>`).join('');
    return `
        <div class="tips-card">
            <button class="tips-toggle" id="tips-toggle" aria-expanded="false">
                <span>💡</span>
                <span class="tips-toggle-label">향상 팁 보기</span>
                <span class="tips-chevron">▼</span>
            </button>
            <div class="tips-body" id="tips-body" hidden>
                <ul class="tips-list">${items}</ul>
            </div>
        </div>
    `;
}

export function initTipsCard() {
    const btn  = document.getElementById('tips-toggle');
    const body = document.getElementById('tips-body');
    if (!btn || !body) return;
    btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        body.hidden = open;
        btn.querySelector('.tips-chevron').style.transform = open ? '' : 'rotate(180deg)';
    });
}

export function renderShareBtn(label, age) {
    return `<button class="share-result-btn" id="share-result-btn" data-label="${label}" data-age="${age}">📤 결과 공유하기</button>`;
}

export function initShareBtn() {
    const btn = document.getElementById('share-result-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const label = btn.dataset.label;
        const age   = btn.dataset.age;
        const url   = 'https://kgslab2026.github.io/body-age/';
        const text  = `신체 나이 측정기에서 내 ${label}을(를) 측정했더니 ${age}살!\n너도 해봐 👇`;
        if (navigator.share) {
            try { await navigator.share({ title: '신체 나이 측정기', text, url }); }
            catch (e) { if (e.name !== 'AbortError') fallbackCopy(btn, `${text}\n${url}`); }
        } else {
            fallbackCopy(btn, `${text}\n${url}`);
        }
    });
}

function fallbackCopy(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✅ 복사됨!';
        btn.style.borderColor = 'rgba(52,211,153,0.5)';
        btn.style.color = '#34d399';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    });
}
