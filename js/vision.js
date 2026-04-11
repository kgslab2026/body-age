import { navigate, state, showMain, HOME_ICON } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult } from './history.js';

const TIME_LIMIT_MS = 10000;

const LEVELS = [
    { offset: 35 },
    { offset: 25 },
    { offset: 18 },
    { offset: 13 },
    { offset: 9 },
    { offset: 8 },
    { offset: 7 },
    { offset: 6 },
    { offset: 5 },
    { offset: 4 },
];

export function startVisionTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    function showStart() {
        const exHue = 200;
        const exBase   = `hsl(${exHue}, 65%, 54%)`;
        const exTarget = `hsl(${exHue + 30}, 65%, 54%)`;
        const exIdxs = [2, 6];

        const exCells = Array.from({ length: 9 }, (_, i) =>
            `<div style="background:${exIdxs.includes(i) ? exTarget : exBase}; width:52px; height:52px; border-radius:10px;"></div>`
        ).join('');

        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">색감 나이</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 15살 ~ 70살</div>
                <p style="line-height: 1.8;">9개 중 <strong>색이 다른 두 개</strong>를 찾아 탭하세요.<br>점점 차이가 줄어들어 어려워집니다!</p>
                <div style="background: #1e293b; border-radius: 20px; padding: 20px; width: 100%; margin: 8px 0; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                    <div style="font-size: 0.75rem; color: #64748b; letter-spacing: 1px;">예시</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 52px); gap: 8px;">${exCells}</div>
                </div>
                <p style="color: #888; font-size: 0.85rem; margin-top: 4px;">총 ${LEVELS.length}문제</p>
                <button id="start-btn" class="btn" style="margin-top: 20px; width: 100%;">준비 완료</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('start-btn').onclick = () => runTest();
        });
    }

    function runTest() {
        const results = [];

        function nextRound() {
            if (!active) return;
            if (results.length >= LEVELS.length) {
                showResult(results);
                return;
            }

            const roundIdx = results.length;
            const { offset } = LEVELS[roundIdx];
            const hue = Math.floor(Math.random() * 360);
            const baseColor   = `hsl(${hue}, 62%, 54%)`;
            const targetColor = `hsl(${(hue + offset) % 360}, 62%, 54%)`;
            const targetIdxs  = [];
            while (targetIdxs.length < 2) {
                const r = Math.floor(Math.random() * 9);
                if (!targetIdxs.includes(r)) targetIdxs.push(r);
            }

            const cells = Array.from({ length: 9 }, (_, i) =>
                `<div class="vision-cell" data-idx="${i}" style="background:${targetIdxs.includes(i) ? targetColor : baseColor};"></div>`
            ).join('');

            const html = `
                <div class="vision-box">
                    <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                    <div class="vision-progress">${roundIdx + 1} / ${LEVELS.length}</div>
                    <div class="vision-timer-wrap">
                        <div class="vision-timer-bar" id="vision-timer-bar"></div>
                    </div>
                    <div class="vision-grid">${cells}</div>
                    <div class="vision-label">색이 다른 두 개를 탭하세요</div>
                </div>
            `;

            navigate(html, () => {
                document.getElementById('btn-home').onclick = goHome;
                let tappedCount = 0;
                let hits = 0;
                let timeoutId = null;

                // 게이지 애니메이션
                const timerBar = document.getElementById('vision-timer-bar');
                if (timerBar) {
                    timerBar.style.transition = `width ${TIME_LIMIT_MS}ms linear`;
                    requestAnimationFrame(() => { timerBar.style.width = '0%'; });
                }

                function finishRound() {
                    clearTimeout(timeoutId);
                    document.querySelectorAll('.vision-cell').forEach(c => {
                        c.style.pointerEvents = 'none';
                        if (targetIdxs.includes(parseInt(c.dataset.idx))) {
                            c.style.background = '#22c55e';
                        }
                    });
                    results.push({ hits });
                    setTimeout(nextRound, 500);
                }

                // 10초 초과 시 자동 오답
                timeoutId = setTimeout(() => {
                    if (!active) return;
                    finishRound();
                }, TIME_LIMIT_MS);

                document.querySelectorAll('.vision-cell').forEach(cell => {
                    cell.onclick = () => {
                        if (!active) return;
                        const idx = parseInt(cell.dataset.idx);
                        const isTarget = targetIdxs.includes(idx);
                        cell.style.pointerEvents = 'none';
                        cell.style.background = isTarget ? '#22c55e' : '#ef4444';
                        if (isTarget) hits++;
                        tappedCount++;
                        if (tappedCount === 2) finishRound();
                    };
                });
            });
        }

        nextRound();
    }

    function showResult(results) {
        if (!active) return;
        const correctCount = results.filter(r => r.hits === 2).length;
        const partialCount = results.filter(r => r.hits === 1).length;
        const age = calculator.getVisionAge(correctCount, partialCount);
        state.save('vision', correctCount);
        saveResult('vision', age, `${correctCount}/${LEVELS.length}개`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result">${age}살</div>
                <p style="color:#888; margin: 5px 0 12px;">정답: <strong style="color:var(--text-color);">${correctCount} / ${LEVELS.length}</strong></p>
${renderTipsCard('vision')}
                <div style="display: flex; gap: 15px; width: 100%; margin-top: 12px;">
                    <button id="retry-btn" class="btn" style="flex:1; background: #475569;">다시하기</button>
                    <button id="next-btn" class="btn" style="flex:1;">완료</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('retry-btn').onclick = startVisionTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
