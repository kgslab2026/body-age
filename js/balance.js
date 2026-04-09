import { navigate, state, showMain } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult, renderHistoryInline } from './history.js';

const TEST_DURATION = 10;

export function startBalanceTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div class="mobile-only-box" style="margin-top:20px;">
                    <div class="mobile-only-icon">📱</div>
                    <div class="mobile-only-title">모바일 전용 테스트예요</div>
                    <div class="mobile-only-desc">균형감각 테스트는 스마트폰의<br>자이로스코프 센서를 사용합니다.<br>모바일 기기에서 접속해 주세요!</div>
                </div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
        });
        return;
    }

    function showStart() {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="color: var(--primary-color); margin-top: 10px;">균형감각 테스트</h2>
                <div style="display:inline-block; background: rgba(108,99,255,0.1); color: var(--primary-color); font-size: 0.85rem; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 14px;">측정 범위: 20살 ~ 80살</div>
                <p style="line-height: 1.8;">
                    📱 폰을 앞으로 들고<br>
                    <strong>한 발로 서서 ${TEST_DURATION}초</strong> 버텨보세요!<br><br>
                    폰의 흔들림으로 균형감각을 측정합니다.
                </p>
                <div style="background: rgba(108,99,255,0.07); border-radius: 14px; padding: 14px 16px; width: 100%; margin-top: 8px; font-size: 0.85rem; color: #888; line-height: 1.6;">
                    ⚠️ 안전한 곳에서 넘어지지 않게 주의하세요
                </div>
                <button id="start-btn" class="btn" style="margin-top: 24px; width: 100%;">준비 완료</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('start-btn').onclick = requestPermission;
        });
    }

    function requestPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') showCountdown(3);
                    else showPermissionError();
                })
                .catch(() => showPermissionError());
        } else {
            showCountdown(3);
        }
    }

    function showPermissionError() {
        if (!active) return;
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 3rem; margin: 20px auto; text-align:center; width:100%;">⚠️</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #f87171; text-align:center; width:100%;">센서 권한이 필요합니다</div>
                <p style="color: #888; text-align:center; width:100%;">설정 → Safari → 동작 및 방향 접근 허용</p>
                <button id="back-btn" class="btn" style="margin-top: 24px; width: 100%;">돌아가기</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('back-btn').onclick = showStart;
        });
    }

    function showCountdown(count) {
        if (!active) return;
        if (count === 0) { runTest(); return; }
        const html = `
            <div class="balance-display">
                <div class="balance-countdown">${count}</div>
                <div style="color:rgba(255,255,255,0.5); font-size:0.95rem;">한 발로 서세요!</div>
            </div>
        `;
        navigate(html, () => {
            setTimeout(() => { if (active) showCountdown(count - 1); }, 1000);
        });
    }

    function runTest() {
        if (!active) return;

        const readings = [];
        let refBeta = null;
        let refGamma = null;
        let timeLeft = TEST_DURATION;
        let orientHandler = null;
        let tick = null;

        function cleanup() {
            if (orientHandler) window.removeEventListener('deviceorientation', orientHandler);
            if (tick) clearInterval(tick);
        }

        const html = `
            <div class="balance-display">
                <div class="balance-timer" id="bal-timer">${TEST_DURATION}</div>
                <div class="balance-ring-wrap">
                    <div class="balance-ring"></div>
                    <div class="balance-dot" id="bal-dot"></div>
                </div>
                <div style="color:rgba(255,255,255,0.5); font-size:0.9rem;">최대한 안정적으로!</div>
            </div>
        `;

        navigate(html, () => {
            orientHandler = (e) => {
                if (!active) return;
                const beta = e.beta ?? 0;
                const gamma = e.gamma ?? 0;
                if (refBeta === null) { refBeta = beta; refGamma = gamma; }

                readings.push({ beta, gamma });

                const dx = Math.max(-60, Math.min(60, (gamma - refGamma) * 3));
                const dy = Math.max(-60, Math.min(60, (beta - refBeta) * 3));
                const dot = document.getElementById('bal-dot');
                if (dot) {
                    dot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    dot.style.background = dist < 20 ? '#22c55e' : dist < 45 ? '#fbbf24' : '#f87171';
                }
            };

            window.addEventListener('deviceorientation', orientHandler);

            tick = setInterval(() => {
                if (!active) { cleanup(); return; }
                timeLeft--;
                const timerEl = document.getElementById('bal-timer');
                if (timerEl) timerEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    cleanup();
                    calculateResult(readings);
                }
            }, 1000);
        });
    }

    function calculateResult(readings) {
        if (!active) return;
        if (readings.length < 20) {
            showSensorError();
            return;
        }
        const betaMean = readings.reduce((s, r) => s + r.beta, 0) / readings.length;
        const gammaMean = readings.reduce((s, r) => s + r.gamma, 0) / readings.length;
        const sway = Math.sqrt(
            readings.reduce((s, r) =>
                s + Math.pow(r.beta - betaMean, 2) + Math.pow(r.gamma - gammaMean, 2), 0)
            / readings.length
        );
        showResult(sway);
    }

    function showSensorError() {
        if (!active) return;
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <div style="font-size: 3rem; margin: 20px auto; text-align:center; width:100%;">📱</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #f87171; width:100%; text-align:center;">센서를 감지할 수 없어요</div>
                <p style="color: #888; text-align:center; width:100%; line-height: 1.6;">
                    이 기기는 자이로스코프를 지원하지 않거나, 권한이 거부되었어요.<br>
                    설정에서 모션 센서 권한을 허용하고 다시 시도해주세요.
                </p>
                <div style="display: flex; gap: 10px; width: 100%; margin-top: 20px;">
                    <button id="retry-btn" class="btn" style="flex:1; background: #fbbf24; color: #1e293b;">재시도</button>
                    <button id="back-btn" class="btn" style="flex:1;">돌아가기</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('retry-btn').onclick = () => requestPermission();
            document.getElementById('back-btn').onclick = showStart;
        });
    }

    function showResult(sway) {
        if (!active) return;
        const age = calculator.getBalanceAge(sway);
        const ageLabel = age >= 80 ? '80살 이상' : `${age}살~${age + 4}살`;
        state.save('balance', sway);
        saveResult('balance', age, `${sway.toFixed(1)}°`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">🏠</span><span>처음으로</span></button>
                <h2 style="font-size: 1.8rem; margin-top: 10px;">측정 결과</h2>
                <div class="age-result" style="font-size: 48px;">${ageLabel}</div>
                <p style="color:#888; margin: 5px 0 12px;">흔들림 수치: <strong style="color:var(--text-color);">${sway.toFixed(1)}°</strong></p>
                ${renderHistoryInline('balance')}
                ${renderTipsCard('balance')}
                <div style="display: flex; gap: 15px; width: 100%; margin-top: 12px;">
                    <button id="retry-btn" class="btn" style="flex:1; background: #475569;">다시하기</button>
                    <button id="next-btn" class="btn" style="flex:1;">다음 단계</button>
                </div>
            </div>
        `;
        navigate(html, () => {
            initTipsCard();
            document.getElementById('btn-home').onclick = showMain;
            document.getElementById('retry-btn').onclick = startBalanceTest;
            document.getElementById('next-btn').onclick = showMain;
        });
    }

    showStart();
}
