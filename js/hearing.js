import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const testFreqs = [
    8000, 8200, 8400, 8600, 8800,
    9000, 9200, 9400, 9600, 9800,
    10000, 10200, 10400, 10600, 10800,
    11000, 11200, 11400, 11600, 11800,
    12000, 12200, 12400, 12600, 12800,
    13000, 13200, 13400, 13600, 13800,
    14000, 14200, 14400, 14600, 14800,
    15000, 15200, 15400, 15600, 15800,
    16000, 16200, 16400, 16600, 16800,
    17000, 17200, 17400, 17600, 17800,
    18000, 18400, 18800, 19200, 19600, 20000,
];

export function startHearingTest() {
    let low = 0;
    let high = testFreqs.length - 1;
    let bestHz = 1000;
    let stepCount = 1;
    let audioCtx;

    function playSound(hz, callback) {
        try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = hz;
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now + 1.4);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.5);

        oscillator.start(now);
        oscillator.stop(now + 1.5);
        setTimeout(callback, 1500);
        } catch (e) {
            showAudioError();
        }
    }

    function goHome() {
        if (audioCtx) audioCtx.close();
        showMain();
    }

    function showAudioError() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size:3rem; margin:20px 0; text-align:center;">🔇</div>
                <div style="font-size:1.2rem; font-weight:900; color:#f87171; text-align:center;">오디오를 사용할 수 없어요</div>
                <p style="color:#888; text-align:center; line-height:1.7; margin-top:10px;">
                    브라우저가 소리 재생을 차단하고 있어요.<br>
                    브라우저 설정에서 이 사이트의<br>
                    <strong style="color:#fff;">오디오 권한을 허용</strong>한 뒤 다시 시도해 주세요.
                </p>
                <button id="retry-btn" class="btn" style="width:100%; margin-top:24px;">다시 시도</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = startHearingTest;
        });
    }

    function askFreq() {
        if (low > high) {
            showResult(bestHz);
            return;
        }

        const mid = Math.floor((low + high) / 2);
        const targetHz = testFreqs[mid];

        const testHtml = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h3 style="color: #888; margin-top: 10px;">탐색 단계 ${stepCount}</h3>
                <div id="status-text" style="font-size: 1.5rem; margin: 30px 0;">곧 소리가 재생됩니다...</div>
                <div style="font-size: 4rem; color: var(--primary-color);">🔊</div>
            </div>
        `;

        navigate(testHtml, () => {
            document.getElementById('btn-home').onclick = goHome;

            setTimeout(() => {
                document.getElementById('status-text').innerHTML =
                    `<span style="color: var(--primary-color); font-weight:bold;">소리 재생 중! 집중하세요!</span>`;

                playSound(targetHz, () => {
                    const questionHtml = `
                        <div class="test-box">
                            <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                            <h3 style="color: #888; margin-top: 10px;">탐색 단계 ${stepCount}</h3>
                            <div style="font-size: 1.3rem; margin: 20px 0;">방금 소리가 들렸나요?</div>
                            <div style="display: flex; gap: 15px; justify-content: center; width: 100%;">
                                <button id="btn-yes" class="btn answer-btn yes-btn">🟢<br>들려요</button>
                                <button id="btn-no" class="btn answer-btn no-btn">🔴<br>안 들려요</button>
                            </div>
                            <div style="margin-top: 25px;">
                                <button id="btn-replay" class="btn" style="background: transparent; border: 1px solid #888; color: #888; padding: 10px 20px; font-size: 1rem;">다시 듣기 🔄</button>
                            </div>
                        </div>
                    `;

                    navigate(questionHtml, () => {
                        const yesBtn = document.getElementById('btn-yes');
                        const noBtn = document.getElementById('btn-no');

                        function setAnswerState(choice) {
                            yesBtn.classList.toggle('selected', choice === 'yes');
                            noBtn.classList.toggle('selected', choice === 'no');
                        }

                        document.getElementById('btn-home').onclick = goHome;
                        yesBtn.addEventListener('mousedown', () => setAnswerState('yes'));
                        yesBtn.addEventListener('touchstart', () => setAnswerState('yes'));
                        noBtn.addEventListener('mousedown', () => setAnswerState('no'));
                        noBtn.addEventListener('touchstart', () => setAnswerState('no'));

                        yesBtn.onclick = () => {
                            setAnswerState('yes');
                            bestHz = targetHz;
                            low = mid + 1;
                            stepCount++;
                            askFreq();
                        };
                        noBtn.onclick = () => {
                            setAnswerState('no');
                            high = mid - 1;
                            stepCount++;
                            askFreq();
                        };
                        document.getElementById('btn-replay').onclick = () => {
                            playSound(targetHz, () => {});
                        };
                    });
                });
            }, 1000);
        });
    }

    const startHtml = `
        <div class="test-box">
            <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
            <h2 style="color: var(--primary-color); margin-top: 10px;">정밀 탐색 모드</h2>
            <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 15살 ~ 70살</div>
            <p style="line-height: 1.6;">소리가 들리는지 <strong>예/아니오</strong>로만 답해주세요.<br>약 4~5번의 질문으로 정확한 나이를 찾아냅니다.</p>
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:16px; text-align:left;">
                <div style="display:flex; align-items:center; gap:8px; background:rgba(108,99,255,0.07); border-radius:10px; padding:10px 14px; font-size:0.88rem; color:var(--text-color);">
                    <span style="font-size:1.1rem;">🎧</span>
                    <span>이어폰 착용을 권장합니다</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; background:rgba(108,99,255,0.07); border-radius:10px; padding:10px 14px; font-size:0.88rem; color:var(--text-color);">
                    <span style="font-size:1.1rem;">🔊</span>
                    <span>볼륨을 <strong>60~80%</strong> 수준으로 높여주세요</span>
                </div>
            </div>
            <button id="start-test-btn" class="btn" style="margin-top:22px; width: 100%;">준비 완료</button>
        </div>
    `;

    navigate(startHtml, () => {
        document.getElementById('btn-home').onclick = goHome;
        document.getElementById('start-test-btn').onclick = () => {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                showAudioError();
                return;
            }
            askFreq();
        };
    });
}

function showResult(hz) {
    const age = calculator.getHearingAge(hz);
    state.save('hearing', hz);
    saveResult('hearing', age, `${hz.toLocaleString()}Hz`);

    let specialMessage = "";
    let ageDisplay = `${age}세`;

    if (hz >= 20000) {
        ageDisplay = "15세";
        specialMessage = `<p style="color: var(--primary-color); background: rgba(56, 189, 248, 0.1); padding: 15px; border-radius: 10px;">🌟 대박! 기계가 측정할 수 없는<br>신비로운 '초월 청력'을 가지셨네요!</p>`;
    } else {
        specialMessage = `<p>최종 인식 주파수: <strong>${hz.toLocaleString()} Hz</strong></p>`;
    }

    const resultHtml = `
        <div class="result-box">
            <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
            <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
            <div class="age-result">${ageDisplay}</div>
            <div style="margin: 20px 0;">${specialMessage}</div>
            ${renderHistoryInline('hearing')}
            ${renderTipsCard('hearing')}
            <div style="display: flex; gap: 15px; width: 100%; margin-top: 12px;">
                <button id="retry-btn" class="btn" style="flex:1; background: #475569;">다시하기</button>
                <button id="next-btn" class="btn" style="flex:1;">다음 단계</button>
            </div>
        </div>
    `;

    navigate(resultHtml, () => {
        initTipsCard();
        document.getElementById('btn-home').onclick = () => showMain();
        document.getElementById('retry-btn').onclick = startHearingTest;
        document.getElementById('next-btn').onclick = () => showMain();
    });
}