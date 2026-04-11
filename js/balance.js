import { navigate, state, showMain, HOME_ICON } from './app.js';
import { calculator } from './calculator.js';
import { renderTipsCard, initTipsCard } from './tips.js';
import { saveResult } from './history.js';

const TEST_DURATION = 10;

export function startBalanceTest() {
    let active = true;
    function goHome() { active = false; showMain(); }

    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
        const html = `
            <div class="test-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="mobile-only-box with-top-gap">
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
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <h2 class="test-title-accent">균형감각 테스트</h2>
                <div class="test-range-pill">측정 범위: 15살 ~ 70살</div>
                <p class="test-copy-relaxed">
                    📱 화면이 위를 향하도록 폰을 수평으로 들고<br>
                    <strong>한 발로 서서 ${TEST_DURATION}초</strong> 버텨보세요!<br><br>
                    폰의 흔들림으로 균형감각을 측정합니다.
                </p>
                <div class="test-note-card">
                    ⚠️ 안전한 곳에서 넘어지지 않게 주의하세요
                </div>
                <button id="start-btn" class="btn btn-start-wide">준비 완료</button>
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
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="test-center-icon">⚠️</div>
                <div class="test-error-title">센서 권한이 필요합니다</div>
                <p class="test-error-desc">설정 → Safari → 동작 및 방향 접근 허용</p>
                <button id="back-btn" class="btn btn-start-wide">돌아가기</button>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;
            document.getElementById('back-btn').onclick = showStart;
        });
    }

    function showCountdown(startCount) {
        if (!active) return;

        const html = `
            <div class="balance-display balance-display--ready">
                <button class="btn-home btn-home-overlay" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="balance-phase-badge balance-phase-badge--ready">준비 중</div>
                <div class="balance-countdown" id="cd-count">${startCount}</div>
                <div class="balance-ring-wrap">
                    <div class="balance-ring"></div>
                    <div class="balance-dot" id="cd-dot"></div>
                </div>
                <div class="countdown-hint">볼을 가운데로 맞춰주세요!</div>
            </div>
        `;
        navigate(html, () => {
            document.getElementById('btn-home').onclick = goHome;

            let count = startCount;

            const cdHandler = (e) => {
                if (!active) return;
                const beta = e.beta ?? 0;
                const gamma = e.gamma ?? 0;
                const dx = Math.max(-60, Math.min(60, gamma * 3));
                const dy = Math.max(-60, Math.min(60, beta * 3));
                const dot = document.getElementById('cd-dot');
                if (dot) {
                    dot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    dot.style.background = dist < 20 ? '#22c55e' : dist < 45 ? '#fbbf24' : '#f87171';
                }
            };
            window.addEventListener('deviceorientation', cdHandler);

            const tick = setInterval(() => {
                if (!active) {
                    clearInterval(tick);
                    window.removeEventListener('deviceorientation', cdHandler);
                    return;
                }
                count--;
                if (count <= 0) {
                    clearInterval(tick);
                    window.removeEventListener('deviceorientation', cdHandler);
                    runTest();
                } else {
                    const cdEl = document.getElementById('cd-count');
                    if (cdEl) cdEl.textContent = count;
                }
            }, 1000);
        });
    }

    function runTest() {
        if (!active) return;

        const readings = [];
        let timeLeft = TEST_DURATION;
        let orientHandler = null;
        let tick = null;

        function cleanup() {
            if (orientHandler) window.removeEventListener('deviceorientation', orientHandler);
            if (tick) clearInterval(tick);
        }

        const html = `
            <div class="balance-display balance-display--testing">
                <div class="balance-phase-badge balance-phase-badge--testing">
                    <span class="balance-phase-dot"></span>측정 중
                </div>
                <div class="balance-timer" id="bal-timer">${TEST_DURATION}</div>
                <div class="balance-ring-wrap">
                    <div class="balance-ring"></div>
                    <div class="balance-dot" id="bal-dot"></div>
                </div>
                <div class="balance-progress-wrap">
                    <div class="balance-progress-bar" id="bal-progress"></div>
                </div>
                <div class="balance-live-hint">최대한 안정적으로 버텨주세요!</div>
            </div>
        `;

        navigate(html, () => {
            orientHandler = (e) => {
                if (!active) return;
                const beta = e.beta ?? 0;
                const gamma = e.gamma ?? 0;

                readings.push({ beta, gamma });

                // 절대값 기준(beta=0, gamma=0)으로 볼 위치 계산
                const dx = Math.max(-60, Math.min(60, gamma * 3));
                const dy = Math.max(-60, Math.min(60, beta * 3));
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
                const progressEl = document.getElementById('bal-progress');
                if (progressEl) progressEl.style.width = `${((TEST_DURATION - timeLeft) / TEST_DURATION) * 100}%`;
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
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <div class="test-center-icon">📱</div>
                <div class="test-error-title">센서를 감지할 수 없어요</div>
                <p class="test-error-desc">
                    이 기기는 자이로스코프를 지원하지 않거나, 권한이 거부되었어요.<br>
                    설정에서 모션 센서 권한을 허용하고 다시 시도해주세요.
                </p>
                <div class="test-action-row">
                    <button id="retry-btn" class="btn btn-warn">재시도</button>
                    <button id="back-btn" class="btn btn-flex">돌아가기</button>
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
        const ageLabel = `${age}살`;
        state.save('balance', sway);
        saveResult('balance', age, `${sway.toFixed(1)}°`);

        const html = `
            <div class="result-box">
                <button class="btn-home" id="btn-home"><span class="btn-home-icon">${HOME_ICON}</span><span>처음으로</span></button>
                <h2 class="result-title">측정 결과</h2>
                <div class="age-result" style="font-size: 48px;">${ageLabel}</div>
                <p class="result-sub-note">흔들림 수치: <strong>${sway.toFixed(1)}°</strong></p>
${renderTipsCard('balance')}
                <div class="test-action-row test-action-row--compact">
                    <button id="retry-btn" class="btn btn-ghost-light">다시하기</button>
                    <button id="next-btn" class="btn btn-flex">다음 단계</button>
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
