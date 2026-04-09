import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const TOTAL_ROUNDS = 10;
const COLORS = [
    { name: '빨강', hex: '#ef4444', text: '#fff' },
    { name: '파랑', hex: '#3b82f6', text: '#fff' },
    { name: '초록', hex: '#22c55e', text: '#fff' },
    { name: '노랑', hex: '#eab308', text: '#1e293b' },
];

export function startAttentionTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    function showStart() {
        const exWord = COLORS[0]; // 빨강
        const exInk  = COLORS[1]; // 파랑으로 표시

        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">집중력 테스트</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 20살 ~ 80살</div>
                <p style="line-height: 1.8;">단어의 <strong>색깔</strong>을 탭하세요.<br>단어의 의미는 무시하세요!</p>
                <div style="background: #1e293b; border-radius: 20px; padding: 20px; width: 100%; margin: 4px 0; text-align: center;">
                    <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 10px; letter-spacing: 1px;">예시 — 이 글자의 색은?</div>
                    <div style="font-size: 52px; font-weight: 900; color: ${exInk.hex}; line-height: 1;">${exWord.name}</div>
                    <div style="margin-top: 12px; display: inline-block; background: ${exInk.hex}; color: ${exInk.text}; font-size: 0.9rem; font-weight: 900; padding: 6px 18px; border-radius: 999px;">정답: ${exInk.name}</div>
                </div>
                <p style="color: #888; font-size: 0.85rem; margin-top: 4px;">총 ${TOTAL_ROUNDS}문제 · 빠르고 정확하게!</p>
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
            if (results.length >= TOTAL_ROUNDS) {
                showResult(results);
                return;
            }

            const wordIdx = Math.floor(Math.random() * COLORS.length);
            let inkIdx;
            do { inkIdx = Math.floor(Math.random() * COLORS.length); } while (inkIdx === wordIdx);

            const word = COLORS[wordIdx];
            const ink  = COLORS[inkIdx];
            const shuffled = [...COLORS].sort(() => Math.random() - 0.5);

            const roundNum = results.length + 1;
            const btns = shuffled.map(c =>
                `<button class="stroop-btn" style="background:${c.hex}; color:${c.text};" data-name="${c.name}">${c.name}</button>`
            ).join('');

            const html = `
                <div class="stroop-box">
                    <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                    <div class="stroop-progress">${roundNum} / ${TOTAL_ROUNDS}</div>
                    <div class="stroop-word" id="stroop-word" style="color:${ink.hex};">${word.name}</div>
                    <div class="stroop-label">이 글자의 <strong>색</strong>은?</div>
                    <div class="stroop-pad">${btns}</div>
                </div>
            `;

            let startTime = null;
            navigate(html, () => {
                document.getElementById('btn-home').onclick = goHome;
                startTime = performance.now();

                document.querySelectorAll('.stroop-btn').forEach(btn => {
                    btn.onclick = () => {
                        if (!active) return;
                        const elapsed = Math.round(performance.now() - startTime);
                        const correct = btn.dataset.name === ink.name;

                        // 인라인 피드백
                        const wordEl = document.getElementById('stroop-word');
                        if (wordEl) {
                            wordEl.style.color = correct ? '#22c55e' : '#ef4444';
                            wordEl.textContent = correct ? '✓' : '✗';
                        }
                        document.querySelectorAll('.stroop-btn').forEach(b => b.disabled = true);

                        results.push({ correct, time: elapsed });
                        setTimeout(nextRound, 350);
                    };
                });
            });
        }

        nextRound();
    }

    function showLowAccuracy(correctCount) {
        if (!active) return;
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 3rem; margin: 20px 0;">🎯</div>
                <div style="font-size: 1.3rem; font-weight: 900; color: #f87171;">정확도가 너무 낮아요</div>
                <p style="color: #888; margin-top: 10px; line-height: 1.7;">정답: <strong style="color:#fff;">${correctCount}/${TOTAL_ROUNDS}</strong><br>단어의 <strong style="color:#fff;">색깔</strong>을 보고 눌러야 측정이 가능합니다.<br>빠르게만 누르면 정확한 측정이 안 돼요.</p>
                <button id="retry-btn" class="btn" style="margin-top: 24px; width: 100%;">다시 시도</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = startAttentionTest;
        });
    }

    function showResult(results) {
        if (!active) return;
        const correctCount = results.filter(r => r.correct).length;
        const wrongCount   = TOTAL_ROUNDS - correctCount;

        // 정확도 4개 미만이면 측정 불가
        if (correctCount < 4) {
            showLowAccuracy(correctCount);
            return;
        }

        // 평균 반응시간 + 오답 1개당 300ms 누적 페널티
        // (오답 10개 × 300 = 3000ms → 2600ms 상한 초과 → 최고령 보장)
        const avgRawTime    = Math.round(results.reduce((s, r) => s + r.time, 0) / results.length);
        const effectiveTime = Math.min(2600, avgRawTime + wrongCount * 300);
        const age = calculator.getAttentionAge(effectiveTime);

        state.save('attention', effectiveTime);
        saveResult('attention', age, `${avgRawTime}ms`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result">${age}살</div>
                <p style="color:#888; margin: 5px 0 12px;">
                    정답 <strong style="color:${wrongCount === 0 ? '#34d399' : 'var(--text-color)'};">${correctCount}/${TOTAL_ROUNDS}</strong>
                    · 반응시간 <strong style="color:var(--text-color);">${avgRawTime} ms</strong>
                    ${wrongCount > 0 ? `· 오답 페널티 <strong style="color:#f87171;">+${wrongCount * 300} ms</strong>` : ''}
                </p>
                ${renderHistoryInline('attention')}
                ${renderTipsCard('attention')}
                <div style="display: flex; gap: 15px; width: 100%; margin-top: 12px;">
                    <button id="retry-btn" class="btn" style="flex:1; background: #475569;">다시하기</button>
                    <button id="next-btn" class="btn" style="flex:1;">다음 단계</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('retry-btn').onclick = startAttentionTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
