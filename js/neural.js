import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const TOTAL_ROUNDS = 5;
const LATE_THRESHOLD = 600;

export function startNeuralTest() {
    const times = [];
    let round = 1;

    function goHome() { showMain(); }

    function showStart() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">반응속도 테스트</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 15살 ~ 70살</div>
                <p style="line-height: 1.8;">화면이 <strong style="color:#22c55e;">초록색</strong>으로 바뀌는 순간<br>최대한 빠르게 탭하세요!<br><br>총 ${TOTAL_ROUNDS}번 측정 후 평균으로 계산합니다.</p>
                <button id="start-btn" class="btn" style="margin-top: 30px; width: 100%;">준비 완료</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('start-btn').onclick = () => runRound();
        });
    }

    function runRound() {
        let waiting = true;
        let startTime = null;
        let timer = null;

        const waitHtml = `
            <div class="reaction-box waiting" id="reaction-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div class="round-label">${round} / ${TOTAL_ROUNDS}</div>
                <div class="reaction-icon">🎯</div>
                <div class="reaction-msg">초록색으로 바뀌면 탭하세요!</div>
            </div>
        `;

        navigate(waitHtml, () => {
            document.getElementById('btn-home').onclick = () => {
                clearTimeout(timer);
                goHome();
            };

            const box = document.getElementById('reaction-box');
            const delay = 1500 + Math.random() * 2500;
            let tapPending = false; // rAF 완료 전 탭 여부

            timer = setTimeout(() => {
                waiting = false;
                box.classList.remove('waiting');
                box.classList.add('go');
                box.querySelector('.reaction-icon').textContent = '👆';
                box.querySelector('.reaction-msg').textContent = '지금!';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        startTime = performance.now();
                        if (tapPending) {
                            // rAF 완료 전에 탭이 이미 왔었으면 즉시 처리
                            const elapsed = 0;
                            times.push(elapsed);
                            if (round >= TOTAL_ROUNDS) {
                                showResult();
                            } else {
                                round++;
                                runRound();
                            }
                        }
                    });
                });
            }, delay);

            box.addEventListener('pointerdown', () => {
                if (waiting) {
                    clearTimeout(timer);
                    showEarlyTap();
                } else if (startTime === null) {
                    // go 상태이지만 rAF 아직 미완료 → 탭 예약
                    tapPending = true;
                } else {
                    const elapsed = Math.round(performance.now() - startTime);
                    startTime = null;
                    if (elapsed >= LATE_THRESHOLD) {
                        showLateTap();
                    } else {
                        times.push(elapsed);
                        if (round >= TOTAL_ROUNDS) {
                            showResult();
                        } else {
                            round++;
                            runRound();
                        }
                    }
                }
            });
        });
    }

    function showLateTap() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 3rem; margin: 20px 0;">⏱️</div>
                <div style="font-size: 1.4rem; font-weight: bold; color: #f87171;">너무 늦었어요!</div>
                <p style="color: #888; margin-top: 10px;">다시 측정합니다.</p>
                <button id="retry-btn" class="btn" style="margin-top: 30px; width: 100%;">다시 시도</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = () => runRound();
        });
    }

    function showEarlyTap() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 3rem; margin: 20px 0;">⚠️</div>
                <div style="font-size: 1.4rem; font-weight: bold; color: #f87171;">너무 일찍 탭했어요!</div>
                <p style="color: #888; margin-top: 10px;">초록색으로 바뀐 후에 탭하세요.</p>
                <button id="retry-btn" class="btn" style="margin-top: 30px; width: 100%;">다시 시도</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = () => runRound();
        });
    }

    function showResult() {
        const avg = Math.round(times.reduce((s, v) => s + v, 0) / times.length);
        const age = calculator.getReactionAge(avg);

        const roundList = times.map((t, i) =>
            `<div style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid #334155;">
                <span style="color:#888;">${i + 1}회</span>
                <span style="font-weight:bold;">${t} ms</span>
            </div>`
        ).join('');

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result">${age}살</div>
                <p style="color:#888; margin: 5px 0 12px;">평균 반응속도: <strong style="color:#fff;">${avg} ms</strong></p>
                <div style="width:100%; margin-bottom: 12px; font-size: 0.9rem;">${roundList}</div>
                ${renderHistoryInline('neural')}
                ${renderTipsCard('neural')}
                <div style="display: flex; gap: 15px; width: 100%; margin-top: 12px;">
                    <button id="retry-btn" class="btn" style="flex:1; background: #475569;">다시하기</button>
                    <button id="next-btn" class="btn" style="flex:1;">다음 단계</button>
                </div>
            </div>
        `;

        state.save('neural', avg);
        saveResult('neural', age, `${avg}ms`);
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = startNeuralTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
