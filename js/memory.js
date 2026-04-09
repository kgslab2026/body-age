import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const MAX_SPAN = 9;

export function startMemoryTest() {
    let span = 3;
    let active = true;

    function goHome() { active = false; showMain(); }

    function showStart() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">기억력 테스트</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 20살 ~ 80살</div>
                <p style="line-height: 1.8;">숫자가 하나씩 표시됩니다.<br>모두 나온 뒤 <strong>순서대로</strong> 입력하세요.<br><br>3자리부터 시작해 틀릴 때까지 늘어납니다.</p>
                <button id="start-btn" class="btn" style="margin-top: 30px; width: 100%;">준비 완료</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('start-btn').onclick = runRound;
        });
    }

    function runRound() {
        const sequence = Array.from({ length: span }, () => String(Math.floor(Math.random() * 10)));
        showSequence(sequence, 0);
    }

    function showSequence(sequence, index) {
        if (!active) return;
        if (index >= sequence.length) {
            showInput(sequence);
            return;
        }

        const html = `
            <div class="memory-display">
                <button class="btn-home mem-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div class="mem-round">${span}자리 · ${index + 1} / ${span}</div>
                <div class="mem-digit">${sequence[index]}</div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            setTimeout(() => {
                if (!active) return;
                showBlank(sequence, index);
            }, 850);
        });
    }

    function showBlank(sequence, index) {
        if (!active) return;
        const html = `
            <div class="memory-display">
                <button class="btn-home mem-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div class="mem-round">${span}자리 · ${index + 1} / ${span}</div>
                <div class="mem-digit" style="opacity:0;">0</div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            setTimeout(() => {
                if (!active) return;
                showSequence(sequence, index + 1);
            }, 250);
        });
    }

    function showInput(sequence) {
        if (!active) return;
        let input = [];

        function render() {
            const slots = sequence.map((_, i) =>
                input[i] !== undefined
                    ? `<span class="mem-slot filled">${input[i]}</span>`
                    : `<span class="mem-slot empty">_</span>`
            ).join('');

            const keys = ['1','2','3','4','5','6','7','8','9','⌫','0',''];
            const pad = keys.map(k =>
                k === '' ? `<div></div>` :
                `<button class="mem-key" data-key="${k}">${k}</button>`
            ).join('');

            const html = `
                <div class="test-box">
                    <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                    <div class="mem-round" style="align-self:center; margin-bottom: 16px;">${span}자리를 순서대로 입력하세요</div>
                    <div class="mem-slots">${slots}</div>
                    <div class="mem-pad">${pad}</div>
                </div>
            `;
            navigate(html, () => {
                document.getElementById('btn-home').onclick = goHome;
                document.querySelectorAll('.mem-key').forEach(btn => {
                    btn.onclick = () => {
                        const key = btn.dataset.key;
                        if (key === '⌫') {
                            input.pop();
                            render();
                        } else if (input.length < sequence.length) {
                            input.push(key);
                            if (input.length === sequence.length) {
                                checkAnswer(input, sequence);
                            } else {
                                render();
                            }
                        }
                    };
                });
            });
        }

        render();
    }

    function checkAnswer(input, sequence) {
        const wrongCount = sequence.filter((d, i) => d !== input[i]).length;
        if (wrongCount === 0) {
            if (span >= MAX_SPAN) {
                showResult(span, false);
            } else {
                showCorrect();
            }
        } else {
            showWrong(sequence, input, wrongCount === 1);
        }
    }

    function showCorrect() {
        const next = span + 1;
        const html = `
            <div class="test-box" style="align-items:center; justify-content:center; min-height: 300px; gap: 12px;">
                <div style="font-size: 3.5rem;">✅</div>
                <div style="font-size: 1.4rem; font-weight: 900; color: #22c55e;">${span}자리 성공!</div>
                <div style="color: #888;">다음은 ${next}자리...</div>
            </div>
        `;
        navigate(html, () => {
            span++;
            setTimeout(() => { if (active) runRound(); }, 1000);
        });
    }

    function showWrong(sequence, input, partial) {
        const bonusMsg = partial
            ? `<div style="color:#fbbf24; font-size:0.9rem; margin-bottom:16px;">1개만 틀렸어요! +5살 보너스 적용 🎉</div>`
            : '';
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 3rem; margin: 16px auto;">${partial ? '🔥' : '❌'}</div>
                <div style="font-size: 1.3rem; font-weight: 900; color: #f87171; margin-bottom: 8px;">틀렸어요!</div>
                ${bonusMsg}
                <div style="width:100%; background:#1e293b; border-radius:14px; padding: 16px; margin-bottom: 8px;">
                    <div style="font-size:0.8rem; color:#64748b; margin-bottom:8px;">정답</div>
                    <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: 6px;">${sequence.join(' ')}</div>
                </div>
                <div style="width:100%; background:#1e293b; border-radius:14px; padding: 16px; margin-bottom: 24px;">
                    <div style="font-size:0.8rem; color:#64748b; margin-bottom:8px;">내 입력</div>
                    <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: 6px; color:#f87171;">${input.join(' ')}</div>
                </div>
                <button id="result-btn" class="btn" style="width:100%;">결과 보기</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('result-btn').onclick = () => showResult(span - 1, partial);
        });
    }

    function showResult(maxSpan, partial) {
        const baseAge = calculator.getMemoryAge(maxSpan);
        const age = partial ? Math.max(baseAge - 5, 15) : baseAge;
        state.save('memory', maxSpan);
        saveResult('memory', age, `${maxSpan}자리`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result">${age}살</div>
                <p style="color:#888; margin: 5px 0 12px;">최대 기억 자릿수: <strong style="color:var(--text-color);">${maxSpan}자리</strong></p>
                ${renderHistoryInline('memory')}
                ${renderTipsCard('memory')}
                <div style="display: flex; gap: 15px; width: 100%; margin-top: 12px;">
                    <button id="retry-btn" class="btn" style="flex:1; background: #475569;">다시하기</button>
                    <button id="next-btn" class="btn" style="flex:1;">다음 단계</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('retry-btn').onclick = startMemoryTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
