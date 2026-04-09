import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const LEVELS = [
    { offset: 30 },
    { offset: 22 },
    { offset: 15 },
    { offset: 10 },
    { offset: 7 },
    { offset: 5 },
    { offset: 3 },
    { offset: 2 },
];

export function startVisionTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    function showStart() {
        const exHue = 200;
        const exBase   = `hsl(${exHue}, 65%, 54%)`;
        const exTarget = `hsl(${exHue + 30}, 65%, 54%)`;
        const exIdx = 4;

        const exCells = Array.from({ length: 9 }, (_, i) =>
            `<div style="background:${i === exIdx ? exTarget : exBase}; width:52px; height:52px; border-radius:10px;"></div>`
        ).join('');

        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">시력 나이</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 20살 ~ 80살</div>
                <p style="line-height: 1.8;">9개 중 <strong>색이 다른 하나</strong>를 찾아 탭하세요.<br>점점 차이가 줄어들어 어려워집니다!</p>
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
            const targetIdx   = Math.floor(Math.random() * 9);

            const cells = Array.from({ length: 9 }, (_, i) =>
                `<div class="vision-cell" data-idx="${i}" style="background:${i === targetIdx ? targetColor : baseColor};"></div>`
            ).join('');

            const html = `
                <div class="vision-box">
                    <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                    <div class="vision-progress">${roundIdx + 1} / ${LEVELS.length}</div>
                    <div class="vision-grid">${cells}</div>
                    <div class="vision-label">색이 다른 하나를 탭하세요</div>
                </div>
            `;

            navigate(html, () => {
                document.getElementById('btn-home').onclick = goHome;
                document.querySelectorAll('.vision-cell').forEach(cell => {
                    cell.onclick = () => {
                        if (!active) return;
                        const correct = parseInt(cell.dataset.idx) === targetIdx;

                        document.querySelectorAll('.vision-cell').forEach(c => {
                            c.style.pointerEvents = 'none';
                            if (parseInt(c.dataset.idx) === targetIdx) {
                                c.style.background = '#22c55e';
                            }
                        });
                        if (!correct) cell.style.background = '#ef4444';

                        results.push({ correct });
                        setTimeout(nextRound, 500);
                    };
                });
            });
        }

        nextRound();
    }

    function showResult(results) {
        if (!active) return;
        const correctCount = results.filter(r => r.correct).length;
        const age = calculator.getVisionAge(correctCount);
        state.save('vision', correctCount);
        saveResult('vision', age, `${correctCount}/${LEVELS.length}개`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result">${age}살</div>
                <p style="color:#888; margin: 5px 0 12px;">정답: <strong style="color:var(--text-color);">${correctCount} / ${LEVELS.length}</strong></p>
                ${renderHistoryInline('vision')}
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
