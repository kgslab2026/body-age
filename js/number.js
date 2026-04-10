import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const TOTAL_ROUNDS = 2;
const TIME_LIMIT = 60000;

export function startNumberTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    function showStart() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">숫자 순서 테스트</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 15살 ~ 70살</div>
                <p style="line-height: 1.8;">1부터 16까지 <strong>순서대로</strong> 빠르게 탭하세요!<br>총 ${TOTAL_ROUNDS}라운드 · 각 최대 60초</p>
                <div style="background: #1e293b; border-radius: 14px; padding: 14px 16px; width: 100%; margin-top: 8px;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                        ${Array.from({ length: 16 }, (_, i) =>
                            `<div style="aspect-ratio:1; background:#0f172a; border:2px solid #334155; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1rem; color:#64748b;">${i + 1}</div>`
                        ).join('')}
                    </div>
                </div>
                <button id="start-btn" class="btn" style="margin-top: 24px; width: 100%;">준비 완료</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('start-btn').onclick = () => runRounds();
        });
    }

    function runRounds() {
        const times = [];

        function runRound(roundNum) {
            if (!active) return;

            const numbers = Array.from({ length: 16 }, (_, i) => i + 1);
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }

            let nextExpected = 1;
            let startTime = null;
            let timerInterval = null;
            let timeoutHandle = null;

            function cleanup() {
                clearInterval(timerInterval);
                clearTimeout(timeoutHandle);
            }

            const cells = numbers.map(n =>
                `<button
                    data-num="${n}"
                    style="aspect-ratio:1; background:#1e293b; border:2px solid #334155; border-radius:10px;
                           font-size:1.3rem; font-weight:900; color:var(--text-color); cursor:pointer;
                           transition:background 0.15s, border-color 0.15s;"
                >${n}</button>`
            ).join('');

            const html = `
                <div class="test-box" style="gap: 10px;">
                    <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <div style="font-size:0.9rem; color:#888;">${roundNum} / ${TOTAL_ROUNDS} 라운드</div>
                        <div id="num-timer" style="font-size:1.5rem; font-weight:900; color:var(--primary-color);">60</div>
                    </div>
                    <div style="font-size:0.85rem; color:#64748b; align-self:flex-start;">
                        다음: <strong id="next-num" style="color:var(--text-color); font-size:1rem;">1</strong>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; width:100%;" id="number-grid">
                        ${cells}
                    </div>
                </div>
            `;

            navigate(html, () => {
                document.getElementById('btn-home').onclick = () => { cleanup(); goHome(); };
                startTime = performance.now();

                timerInterval = setInterval(() => {
                    if (!active) { cleanup(); return; }
                    const elapsed = performance.now() - startTime;
                    const remaining = Math.max(0, Math.ceil((TIME_LIMIT - elapsed) / 1000));
                    const timerEl = document.getElementById('num-timer');
                    if (timerEl) timerEl.textContent = remaining;
                }, 200);

                timeoutHandle = setTimeout(() => {
                    if (!active) return;
                    cleanup();
                    times.push(TIME_LIMIT);
                    if (roundNum < TOTAL_ROUNDS) {
                        showBetweenRounds(roundNum + 1, TIME_LIMIT, () => runRound(roundNum + 1));
                    } else {
                        showResult(times);
                    }
                }, TIME_LIMIT);

                document.querySelectorAll('#number-grid button').forEach(cell => {
                    cell.onclick = () => {
                        if (!active) return;
                        const num = parseInt(cell.dataset.num);
                        if (num !== nextExpected) return;

                        cell.style.background = 'var(--primary-color)';
                        cell.style.borderColor = 'var(--primary-color)';
                        cell.style.color = '#fff';
                        cell.disabled = true;
                        nextExpected++;

                        const nextEl = document.getElementById('next-num');
                        if (nextEl) nextEl.textContent = nextExpected <= 16 ? nextExpected : '완료!';

                        if (nextExpected > 16) {
                            cleanup();
                            const elapsed = Math.round(performance.now() - startTime);
                            times.push(elapsed);
                            if (roundNum < TOTAL_ROUNDS) {
                                showBetweenRounds(roundNum + 1, elapsed, () => runRound(roundNum + 1));
                            } else {
                                showResult(times);
                            }
                        }
                    };
                });
            });
        }

        runRound(1);
    }

    function showBetweenRounds(nextRound, prevElapsed, onContinue) {
        if (!active) return;
        const timeText = prevElapsed >= TIME_LIMIT
            ? '60.0초 (시간 초과)'
            : `${(prevElapsed / 1000).toFixed(2)}초`;
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 2.5rem; margin: 20px 0;">${prevElapsed >= TIME_LIMIT ? '⏱️' : '✅'}</div>
                <div style="font-size: 1.3rem; font-weight: 900; color: ${prevElapsed >= TIME_LIMIT ? '#f87171' : '#22c55e'};">1라운드 완료</div>
                <p style="color: #888; margin-top: 8px;">${timeText}</p>
                <button id="next-btn" class="btn" style="margin-top: 24px; width: 100%;">2라운드 시작</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('next-btn').onclick = onContinue;
        });
    }

    function showResult(times) {
        if (!active) return;
        const avgMs = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
        const age = calculator.getNumberAge(avgMs);
        state.save('number', avgMs);
        saveResult('number', age, `${(avgMs / 1000).toFixed(1)}초`);

        const roundList = times.map((t, i) =>
            `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #334155;">
                <span style="color:#888;">${i + 1}라운드</span>
                <span style="font-weight:bold;">${t >= TIME_LIMIT ? '60.00초 (시간 초과)' : (t / 1000).toFixed(2) + '초'}</span>
            </div>`
        ).join('');

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result">${age}살</div>
                <p style="color:#888; margin: 5px 0 12px;">평균 시간: <strong style="color:#fff;">${(avgMs / 1000).toFixed(2)}초</strong></p>
                <div style="width:100%; margin-bottom:12px; font-size:0.9rem;">${roundList}</div>
                ${renderHistoryInline('number')}
                ${renderTipsCard('number')}
                <div style="display:flex; gap:15px; width:100%; margin-top:12px;">
                    <button id="retry-btn" class="btn" style="flex:1; background:#475569;">다시하기</button>
                    <button id="next-btn" class="btn" style="flex:1;">다음 단계</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('retry-btn').onclick = startNumberTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
